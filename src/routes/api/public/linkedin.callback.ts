import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/linkedin/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);

        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const err = url.searchParams.get("error");
        const errDesc = url.searchParams.get("error_description");

        // Recover the exact browser origin that started the flow from the state.
        // Falling back to the request origin only if the state is malformed.
        let origin = url.origin;
        if (state && state.includes("~")) {
          try {
            origin = decodeURIComponent(state.split("~")[1] ?? "") || url.origin;
          } catch {
            origin = url.origin;
          }
        }

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

          // MUST match the redirect_uri used at authorization exactly.
          const redirectUri = `${origin}/api/public/linkedin/callback`;
          const token = await exchangeCode(code, redirectUri);
          const expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString();

          // Step 1: persist the connection. This is the critical write — if it
          // succeeds the account is connected.
          const { error: coreErr } = await supabaseAdmin
            .from("profiles")
            .update({
              linkedin_connected: true,
              linkedin_access_token: token.access_token,
              linkedin_refresh_token: token.refresh_token ?? null,
              linkedin_expires_at: expiresAt,
            })
            .eq("id", stateRow.user_id);
          if (coreErr) {
            console.error("[linkedin callback] core profile update failed", coreErr);
            return redirectTo(coreErr.message ?? "profile_update_failed");
          }

          // Step 2: best-effort enrichment. A failure here must never abort the
          // connection that already succeeded above.
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
