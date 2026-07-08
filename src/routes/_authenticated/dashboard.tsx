import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { useServerFn } from "@tanstack/react-start";
import { generatePost, analyzeProfile } from "@/lib/ai.functions";
import { toast } from "sonner";
import { Sparkles, Wand2, TrendingUp, Linkedin, FileText, Rocket } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { t, lang } = useI18n();
  const nav = useNavigate();
  const generate = useServerFn(generatePost);
  const analyze = useServerFn(analyzeProfile);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState({ gen: false, ana: false });

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const [{ data: p }, { data: ps }, { data: rs }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
      supabase.from("posts").select("*").eq("user_id", u.user.id).order("created_at", { ascending: false }).limit(5),
      supabase.from("ai_recommendations").select("*").eq("user_id", u.user.id).order("priority", { ascending: false }).limit(6),
    ]);
    setProfile(p);
    setPosts(ps ?? []);
    setRecs(rs ?? []);
  };

  useEffect(() => { load(); }, []);

  const onGenerate = async () => {
    setLoading((s) => ({ ...s, gen: true }));
    try {
      await generate({ data: { topic: "" } });
      toast.success(lang === "ar" ? "تم إنشاء منشور جديد" : "New post created");
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading((s) => ({ ...s, gen: false }));
    }
  };

  const onAnalyze = async () => {
    setLoading((s) => ({ ...s, ana: true }));
    try {
      await analyze({ data: undefined });
      toast.success(lang === "ar" ? "تم التحليل" : "Analyzed");
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading((s) => ({ ...s, ana: false }));
    }
  };

  const trialLeft = profile ? (profile.trial_posts_limit ?? 3) - (profile.trial_posts_used ?? 0) : 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            {t("dash.welcome")}{profile?.full_name ? `، ${profile.full_name}` : ""} 👋
          </h1>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2"><FileText className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">{t("dash.trial")}</p>
                <p className="text-2xl font-bold">{Math.max(0, trialLeft)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent/20 p-2"><Linkedin className="h-5 w-5 text-accent-foreground" /></div>
              <div>
                <p className="text-xs text-muted-foreground">{t("dash.linkedin")}</p>
                {profile?.linkedin_connected ? (
                  <Badge className="mt-1">{t("dash.connected")}</Badge>
                ) : (
                  <Link to="/linkedin"><Button size="sm" variant="link" className="p-0 h-auto">{t("dash.connectnow")}</Button></Link>
                )}
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2"><TrendingUp className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">{t("dash.status")}</p>
                <p className="text-lg font-semibold">{lang === "ar" ? "تجربة نشطة" : "Active trial"}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={onGenerate} disabled={loading.gen} className="bg-gradient-primary gap-2">
            <Wand2 className="h-4 w-4" />{loading.gen ? "..." : t("dash.generate")}
          </Button>
          <Button onClick={onAnalyze} disabled={loading.ana} variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />{loading.ana ? "..." : t("dash.analyze")}
          </Button>
          <Link to="/posts"><Button variant="ghost" className="gap-2"><Rocket className="h-4 w-4" />{t("nav.posts")}</Button></Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-5">
            <h2 className="mb-4 font-semibold">{t("dash.recent")}</h2>
            {posts.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("dash.noposts")}</p>
            ) : (
              <div className="space-y-3">
                {posts.map((p) => (
                  <div key={p.id} className="rounded-lg border border-border p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">{t(`posts.status.${p.status}` as any)}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="line-clamp-3 whitespace-pre-wrap text-sm">{p.content}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-semibold">{t("dash.recs")}</h2>
            {recs.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("dash.norecs")}</p>
            ) : (
              <div className="space-y-3">
                {recs.map((r) => (
                  <div key={r.id} className="rounded-lg border border-border p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{r.category}</Badge>
                      <span className="text-sm font-medium">{r.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.content}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
