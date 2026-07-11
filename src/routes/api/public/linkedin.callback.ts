import { createFileRoute } from "@tanstack/react-router";

// Fixed production Lovable callback URL.
// Must match byte-for-byte the redirect_uri used at authorization.
const LINKEDIN_REDIRECT_URI =
  "https://link-enhancer-ai.lovable.app/api/public/linkedin/callback";

export const Route = createFileRoute("/api/public/linkedin/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);

        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const err = url.searchParams.get("error");
        const errDesc = url.searchParams.get("error_description");

        // Decode the originating app origin from state so we can send the
        // user back to the same environment they started from (e.g. preview).
        const decodeOrigin = (s: string | null): string => {
          const fallback = "https://link-enhancer-ai.lovable.app";
          if (!s) return fallback;
          const part = s.split(".")[1];
          if (!part) return fallback;
          try {
            const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
            const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
            const decoded = atob(padded);
            const u = new URL(decoded);
            // Only allow lovable hosts.
            if (u.hostname.endsWith(".lovable.app") || u.hostname.endsWith(".lovableproject.com")) {
              return u.origin;
            }
            return fallback;
          } catch {
            return fallback;
          }
        };
        const origin = decodeOrigin(state);

        const redirectTo = (msg: string, ok = false) =>
          Response.redirect(
            `${origin}/linkedin?${ok ? "connected" : "error"}=${encodeURIComponent(msg)}`,
            302,
          );

        if (err) return redirectTo(errDesc ? `${err}: ${errDesc}` : err);
        if (!code || !state) return redirectTo("missing_params");

        try {
          const { exchangeCode, fetchUserInfo } = await import("@/lib/linkedin.server");
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          const { data: stateRow, error: stateErr } = await supabaseAdmin
            .from("linkedin_oauth_states")
            .select("user_id")
            .eq("state", state)
            .maybeSingle();
          if (stateErr) {
            console.error("[linkedin callback] state lookup failed", stateErr);
            return redirectTo("state_lookup_failed");
          }
          if (!stateRow) return redirectTo("invalid_state");

          // Use the fixed redirect URI — must match the one used at authorization.
          const redirectUri = LINKEDIN_REDIRECT_URI;
          const token = await exchangeCode(code, redirectUri);
          const expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString();

          // Step 1: persist the connection.
          const { error: coreErr } = await supabaseAdmin
            .from("profiles")
            .upsert(
              {
                id: stateRow.user_id,
                linkedin_connected: true,
                linkedin_access_token: token.access_token,
                linkedin_refresh_token: token.refresh_token ?? null,
                linkedin_expires_at: expiresAt,
              },
              { onConflict: "id" },
            );
          if (coreErr) {
            console.error("[linkedin callback] profile upsert failed", coreErr);
            return redirectTo(coreErr.message ?? "profile_update_failed");
          }

          // Step 2: best-effort enrichment.
          try {
            const info = await fetchUserInfo(token.access_token);
            await supabaseAdmin
              .from("profiles")
              .update({
                linkedin_urn: info.sub ? `urn:li:person:${info.sub}` : null,
                linkedin_name: info.name ?? null,
                linkedin_email: info.email ?? null,
                linkedin_picture: info.picture ?? null,
                linkedin_synced_at: new Date().toISOString(),
              })
              .eq("id", stateRow.user_id);
          } catch (enrichErr) {
            console.error("[linkedin callback] profile enrichment skipped", enrichErr);
          }

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
