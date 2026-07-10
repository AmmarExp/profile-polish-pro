import { createFileRoute, useSearch } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Linkedin, ExternalLink, Unplug } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { startLinkedInAuth, disconnectLinkedIn } from "@/lib/linkedin.functions";

export const Route = createFileRoute("/_authenticated/linkedin")({
  validateSearch: (s: Record<string, unknown>) => ({
    connected: typeof s.connected === "string" ? s.connected : undefined,
    error: typeof s.error === "string" ? s.error : undefined,
  }),
  component: LinkedInPage,
});

function LinkedInPage() {
  const { t, lang } = useI18n();
  const search = useSearch({ from: "/_authenticated/linkedin" });
  const [profile, setProfile] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const start = useServerFn(startLinkedInAuth);
  const disconnect = useServerFn(disconnectLinkedIn);

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
    setProfile(data);
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    if (search.connected) toast.success(lang === "ar" ? "تم ربط لينكدإن" : "LinkedIn connected");
    if (search.error) toast.error((lang === "ar" ? "فشل الربط: " : "Connect failed: ") + search.error);
  }, [search.connected, search.error, lang]);

  const onConnect = async () => {
    setBusy(true);
    try {
      const r = await start({ data: { origin: window.location.origin } });
      // LinkedIn refuses to be embedded in iframes (preview). Open at top-level or in a new tab.
      const opened = window.open(r.url, "_blank", "noopener,noreferrer");
      if (!opened) {
        try { window.top!.location.href = r.url; } catch { window.location.href = r.url; }
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const onDisconnect = async () => {
    setBusy(true);
    try {
      await disconnect({ data: undefined });
      toast.success(lang === "ar" ? "تم فك الربط" : "Disconnected");
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const connected = !!profile?.linkedin_connected;
  const expiresAt = profile?.linkedin_expires_at ? new Date(profile.linkedin_expires_at) : null;
  const expired = expiresAt && expiresAt < new Date();

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">{t("li.title")}</h1>
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-[#0A66C2]/10 p-3">
              <Linkedin className="h-6 w-6 text-[#0A66C2]" />
            </div>
            <div className="flex-1">
              <p className="font-medium">LinkedIn</p>
              {connected ? (
                expired ? (
                  <Badge variant="destructive">{lang === "ar" ? "انتهت الصلاحية" : "Token expired"}</Badge>
                ) : (
                  <Badge>{t("dash.connected")}{profile.linkedin_name ? ` · ${profile.linkedin_name}` : ""}</Badge>
                )
              ) : (
                <Badge variant="outline">{t("dash.notconnected")}</Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{t("li.desc")}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {!connected || expired ? (
              <Button onClick={onConnect} disabled={busy} className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 gap-2">
                <ExternalLink className="h-4 w-4" />
                {busy ? "..." : t("li.connect")}
              </Button>
            ) : (
              <>
                <Button asChild className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 gap-2">
                  <a href="/linkedin/profile">{lang === "ar" ? "عرض بيانات الملف" : "View profile data"}</a>
                </Button>
                <Button onClick={onDisconnect} disabled={busy} variant="outline" className="gap-2">
                  <Unplug className="h-4 w-4" />
                  {lang === "ar" ? "فك الربط" : "Disconnect"}
                </Button>
              </>
            )}
          </div>

          {expiresAt && !expired && (
            <p className="mt-3 text-xs text-muted-foreground">
              {lang === "ar" ? "تنتهي الصلاحية:" : "Expires:"} {expiresAt.toLocaleString()}
            </p>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
