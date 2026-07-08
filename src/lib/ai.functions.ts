import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

async function callAI(system: string, user: string): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`AI gateway ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

const GenerateInput = z.object({
  topic: z.string().max(500).optional().default(""),
});

export const generatePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => GenerateInput.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, headline, bio, specialty, industry, goal, tone, language, trial_posts_used, trial_posts_limit, linkedin_connected")
      .eq("id", userId)
      .maybeSingle();

    if (!profile) throw new Error("Profile not found");

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", userId)
      .maybeSingle();

    const isPro = sub && sub.status === "active" && sub.plan !== "free";
    const trialLeft = (profile.trial_posts_limit ?? 3) - (profile.trial_posts_used ?? 0);
    if (!isPro && trialLeft <= 0) {
      throw new Error(
        profile.language === "ar"
          ? "انتهت المنشورات التجريبية. الرجاء الاشتراك للمتابعة."
          : "Trial posts exhausted. Please subscribe to continue."
      );
    }

    const lang = profile.language === "en" ? "English" : "Arabic";
    const toneMap: Record<string, string> = {
      friendly: "warm and friendly",
      formal: "professional and formal",
      inspiring: "inspiring and motivational",
      educational: "educational and informative",
      witty: "witty and clever",
    };
    const toneDesc = toneMap[profile.tone ?? "friendly"];

    const system = `You are an expert LinkedIn ghostwriter. Write short-to-medium LinkedIn posts in ${lang} with a ${toneDesc} tone. Use line breaks and 1-3 relevant emojis. End with 3-5 relevant hashtags. Never use markdown headings.`;

    const userPrompt = `Write ONE LinkedIn post for a professional.
Name: ${profile.full_name ?? ""}
Headline: ${profile.headline ?? ""}
Specialty: ${profile.specialty ?? ""}
Industry: ${profile.industry ?? ""}
Their goal from posting: ${profile.goal ?? "grow their personal brand and attract job opportunities"}
${data.topic ? `Specific topic requested: ${data.topic}` : "Choose a fresh topic that fits their expertise."}
Return only the post content, no preface.`;

    const content = await callAI(system, userPrompt);

    const { data: inserted, error } = await supabase
      .from("posts")
      .insert({
        user_id: userId,
        content,
        language: profile.language,
        status: "draft",
        source: "ai",
      })
      .select()
      .single();
    if (error) throw error;

    if (!isPro) {
      await supabase
        .from("profiles")
        .update({ trial_posts_used: (profile.trial_posts_used ?? 0) + 1 })
        .eq("id", userId);
    }

    return inserted;
  });

export const analyzeProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, headline, bio, specialty, industry, goal, language")
      .eq("id", userId)
      .maybeSingle();
    if (!profile) throw new Error("Profile not found");

    const lang = profile.language === "en" ? "English" : "Arabic";
    const system = `You are a LinkedIn coach. Return STRICT JSON only, no prose, no markdown, matching:
{"recommendations":[{"category":"headline|about|experience|content|network","title":"...","content":"...","priority":1}]}
Give 4-6 specific, actionable recommendations in ${lang}.`;
    const userPrompt = `Profile:
Full name: ${profile.full_name ?? "—"}
Headline: ${profile.headline ?? "—"}
Bio: ${profile.bio ?? "—"}
Specialty: ${profile.specialty ?? "—"}
Industry: ${profile.industry ?? "—"}
Goal: ${profile.goal ?? "—"}`;

    const raw = await callAI(system, userPrompt);
    const jsonStr = raw.replace(/```json|```/g, "").trim();
    let parsed: { recommendations: Array<{ category: string; title: string; content: string; priority: number }> };
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      throw new Error("AI returned invalid JSON");
    }

    await supabase.from("ai_recommendations").delete().eq("user_id", userId);
    const rows = parsed.recommendations.map((r) => ({
      user_id: userId,
      category: r.category,
      title: r.title,
      content: r.content,
      priority: r.priority ?? 1,
    }));
    if (rows.length) await supabase.from("ai_recommendations").insert(rows);
    return { count: rows.length };
  });
