import { createFileRoute, useSearch } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { Linkedin, ExternalLink, Unplug, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { getLinkedInStatus, startLinkedInAuth, disconnectLinkedIn, type LinkedInStatus } from "@/lib/linkedin.functions";

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
  const [status, setStatus] = useState<LinkedInStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const getStatus = useServerFn(getLinkedInStatus);
  const start = useServerFn(startLinkedInAuth);
  const disconnect = useServerFn(disconnectLinkedIn);

  const load = async () => {
    setLoading(true);
    try {
      const nextStatus = await getStatus();
      setStatus(nextStatus);
      if (nextStatus.connected) setLastError(null);
    } catch (e: any) {
      const message = e?.message ?? String(e);
      setLastError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    if (search.connected) {
      setLastError(null);
      toast.success(lang === "ar" ? "تم ربط لينكدإن بنجاح ✅" : "LinkedIn connected ✅");
      load();
    }
    if (search.error) {
      const decoded = search.error;
      setLastError(decoded);
      toast.error("خطأ: " + decoded);
      setLoading(false);
    }
  }, [search.connected, search.error, lang]);

  const onConnect = async () => {
    setBusy(true);
    setLastError(null);
    try {
      const r = await start({ data: { origin: window.location.origin } });
      window.location.href = r.url;
    } catch (e: any) {
      setLastError(e.message);
      toast.error(e.message);
      setBusy(false);
    }
  };

  const onDisconnect = async () => {
    setBusy(true);
    try {
      await disconnect({ data: undefined });
      toast.success(lang === "ar" ? "تم فك الربط" : "Disconnected");
      await load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const connected = !!status?.connected;
  const expiresAt = status?.expiresAt ? new Date(status.expiresAt) : null;
  const expired = !!status?.expired;

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">{t("li.title")}</h1>

        {lastError && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 text-sm">
                {lang === "ar" ? "تفاصيل مشكلة الربط:" : "Connection issue details:"}
              </p>
              <p className="text-red-600 text-sm font-mono mt-1 break-all">{lastError}</p>
            </div>
          </div>
        )}

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-[#0A66C2]/10 p-3">
              <Linkedin className="h-6 w-6 text-[#0A66C2]" />
            </div>
            <div className="flex-1">
              <p className="font-medium">LinkedIn</p>
              {loading ? (
                <Badge variant="outline" className="gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {lang === "ar" ? "جاري التحقق" : "Checking"}
                </Badge>
              ) : connected ? (
                expired ? (
                  <Badge variant="destructive">{lang === "ar" ? "انتهت الصلاحية" : "Token expired"}</Badge>
                ) : (
                  <Badge className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {t("dash.connected")}{status?.name ? ` · ${status.name}` : ""}
                  </Badge>
                )
              ) : (
                <Badge variant="outline">{t("dash.notconnected")}</Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{t("li.desc")}</p>

          {search.error && !connected && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">{lang === "ar" ? "فشل الربط" : "Connection failed"}</p>
                <p className="mt-1 break-words text-destructive/90">{search.error}</p>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {!connected || expired ? (
              <Button onClick={onConnect} disabled={busy} className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 gap-2">
                <ExternalLink className="h-4 w-4" />
                {busy ? (lang === "ar" ? "جاري التوجيه..." : "Redirecting...") : t("li.connect")}
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

          {connected && status?.syncedAt && (
            <p className="mt-1 text-xs text-muted-foreground">
              {lang === "ar" ? "آخر مزامنة:" : "Last synced:"} {new Date(status.syncedAt).toLocaleString()}
            </p>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
