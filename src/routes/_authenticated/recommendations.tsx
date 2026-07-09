import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useServerFn } from "@tanstack/react-start";
import { analyzeProfile } from "@/lib/ai.functions";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/recommendations")({
  component: RecsPage,
});

const catColor: Record<string, string> = {
  headline: "bg-primary/10 text-primary",
  about: "bg-accent/20 text-accent-foreground",
  experience: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  content: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  network: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
};

function RecsPage() {
  const { t, lang } = useI18n();
  const analyze = useServerFn(analyzeProfile);
  const [recs, setRecs] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data } = await supabase.from("ai_recommendations").select("*").eq("user_id", u.user.id).order("priority", { ascending: false });
    setRecs(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const runAnalyze = async () => {
    setBusy(true);
    try {
      await analyze({ data: undefined });
      toast.success(lang === "ar" ? "تم التحليل" : "Analyzed");
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const dismiss = async (id: string) => {
    await supabase.from("ai_recommendations").delete().eq("id", id);
    load();
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("recs.title")}</h1>
          <Button onClick={runAnalyze} disabled={busy} className="bg-gradient-primary gap-2">
            <Sparkles className="h-4 w-4" /> {busy ? "..." : t("dash.analyze")}
          </Button>
        </div>

        {recs.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">{t("dash.norecs")}</Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recs.map((r) => (
              <Card key={r.id} className="p-5">
                <div className="mb-2 flex items-center justify-between">
                  <Badge className={catColor[r.category] ?? "bg-secondary"}>{r.category}</Badge>
                  <span className="text-xs text-muted-foreground">P{r.priority}</span>
                </div>
                <h3 className="font-semibold">{r.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{r.content}</p>
                <Button variant="ghost" size="sm" className="mt-3" onClick={() => dismiss(r.id)}>
                  {lang === "ar" ? "تم" : "Done"}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
