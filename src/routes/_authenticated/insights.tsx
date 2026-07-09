import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { FileText, CheckCircle2, Clock, XCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/insights")({
  component: InsightsPage,
});

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#f59e0b", "#ef4444"];

function InsightsPage() {
  const { t, lang } = useI18n();
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase.from("posts").select("*").eq("user_id", u.user.id).order("created_at", { ascending: false });
      setPosts(data ?? []);
    })();
  }, []);

  const byStatus = ["draft", "scheduled", "published", "failed"].map((s) => ({
    name: t(`posts.status.${s}` as any),
    key: s,
    value: posts.filter((p) => p.status === s).length,
  }));

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      day: d.toLocaleDateString(lang === "ar" ? "ar" : "en", { month: "short", day: "numeric" }),
      count: posts.filter((p) => (p.created_at ?? "").slice(0, 10) === key).length,
    };
  });

  const published = byStatus.find((s) => s.key === "published")?.value ?? 0;
  const scheduled = byStatus.find((s) => s.key === "scheduled")?.value ?? 0;
  const drafts = byStatus.find((s) => s.key === "draft")?.value ?? 0;
  const failed = byStatus.find((s) => s.key === "failed")?.value ?? 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-2xl font-bold">{t("ins.title")}</h1>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            { icon: FileText, label: t("ins.total"), value: posts.length, color: "text-primary" },
            { icon: CheckCircle2, label: t("posts.status.published"), value: published, color: "text-green-600" },
            { icon: Clock, label: t("posts.status.scheduled"), value: scheduled, color: "text-amber-600" },
            { icon: XCircle, label: t("posts.status.failed"), value: failed, color: "text-destructive" },
          ].map((s) => (
            <Card key={s.label} className="p-5">
              <div className="flex items-center gap-3">
                <s.icon className={`h-6 w-6 ${s.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-5">
            <h2 className="mb-4 font-semibold">{t("ins.per14")}</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={days}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-semibold">{t("ins.status")}</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                  {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="p-5">
          <h2 className="mb-4 font-semibold">{t("ins.summary")}</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline">{t("ins.total")}: {posts.length}</Badge>
            <Badge variant="outline">{t("posts.status.published")}: {published}</Badge>
            <Badge variant="outline">{t("posts.status.scheduled")}: {scheduled}</Badge>
            <Badge variant="outline">{t("posts.status.draft")}: {drafts}</Badge>
            <Badge variant="outline">{t("posts.status.failed")}: {failed}</Badge>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
