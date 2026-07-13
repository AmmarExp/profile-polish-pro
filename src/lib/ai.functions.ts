import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const GATEWAY_CHAT_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const GATEWAY_IMAGE_URL = "https://ai.gateway.lovable.dev/v1/images/generations";
const CHAT_MODEL = "google/gemini-2.5-flash";
const IMAGE_MODEL = "google/gemini-2.5-flash-image";

async function callAI(system: string, user: string, opts?: { json?: boolean }): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("مفتاح الذكاء الاصطناعي غير مهيأ");
  const body: any = {
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  };
  if (opts?.json) body.response_format = { type: "json_object" };

  const res = await fetch(GATEWAY_CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if (res.status === 429) throw new Error("تم تجاوز حد الاستخدام، حاول لاحقاً");
    if (res.status === 402) throw new Error("انتهت أرصدة الذكاء الاصطناعي");
    throw new Error("تعذر توليد المحتوى");
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

function parseJsonLoose<T>(raw: string): T {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  try { return JSON.parse(cleaned) as T; } catch {
    const match = cleaned.match(/[\[{][\s\S]*[\]}]/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error("تعذر قراءة استجابة الذكاء الاصطناعي");
  }
}

// ─────────────────────────────────────────────────────────
// Legacy: generatePost (kept for backwards compatibility)
// ─────────────────────────────────────────────────────────

const GenerateInput = z.object({ topic: z.string().max(500).optional().default("") });

export const generatePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => GenerateInput.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, headline, bio, specialty, industry, goal, tone, language, trial_posts_used, trial_posts_limit, linkedin_connected")
      .eq("id", userId).maybeSingle();
    if (!profile) throw new Error("الملف الشخصي غير موجود");

    const { data: sub } = await supabase
      .from("subscriptions").select("plan, status").eq("user_id", userId).maybeSingle();
    const isPro = sub && sub.status === "active" && sub.plan !== "free";
    const trialLeft = (profile.trial_posts_limit ?? 3) - (profile.trial_posts_used ?? 0);
    if (!isPro && trialLeft <= 0) throw new Error("انتهت المنشورات التجريبية. الرجاء الاشتراك للمتابعة.");

    const lang = profile.language === "en" ? "English" : "Arabic";
    const toneMap: Record<string, string> = { friendly: "warm and friendly", formal: "professional and formal", inspiring: "inspiring and motivational", educational: "educational and informative", witty: "witty and clever" };
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
    const { data: inserted, error } = await supabase.from("posts")
      .insert({ user_id: userId, content, language: profile.language, status: "draft", source: "ai" })
      .select().single();
    if (error) throw error;
    if (!isPro) await supabase.from("profiles").update({ trial_posts_used: (profile.trial_posts_used ?? 0) + 1 }).eq("id", userId);
    return inserted;
  });

export const analyzeProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles")
      .select("full_name, headline, bio, specialty, industry, goal, language").eq("id", userId).maybeSingle();
    if (!profile) throw new Error("الملف الشخصي غير موجود");
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
    const raw = await callAI(system, userPrompt, { json: true });
    const parsed = parseJsonLoose<{ recommendations: Array<{ category: string; title: string; content: string; priority: number }> }>(raw);
    await supabase.from("ai_recommendations").delete().eq("user_id", userId);
    const rows = parsed.recommendations.map((r) => ({ user_id: userId, category: r.category, title: r.title, content: r.content, priority: r.priority ?? 1 }));
    if (rows.length) await supabase.from("ai_recommendations").insert(rows);
    return { count: rows.length };
  });

// ─────────────────────────────────────────────────────────
// Per-spec AI functions
// ─────────────────────────────────────────────────────────

const ProfileShape = z.object({
  full_name: z.string().nullable().optional(),
  specialty: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  goal: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
}).partial();

const GenPostInput = z.object({
  topic: z.string().min(1).max(500),
  tone: z.string().min(1).max(60),
  profile: ProfileShape.optional(),
  promptOverride: z.string().max(4000).optional(),
});

export const generateLinkedInPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => GenPostInput.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    let profile = data.profile ?? null;
    if (!profile) {
      const { data: p } = await supabase.from("profiles")
        .select("full_name, specialty, industry, goal, language").eq("id", userId).maybeSingle();
      profile = p ?? {};
    }
    const language = profile.language === "en" ? "English" : "Arabic";
    const languageAr = language === "English" ? "الإنجليزية" : "العربية";

    // Load per-tone prompt from tone_prompts, fall back to default
    let baseSystem = "";
    if (data.promptOverride && data.promptOverride.trim()) {
      baseSystem = data.promptOverride.trim();
    } else {
      const { data: row } = await supabase.from("tone_prompts")
        .select("system_prompt").eq("tone", data.tone).maybeSingle();
      if (row?.system_prompt && row.system_prompt.trim()) {
        baseSystem = row.system_prompt.trim();
      } else {
        baseSystem = `أنت كاتب محتوى محترف متخصص في LinkedIn. اكتب بأسلوب ${data.tone}.`;
      }
    }

    const system = `${baseSystem}

سياق المستخدم:
- الاسم: ${profile.full_name ?? "—"}
- التخصص: ${profile.specialty ?? "—"}
- القطاع: ${profile.industry ?? "—"}
- الهدف: ${profile.goal ?? "—"}
- لغة الكتابة: ${languageAr}

قواعد إلزامية:
- بين 150 و 400 كلمة
- فقرات قصيرة مع مسافات بينها
- ينتهي بـ 3-5 هاشتاقات ذات صلة
- لا يبدأ بعبارات مبتذلة مثل 'يسعدني' أو 'بكل سرور'
- لا يتجاوز 3000 حرف`;

    const content = await callAI(system, `اكتب منشوراً عن: ${data.topic}`);
    return content.trim();
  });

