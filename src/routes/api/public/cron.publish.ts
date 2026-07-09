import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/cron/publish")({
  server: {
    handlers: {
      POST: async ({ request }) => handle(request),
      GET: async ({ request }) => handle(request),
    },
  },
});

async function handle(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? request.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { publishUgcPost } = await import("@/lib/linkedin.server");

  const nowIso = new Date().toISOString();
  const { data: due, error } = await supabaseAdmin
    .from("posts")
    .select("id, user_id, content, scheduled_at")
    .eq("status", "scheduled")
    .lte("scheduled_at", nowIso)
    .limit(25);
  if (error) return new Response(error.message, { status: 500 });

  const results: Array<{ id: string; ok: boolean; error?: string }> = [];

  for (const post of due ?? []) {
    try {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("linkedin_access_token, linkedin_urn, linkedin_expires_at")
        .eq("id", post.user_id)
        .maybeSingle();
      if (!profile?.linkedin_access_token || !profile.linkedin_urn) {
        throw new Error("LinkedIn not connected");
      }
      if (profile.linkedin_expires_at && new Date(profile.linkedin_expires_at) < new Date()) {
        throw new Error("LinkedIn token expired");
      }
      const liId = await publishUgcPost(profile.linkedin_access_token, profile.linkedin_urn, post.content);
      await supabaseAdmin
        .from("posts")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
          linkedin_post_id: liId,
          error_message: null,
        })
        .eq("id", post.id);
      results.push({ id: post.id, ok: true });
    } catch (e: any) {
      await supabaseAdmin
        .from("posts")
        .update({ status: "failed", error_message: String(e?.message ?? e) })
        .eq("id", post.id);
      results.push({ id: post.id, ok: false, error: String(e?.message ?? e) });
    }
  }

  return Response.json({ processed: results.length, results });
}
