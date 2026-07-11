import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { RefreshCw, Mail, Linkedin, ExternalLink, FileText, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { getLinkedInStatus, syncLinkedInProfile, type LinkedInStatus } from "@/lib/linkedin.functions";

export const Route = createFileRoute("/_authenticated/linkedin/profile")({
  component: LinkedInProfilePage,
});

function LinkedInProfilePage() {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const [status, setStatus] = useState<LinkedInStatus | null>(null);
  const [stats, setStats] = useState({ published: 0, scheduled: 0, drafts: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const getStatus = useServerFn(getLinkedInStatus);
  const sync = useServerFn(syncLinkedInProfile);

  const load = async () => {
    setLoading(true);
    try {
      const nextStatus = await getStatus({ data: undefined });
      setStatus(nextStatus);
      setStats(nextStatus.stats);
      setError(null);
    } catch (e: any) {
      const message = e?.message ?? String(e);
      setError(message);
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

  const onSync = async () => {
    setBusy(true);
    try { await sync({ data: undefined }); toast.success(ar ? "تمت المزامنة" : "Synced"); await load(); }
    catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl">
          <Card className="p-8 text-center">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[#0A66C2]" />
            <p className="text-muted-foreground">{ar ? "جاري تحميل بيانات لينكدإن..." : "Loading LinkedIn data..."}</p>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl">
          <Card className="p-8 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-600" />
            <p className="mb-4 text-muted-foreground">{error}</p>
            <Button onClick={load}>{ar ? "حاول مجدداً" : "Try again"}</Button>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (!status?.connected) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl">
          <Card className="p-8 text-center">
            <Linkedin className="mx-auto mb-3 h-10 w-10 text-[#0A66C2]" />
            <p className="mb-4 text-muted-foreground">
              {ar ? "لم يتم ربط حساب لينكدإن بعد." : "LinkedIn is not connected yet."}
            </p>
            <Button asChild><a href="/linkedin">{ar ? "اذهب للربط" : "Go to connect"}</a></Button>
          </Card>
        </div>
      </AppShell>
    );
  }

  const profileUrl = status.urn
    ? `https://www.linkedin.com/in/${String(status.urn).replace("urn:li:person:", "")}`
    : null;

  const cards = [
    { icon: CheckCircle2, label: ar ? "منشور" : "Published", value: stats.published, color: "text-green-600" },
    { icon: Clock, label: ar ? "مجدول" : "Scheduled", value: stats.scheduled, color: "text-blue-600" },
    { icon: FileText, label: ar ? "مسودات" : "Drafts", value: stats.drafts, color: "text-muted-foreground" },
    { icon: AlertCircle, label: ar ? "فشل" : "Failed", value: stats.failed, color: "text-red-600" },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{ar ? "ملف لينكدإن" : "LinkedIn Profile"}</h1>
          <Button variant="outline" size="sm" onClick={onSync} disabled={busy} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
            {ar ? "مزامنة" : "Sync"}
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            {status.picture ? (
              <img src={status.picture} alt={status.name ?? ""} className="h-20 w-20 rounded-full object-cover ring-2 ring-[#0A66C2]/20" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0A66C2]/10">
                <Linkedin className="h-8 w-8 text-[#0A66C2]" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{status.name ?? "—"}</h2>
                <Badge className="bg-[#0A66C2]">{ar ? "متصل" : "Connected"}</Badge>
              </div>
              {status.headline && (
                <p className="mt-1 text-sm text-muted-foreground">{status.headline}</p>
              )}
              {status.email && (
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> {status.email}
                </p>
              )}
              {profileUrl && (
                <a href={profileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-[#0A66C2] hover:underline">
                  {ar ? "فتح الملف على لينكدإن" : "Open on LinkedIn"} <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cards.map((c) => (
            <Card key={c.label} className="p-4">
              <c.icon className={`mb-2 h-5 w-5 ${c.color}`} />
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </Card>
          ))}
        </div>

        <Card className="border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground">
          <p className="mb-1 font-medium text-foreground">
            {ar ? "ملاحظة حول بيانات لينكدإن" : "About LinkedIn data"}
          </p>
          <p>
            {ar
              ? "واجهة لينكدإن العامة تتيح فقط: الاسم، البريد، الصورة، والنشر باسمك. بيانات مثل عدد المتابعين، المشاهدات، والإعجابات تتطلب اعتماد شراكة LinkedIn Marketing Developer Platform. تعرض هنا إحصائيات المنشورات التي نشرتها عبر التطبيق."
              : "LinkedIn's public API only exposes name, email, picture, and posting on your behalf. Follower count, impressions, and likes require LinkedIn Marketing Developer Platform partnership. Stats above cover posts published through this app."}
          </p>
        </Card>

        {status.syncedAt && (
          <p className="text-center text-xs text-muted-foreground">
            {ar ? "آخر مزامنة:" : "Last synced:"} {new Date(status.syncedAt).toLocaleString()}
          </p>
        )}
      </div>
    </AppShell>
  );
}
