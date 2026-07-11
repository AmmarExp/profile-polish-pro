import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarDays, FileText, PenLine, Settings2, Sparkles, Wrench } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

const recentPosts = [
  { content: "تعلمت من قيادة فريق متنوع أن الاستماع الجيد يسبق أي قرار ناجح. كل فكرة جديدة تبدأ بسؤال بسيط: كيف يمكننا أن نعمل أفضل معاً؟", status: "مسودة", tone: "bg-amber-500/10 text-amber-700" },
  { content: "الاستثمار في تطوير المهارات ليس رفاهية؛ إنه أفضل قرار مهني يمكن أن تتخذه اليوم من أجل فرص الغد.", status: "منشور", tone: "bg-emerald-500/10 text-emerald-700" },
  { content: "خمس ممارسات ساعدتني على تنظيم أولوياتي وبناء يوم عمل أكثر تركيزاً وإنتاجية.", status: "مجدول", tone: "bg-primary/10 text-primary" },
];

function Dashboard() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6" dir="rtl">
        <header className="space-y-1">
          <p className="text-sm text-muted-foreground">لوحة التحكم</p>
          <h1 className="text-2xl font-bold sm:text-3xl">مرحباً، عمار 👋</h1>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          <Card className="p-4 shadow-soft"><p className="text-sm text-muted-foreground">إجمالي المنشورات</p><p className="mt-2 text-3xl font-bold">12</p></Card>
          <Card className="p-4 shadow-soft"><p className="text-sm text-muted-foreground">منشورات هذا الأسبوع</p><p className="mt-2 text-3xl font-bold">2</p></Card>
          <Card className="p-4 shadow-soft"><p className="text-sm text-muted-foreground">حالة LinkedIn</p><Badge className="mt-3 bg-emerald-600 hover:bg-emerald-600">متصل ✅</Badge></Card>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-amber-300/70 bg-amber-100/70 p-5 sm:flex-row sm:items-center sm:justify-between dark:bg-amber-500/10">
          <div><h2 className="font-bold">أكمل ملفك الشخصي لتحسين جودة المحتوى</h2><p className="mt-1 text-sm text-muted-foreground">أضف خبراتك وأهدافك ليصبح المحتوى أقرب إلى أسلوبك.</p></div>
          <Button asChild variant="outline" className="border-amber-400 bg-background"><Link to="/settings">إكمال الملف</Link></Button>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <QuickAction to="/posts/new" icon={<PenLine className="h-6 w-6" />} title="اكتب منشوراً الآن" subtitle="توليد منشور بالذكاء الاصطناعي" />
          <QuickAction to="/planner" icon={<CalendarDays className="h-6 w-6" />} title="خطة الأسبوع" subtitle="اقترح محتوى لكامل الأسبوع" />
          <QuickAction to="/tools" icon={<Wrench className="h-6 w-6" />} title="أدوات الكتابة" subtitle="حسّن عنوانك ونصوصك" />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-bold">آخر المنشورات</h2><Button asChild variant="ghost" size="sm"><Link to="/posts">عرض الكل</Link></Button></div>
          <div className="grid gap-3 md:grid-cols-3">{recentPosts.map((post) => <Card key={post.status} className="p-4"><div className="mb-3 flex items-center justify-between"><Badge className={post.tone}>{post.status}</Badge><FileText className="h-4 w-4 text-muted-foreground" /></div><p className="line-clamp-4 text-sm leading-7">{post.content}</p></Card>)}</div>
        </section>
      </div>
    </AppShell>
  );
}

function QuickAction({ to, icon, title, subtitle }: { to: "/posts/new" | "/planner" | "/tools"; icon: React.ReactNode; title: string; subtitle: string }) {
  return <Link to={to} className="group"><Card className="h-full p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{subtitle}</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">ابدأ الآن <Sparkles className="h-3.5 w-3.5" /></span></Card></Link>;
}