const WeeklyInput = z.object({ profile: ProfileShape.optional() });

export const generateWeeklyPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => WeeklyInput.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    let profile = data.profile ?? null;
    if (!profile) {
      const { data: p } = await supabase.from("profiles")
        .select("specialty, industry, goal, tone").eq("id", userId).maybeSingle();
      profile = p ?? {};
    }
    const system = `أنت مخطط محتوى LinkedIn. اقترح 3 أفكار منشورات لهذا الأسبوع مناسبة لمتخصص في ${profile.specialty ?? "—"} بقطاع ${profile.industry ?? "—"} هدفه ${profile.goal ?? "—"}.
أعد JSON فقط بهذا الشكل بدون أي نص إضافي:
{"items":[
  { "day": "السبت", "topic": "...", "tone": "ملهم" },
  { "day": "الاثنين", "topic": "...", "tone": "تعليمي" },
  { "day": "الأربعاء", "topic": "...", "tone": "ودّي" }
]}`;
    const raw = await callAI(system, "أعد الخطة الآن.", { json: true });
    const parsed = parseJsonLoose<{ items: Array<{ day: string; topic: string; tone: string }> }>(raw);
    return Array.isArray(parsed) ? (parsed as any) : parsed.items;
  });

const HeadlineInput = z.object({ headline: z.string().min(1).max(500) });
export const improveHeadline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => HeadlineInput.parse(v))
  .handler(async ({ data }) => {
    const system = `أنت خبير في LinkedIn. حسّن العنوان الوظيفي المُعطى واقترح 3 بدائل أفضل.
أعد JSON فقط بالشكل:
{"items":[{ "headline": "...", "reason": "..." }]}`;
    const raw = await callAI(system, data.headline, { json: true });
    const parsed = parseJsonLoose<{ items: Array<{ headline: string; reason: string }> }>(raw);
    return Array.isArray(parsed) ? (parsed as any) : parsed.items;
  });

const CommentInput = z.object({ post: z.string().min(1).max(4000) });
export const generateComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => CommentInput.parse(v))
  .handler(async ({ data }) => {
    const system = `أنت مساعد كتابة LinkedIn. اقترح 3 تعليقات احترافية على هذا المنشور: واحد موافق، واحد محايد، واحد مختلف بأدب. كل تعليق أقل من 200 حرف ويُضيف قيمة.
أعد JSON فقط بالشكل:
{"items":[
  { "type": "موافق", "comment": "..." },
  { "type": "محايد", "comment": "..." },
  { "type": "مختلف بأدب", "comment": "..." }
]}`;
    const raw = await callAI(system, data.post, { json: true });
    const parsed = parseJsonLoose<{ items: Array<{ type: string; comment: string }> }>(raw);
    return Array.isArray(parsed) ? (parsed as any) : parsed.items;
  });

const SummaryInput = z.object({ summary: z.string().min(1).max(4000) });
export const improveSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => SummaryInput.parse(v))
  .handler(async ({ data }) => {
    const system = `أنت خبير في كتابة ملفات LinkedIn. حسّن هذا الملخص ليكون أكثر إقناعاً وغنياً بالكلمات المفتاحية. أعد النسخة المحسّنة فقط كنص عادي بدون شرح.`;
    const out = await callAI(system, data.summary);
    return out.trim();
  });

// ─────────────────────────────────────────────────────────
// Image generation
// ─────────────────────────────────────────────────────────

const ImageInput = z.object({
  postContent: z.string().min(1).max(6000),
  customDescription: z.string().max(1000).optional(),
});

export const generatePostImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => ImageInput.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    // Check if image gen is enabled
    const { data: setting } = await supabase.from("app_settings")
      .select("value").eq("key", "image_generation_enabled").maybeSingle();
    if (setting && setting.value !== "true") {
      throw new Error("توليد الصور غير متاح حالياً");
    }

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("مفتاح الذكاء الاصطناعي غير مهيأ");

    // Build image prompt
    let imagePrompt = data.customDescription?.trim() ?? "";
    if (!imagePrompt) {
      const sceneSystem = `You extract a short visual scene description (max 60 words, English) for a LinkedIn-appropriate image. No text overlays, natural professional style. Return only the description.`;
      imagePrompt = await callAI(sceneSystem, data.postContent);
      imagePrompt = imagePrompt.trim().slice(0, 500);
    }
    const fullPrompt = `Professional, LinkedIn-appropriate, natural style image. No text, no letters, no watermarks. Scene: ${imagePrompt}`;

    const res = await fetch(GATEWAY_IMAGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        messages: [{ role: "user", content: fullPrompt }],
        modalities: ["image", "text"],
      }),
    });
    if (!res.ok) {
      if (res.status === 429) throw new Error("تم تجاوز حد الاستخدام، حاول لاحقاً");
      if (res.status === 402) throw new Error("انتهت أرصدة الذكاء الاصطناعي");
      throw new Error("تعذر توليد الصورة");
    }
    const json = await res.json();
    const b64 = json?.data?.[0]?.b64_json;
    if (!b64) throw new Error("تعذر توليد الصورة");
    return { dataUrl: `data:image/png;base64,${b64}` };
  });
