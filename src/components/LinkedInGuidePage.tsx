import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type GuideSection = { title: string; text: string; bullets?: string[] };

type LinkedInGuidePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  sections: GuideSection[];
};

export function LinkedInGuidePage({ eyebrow, title, description, sections }: LinkedInGuidePageProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2"><img src="https://cdn.builder.io/api/v1/image/assets%2F346e6505607b4f3892f8a2e9c5da6d92%2Fb7cab537912b481c8b9aca0820f138bb?format=webp&width=800&height=1200" alt="شعار لينك بوست" className="h-9 w-9 rounded-xl object-contain" /><span className="text-lg font-bold">لينك بوست</span></Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex"><Link to="/" hash="features">المزايا</Link><Link to="/" hash="how">كيف يعمل</Link><Link to="/" hash="pricing">الأسعار</Link></nav>
          <div className="flex items-center gap-2"><LanguageSwitcher /><Link to="/auth"><Button size="sm" className="bg-gradient-primary shadow-soft">ابدأ مجانًا</Button></Link></div>
        </div>
      </header>

      <main>
        <section className="bg-gradient-hero px-4 py-20 md:py-28">
          <div className="mx-auto max-w-4xl text-center"><p className="font-semibold text-primary">{eyebrow}</p><h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-6xl">{title}</h1><p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">{description}</p><Link to="/auth" className="mt-8 inline-block"><Button size="lg" className="min-h-12 bg-gradient-primary px-7 shadow-soft">جرّب لينك بوست مجانًا <ArrowRight className="ms-2 inline h-4 w-4" /></Button></Link></div>
        </section>

        <article className="mx-auto max-w-4xl px-4 py-16">
          <div className="space-y-6">{sections.map((section) => <Card key={section.title} className="border-border/60 p-6 md:p-8"><h2 className="text-2xl font-bold md:text-3xl">{section.title}</h2><p className="mt-4 leading-8 text-muted-foreground">{section.text}</p>{section.bullets && <ul className="mt-5 grid gap-3 md:grid-cols-2">{section.bullets.map((bullet) => <li key={bullet} className="flex items-start gap-2 text-sm leading-7"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />{bullet}</li>)}</ul>}</Card>)}</div>
          <div className="mt-12 rounded-2xl bg-secondary/50 p-8 text-center"><h2 className="text-2xl font-bold">حوّل خبرتك إلى حضور مستمر</h2><p className="mt-3 text-muted-foreground">أنشئ محتوى يناسب تخصصك، وابدأ بثلاثة منشورات مجانية دون بطاقة.</p><Link to="/auth" className="mt-6 inline-block"><Button size="lg" className="min-h-12 bg-gradient-primary px-7">ابدأ 3 منشورات مجانًا</Button></Link></div>
        </article>
      </main>

      <footer className="border-t border-border/60 py-8"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row"><Link to="/" className="font-semibold text-foreground">لينك بوست</Link><div className="flex flex-wrap justify-center gap-4"><Link to="/ar/how-to-write-linkedin-post">كتابة المنشورات</Link><Link to="/ar/linkedin-profile-optimization">تحسين الملف</Link><Link to="/ar/linkedin-content-ideas">أفكار المحتوى</Link><Link to="/ar/linkedin-post-scheduler">الجدولة</Link></div></div></footer>
    </div>
  );
}
