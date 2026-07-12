import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { generateWeeklyPlan } from "@/lib/ai.functions";
import { toast } from "sonner";
import { CalendarDays, Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/planner")({ component: PlannerPage });

const dayLabels = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

function startOfWeek(): Date {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = d.getDay();
  const diff = (day - 6 + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}
function fmt(d: Date) {
  return d.toLocaleDateString("ar-EG", { day: "numeric", month: "long" });
}
function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type PlanItem = { day: string; topic: string; tone: string };

function PlannerPage() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [postedDays, setPostedDays] = useState<Set<string>>(new Set());

  const genFn = useServerFn(generateWeeklyPlan);
  const weekStart = useMemo(() => startOfWeek(), []);
  const weekStartStr = ymd(weekStart);
  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    return d;
  }, [weekStart]);

  const days = useMemo(() =>
    dayLabels.map((label, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return { day: label, date: fmt(d), key: label };
    }), [weekStart]);

  const load = async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    const [{ data: existing }, { data: posts }] = await Promise.all([
      supabase.from("weekly_plans").select("plan").eq("user_id", uid).eq("week_start", weekStartStr).maybeSingle(),
      supabase.from("posts").select("scheduled_at, created_at").eq("user_id", uid)
        .gte("created_at", weekStart.toISOString())
        .lte("created_at", new Date(weekEnd.getTime() + 86_400_000).toISOString()),
    ]);
    setPlan(((existing?.plan as PlanItem[] | null) ?? []));
    const set = new Set<string>();
    for (const p of posts ?? []) {
      const d = new Date(p.scheduled_at ?? p.created_at);
      const idx = (d.getDay() - 6 + 7) % 7;
      set.add(dayLabels[idx]);
    }
    setPostedDays(set);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const suggest = async () => {
    setBusy(true);
    try {
      const items = await genFn({ data: {} });
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user!.id;
      const { error } = await supabase
        .from("weekly_plans")
        .upsert({ user_id: uid, week_start: weekStartStr, plan: items as any }, { onConflict: "user_id,week_start" });
      if (error) throw error;
      setPlan(items);
      toast.success("تم توليد خطة الأسبوع");
    } catch (e: any) {
      toast.error(e?.message ?? "تعذر توليد الخطة");
    } finally {
      setBusy(false);
    }
  };

  const useIdea = (topic: string, tone: string) => {
    navigate({ to: "/posts/new", search: { topic, tone } });
  };

  const planByDay = new Map(plan.map((p) => [p.day, p]));

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6" dir="rtl">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">التخطيط للمحتوى</p>
            <h1 className="text-2xl font-bold">خطة محتوى الأسبوع</h1>
            <p className="mt-1 text-sm text-muted-foreground">الأسبوع: {fmt(weekStart)} - {fmt(weekEnd)}</p>
          </div>
          <Button className="gap-2" onClick={suggest} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            اقترح خطة هذا الأسبوع
          </Button>
        </header>

        <Card className="p-3 sm:p-5">
          <div className="mb-4 flex items-center gap-2 font-semibold"><CalendarDays className="h-5 w-5 text-primary" />جدول الأسبوع</div>
          {loading ? (
            <p className="p-4 text-sm text-muted-foreground">جارٍ التحميل…</p>
          ) : (
            <div className="space-y-2">
              {days.map((item) => {
                const planned = planByDay.get(item.day);
                return (
                  <div key={item.day} className={planned ? "flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center" : "flex flex-col gap-3 rounded-xl border border-dashed border-primary/40 p-4 sm:flex-row sm:items-center"}>
                    <div className="min-w-28">
                      <p className="font-semibold">{item.day}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    {planned ? (
                      <>
                        {postedDays.has(item.day) && <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" title="يوجد منشور" />}
                        <Badge variant="secondary" className="max-w-fit">{planned.topic}</Badge>
                        <Badge className="max-w-fit bg-primary/10 text-primary">{planned.tone}</Badge>
                        <div className="ms-auto">
                          <Button size="sm" variant="ghost" className="text-primary" onClick={() => useIdea(planned.topic, planned.tone)}>استخدم هذه الفكرة ←</Button>
                        </div>
                      </>
                    ) : (
                      <Button variant="ghost" className="w-fit text-primary" onClick={() => navigate({ to: "/posts/new" })}>إضافة منشور +</Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {plan.length > 0 && (
          <section>
            <h2 className="mb-3 text-xl font-bold">اقتراحات الذكاء الاصطناعي</h2>
            <div className="grid gap-3 md:grid-cols-3">
              {plan.map((p) => (
                <Card key={p.day} className="flex flex-col p-4">
                  <Badge className="w-fit bg-secondary text-secondary-foreground">{p.day}</Badge>
                  <p className="mt-4 text-sm leading-7">{p.topic}</p>
                  <Badge className="mt-3 w-fit bg-primary/10 text-primary">{p.tone}</Badge>
                  <Button variant="link" className="mt-auto px-0 pt-5 text-primary" onClick={() => useIdea(p.topic, p.tone)}>استخدم هذه الفكرة ←</Button>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
