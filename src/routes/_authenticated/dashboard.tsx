import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, FileText, PenLine, Sparkles, Wrench } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

type PostRow = { id: string; content: string; status: string; created_at: string };

function startOfWeek(): Date {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // Saturday = 6 in JS getDay
  const day = d.getDay();
  const diff = (day - 6 + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

function Dashboard() {
  const [name, setName] = useState<string>("");
  const [total, setTotal] = useState(0);
  const [weekCount, setWeekCount] = useState(0);
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [showOnboard, setShowOnboard] = useState(false);
  const [recent, setRecent] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return;

      const [{ data: profile }, { count: totalCount }, { count: wc }, { data: last }] = await Promise.all([
        supabase.from("profiles").select("full_name, headline, specialty, linkedin_connected").eq("id", uid).maybeSingle(),
        supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", uid),
        supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", uid).gte("created_at", startOfWeek().toISOString()),
        supabase.from("posts").select("id, content, status, created_at").eq("user_id", uid).order("created_at", { ascending: false }).limit(3),
      ]);

      setName(profile?.full_name ?? "");
      setLinkedInConnected(Boolean(profile?.linkedin_connected));
      setShowOnboard(!profile?.headline || !profile?.specialty);
      setTotal(totalCount ?? 0);
      setWeekCount(wc ?? 0);
      setRecent((last ?? []) as PostRow[]);
      setLoading(false);
    })();
  }, []);

  const statusLabel = (s: string) =>
    s === "published" ? "منشور" : s === "scheduled" ? "مجدول" : s === "failed" ? "فشل" : "مسودة";
  const statusTone = (s: string) =>
    s === "published"
      ? "bg-emerald-500/10 text-emerald-700"
      : s === "scheduled"
        ? "bg-primary/10 text-primary"
        : s === "failed"
          ? "bg-destructive/10 text-destructive"
          : "bg-amber-500/10 text-amber-700";

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6" dir="rtl">
        <header className="space-y-1">
          <p className="text-sm text-muted-foreground">لوحة التحكم</p>
          <h1 className="text-2xl font-bold sm:text-3xl">مرحباً{name ? `، ${name}` : ""} 👋</h1>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          <Card className="p-4 shadow-soft"><p className="text-sm text-muted-foreground">إجمالي المنشورات</p><p className="mt-2 text-3xl font-bold">{loading ? "…" : total}</p></Card>
          <Card className="p-4 shadow-soft"><p className="text-sm text-muted-foreground">منشورات هذا الأسبوع</p><p className="mt-2 text-3xl font-bold">{loading ? "…" : weekCount}</p></Card>
          <Card className="p-4 shadow-soft"><p className="text-sm text-muted-foreground">حالة LinkedIn</p>{linkedInConnected ? <Badge className="mt-3 bg-emerald-600 hover:bg-emerald-600">متصل ✅</Badge> : <Badge className="mt-3 bg-muted text-foreground">غير متصل</Badge>}</Card>
        </section>

        {showOnboard && (
          <section className="flex flex-col gap-4 rounded-2xl border border-amber-300/70 bg-amber-100/70 p-5 sm:flex-row sm:items-center sm:justify-between dark:bg-amber-500/10">
            <div><h2 className="font-bold">أكمل ملفك الشخصي لتحسين جودة المحتوى</h2><p className="mt-1 text-sm text-muted-foreground">أضف خبراتك وأهدافك ليصبح المحتوى أقرب إلى أسلوبك.</p></div>
            <Button asChild variant="outline" className="border-amber-400 bg-background"><Link to="/settings">إكمال الملف</Link></Button>
          </section>
        )}

        <section className="grid gap-4 lg:grid-cols-3">
          <QuickAction to="/posts/new" icon={<PenLine className="h-6 w-6" />} title="اكتب منشوراً الآن" subtitle="توليد منشور بالذكاء الاصطناعي" />
          <QuickAction to="/planner" icon={<CalendarDays className="h-6 w-6" />} title="خطة الأسبوع" subtitle="اقترح محتوى لكامل الأسبوع" />
          <QuickAction to="/tools" icon={<Wrench className="h-6 w-6" />} title="أدوات الكتابة" subtitle="حسّن عنوانك ونصوصك" />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-bold">آخر المنشورات</h2><Button asChild variant="ghost" size="sm"><Link to="/posts">عرض الكل</Link></Button></div>
          {recent.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">{loading ? "جارٍ التحميل…" : "لا توجد منشورات بعد."}</Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {recent.map((post) => (
                <Card key={post.id} className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <Badge className={statusTone(post.status)}>{statusLabel(post.status)}</Badge>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="line-clamp-4 text-sm leading-7">{post.content}</p>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function QuickAction({ to, icon, title, subtitle }: { to: "/posts/new" | "/planner" | "/tools"; icon: React.ReactNode; title: string; subtitle: string }) {
  return <Link to={to} className="group"><Card className="h-full p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{subtitle}</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">ابدأ الآن <Sparkles className="h-3.5 w-3.5" /></span></Card></Link>;
}
