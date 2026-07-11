import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Fixed production Lovable callback URL.
// LinkedIn requires redirect_uri to match byte-for-byte between
// the authorization request and the token exchange request.
const LINKEDIN_REDIRECT_URI =
  "https://link-enhancer-ai.lovable.app/api/public/linkedin/callback";

const StartInput = z.object({ origin: z.string().url() });

export const getLinkedInStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "linkedin_connected, linkedin_expires_at, linkedin_name, linkedin_email, linkedin_picture, linkedin_headline, linkedin_urn, linkedin_synced_at",
      )
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      throw new Error(`Could not read LinkedIn connection: ${profileError.message}`);
    }

    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("status")
      .eq("user_id", userId);

    if (postsError) {
      throw new Error(`Could not read LinkedIn post stats: ${postsError.message}`);
    }

    const stats = { published: 0, scheduled: 0, drafts: 0, failed: 0 };
    for (const post of posts ?? []) {
      if (post.status === "published") stats.published += 1;
      else if (post.status === "scheduled") stats.scheduled += 1;
      else if (post.status === "failed") stats.failed += 1;
      else stats.drafts += 1;
    }

    const expiresAt = profile?.linkedin_expires_at ?? null;

    return {
      connected: Boolean(profile?.linkedin_connected),
      expired: expiresAt ? new Date(expiresAt) < new Date() : false,
      expiresAt,
      name: profile?.linkedin_name ?? null,
      email: profile?.linkedin_email ?? null,
      picture: profile?.linkedin_picture ?? null,
      headline: profile?.linkedin_headline ?? null,
      urn: profile?.linkedin_urn ?? null,
      syncedAt: profile?.linkedin_synced_at ?? null,
      stats,
      missingProfile: !profile,
    };
  });

export const startLinkedInAuth = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => StartInput.parse(v))
  .handler(async ({ data, context }) => {
    const { buildAuthUrl } = await import("./linkedin.server");
    const { supabase, userId } = context;
    const originUrl = new URL(data.origin);
    const allowedOrigin =
      originUrl.hostname === "localhost" ||
      originUrl.hostname.endsWith(".lovable.app") ||
      originUrl.hostname.endsWith(".lovableproject.com");
    if (!allowedOrigin) throw new Error("Invalid LinkedIn return URL");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("linkedin_oauth_states")
      .delete()
      .eq("user_id", userId);

    const nonce = crypto.randomUUID().replace(/-/g, "");
    // Encode the app origin into state so the callback can redirect the
    // user back to the environment they started from (preview vs production).
    const originB64 = btoa(originUrl.origin)
      .replace(/=+$/, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    const state = `${nonce}.${originB64}`;
    const { error } = await supabase.from("linkedin_oauth_states").insert({ state, user_id: userId });
    if (error) throw error;
    const redirectUri = "https://link-enhancer-ai.lovable.app/api/public/linkedin/callback";
    return { url: buildAuthUrl(redirectUri, state), redirectUri };
  });

export const disconnectLinkedIn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({
        linkedin_connected: false,
        linkedin_access_token: null,
        linkedin_refresh_token: null,
        linkedin_expires_at: null,
        linkedin_urn: null,
        linkedin_name: null,
        linkedin_email: null,
        linkedin_picture: null,
        linkedin_headline: null,
        linkedin_synced_at: null,
      })
      .eq("id", userId);
    if (error) throw error;
    return { ok: true };
  });

export const syncLinkedInProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { fetchUserInfo } = await import("./linkedin.server");
    const { data: p } = await supabase
      .from("profiles")
      .select("linkedin_access_token, linkedin_expires_at")
      .eq("id", userId)
      .maybeSingle();
    if (!p?.linkedin_access_token) throw new Error("LinkedIn is not connected");
    if (p.linkedin_expires_at && new Date(p.linkedin_expires_at) < new Date()) {
      throw new Error("LinkedIn token expired — please reconnect");
    }
    const info = await fetchUserInfo(p.linkedin_access_token);
    const { error } = await supabase
      .from("profiles")
      .update({
        linkedin_name: info.name ?? null,
        linkedin_email: info.email ?? null,
        linkedin_picture: info.picture ?? null,
        linkedin_urn: `urn:li:person:${info.sub}`,
        linkedin_synced_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) throw error;
    return { ok: true, info };
  });

const PublishInput = z.object({ postId: z.string().uuid() });

export const publishPostNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => PublishInput.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { publishUgcPost } = await import("./linkedin.server");

    const { data: profile } = await supabase
      .from("profiles")
      .select("linkedin_access_token, linkedin_urn, linkedin_expires_at")
      .eq("id", userId)
      .maybeSingle();
    if (!profile?.linkedin_access_token || !profile.linkedin_urn) {
      throw new Error("LinkedIn is not connected");
    }
    if (profile.linkedin_expires_at && new Date(profile.linkedin_expires_at) < new Date()) {
      throw new Error("LinkedIn token expired — please reconnect");
    }

    const { data: post } = await supabase
      .from("posts")
      .select("id, content, user_id")
      .eq("id", data.postId)
      .maybeSingle();
    if (!post || post.user_id !== userId) throw new Error("Post not found");

    try {
      const liId = await publishUgcPost(profile.linkedin_access_token, profile.linkedin_urn, post.content);
      await supabase
        .from("posts")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
          linkedin_post_id: liId,
          error_message: null,
        })
        .eq("id", post.id);
      return { ok: true, linkedin_post_id: liId };
    } catch (e: any) {
      await supabase
        .from("posts")
        .update({ status: "failed", error_message: String(e?.message ?? e) })
        .eq("id", post.id);
      throw e;
    }
  });
