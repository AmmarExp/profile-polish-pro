import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/linkedin/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const err = url.searchParams.get("error");
        const origin = `${url.protocol}//${url.host}`;
        const redirectTo = (msg: string, ok = false) =>
          Response.redirect(
            `${origin}/linkedin?${ok ? "connected" : "error"}=${encodeURIComponent(msg)}`,
            302,
          );

        if (err) return redirectTo(err);
        if (!code || !state) return redirectTo("missing_params");

        try {
          const { exchangeCode, fetchUserInfo } = await import("@/lib/linkedin.server");
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          const { data: stateRow } = await supabaseAdmin
            .from("linkedin_oauth_states")
            .select("user_id")
            .eq("state", state)
            .maybeSingle();
          if (!stateRow) return redirectTo("invalid_state");

          const redirectUri = `${origin}/api/public/linkedin/callback`;
          const token = await exchangeCode(code, redirectUri);
          const info = await fetchUserInfo(token.access_token);
          const expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString();

          await supabaseAdmin
            .from("profiles")
            .update({
              linkedin_connected: true,
              linkedin_access_token: token.access_token,
              linkedin_refresh_token: token.refresh_token ?? null,
              linkedin_expires_at: expiresAt,
              linkedin_urn: `urn:li:person:${info.sub}`,
              linkedin_name: info.name ?? null,
              linkedin_email: info.email ?? null,
              linkedin_picture: info.picture ?? null,
              linkedin_synced_at: new Date().toISOString(),
            })
            .eq("id", stateRow.user_id);

          await supabaseAdmin.from("linkedin_oauth_states").delete().eq("state", state);
          return redirectTo("1", true);
        } catch (e: any) {
          console.error("[linkedin callback]", e);
          return redirectTo(e?.message ?? "callback_failed");
        }
      },
    },
  },
});
