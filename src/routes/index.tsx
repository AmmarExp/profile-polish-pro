import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import heroCompare from "@/assets/hero-compare.jpg";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Calendar,
  Check,
  Lightbulb,
  Palette,
  Sparkles,
  Target,
  TrendingUp,
  UserRoundCheck,
  Wand2,
  Languages as LanguagesIcon,
} from "lucide-react";

const faqItems = [
  ["هل يحتاج لينك بوست إلى بيانات بطاقتي عند التجربة؟", "لا، يمكنك البدء بالتجربة المجانية والحصول على 3 منشورات دون بطاقة."],
  ["هل أستطيع مراجعة المنشور قبل نشره؟", "نعم، يمكنك مراجعة النص وتعديله قبل النشر، أو اختيار الجدولة وفق إعداداتك."],
  ["هل يدعم لينك بوست الكتابة بالعربية؟", "نعم، يمكنك إنشاء محتوى بالعربية والإنجليزية وفق جمهورك."],
  ["هل يصلح للباحثين عن عمل في السعودية والإمارات؟", "نعم، يساعدك على بناء حضور مهني وإبراز الخبرات والمشاريع أمام مسؤولي التوظيف."],
  ["هل يصلح للمستقلين وأصحاب الأعمال؟", "نعم، يمكنك استخدامه لنشر خبرتك ودراسات الحالة والنصائح المهنية لجذب العملاء وبناء الثقة."],
  ["هل ينشر لينك بوست تلقائيًا في لينكدإن؟", "يمكنك ربط حساب لينكدإن واختيار الجدولة أو مراجعة المنشورات قبل نشرها حسب إعداداتك."],
  ["ما النبرات المتاحة للمحتوى؟", "ودودة، رسمية، ملهمة، تعليمية، أو مباشرة، مع تخصيص المحتوى بما يناسب شخصيتك."],
] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map(([name, text]) => ({
            "@type": "Question",
            name,
            acceptedAnswer: { "@type": "Answer", text },
          })),
        }),
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { dir } = useI18n();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  const features = [
    [Wand2, "محتوى مخصص لتخصصك", "منشورات مبنية على مجالك وخبراتك والجمهور الذي تريد الوصول إليه."],
    [Calendar, "جدولة تلقائية ومرنة", "حدد عدد المنشورات وأوقات النشر، أو دع لينك بوست يدير الجدول عنك."],
    [Palette, "نبرة صوت تشبهك", "اختر نبرة ودودة أو رسمية أو تعليمية أو ملهمة أو مباشرة، وعدّل النص قبل النشر."],
    [UserRoundCheck, "تحسين ذكي للملف الشخصي", "اقتراحات عملية لتطوير العنوان والنبذة والخبرات كي يصبح ملفك أوضح وأكثر إقناعًا."],
    [LanguagesIcon, "عربي وإنجليزي", "أنشئ محتوى يناسب جمهورك في الخليج أو جمهورك العالمي من مكان واحد."],
    [BarChart3, "نتائج تتابعها", "راقب نمو نشاطك وتفاعل جمهورك، واعرف أي نوع من المحتوى يحقق نتائج أفضل."],
  ] as const;

  const steps = [
    ["أنشئ حسابك", "ابدأ بسرعة باستخدام بريدك الإلكتروني."],
    ["اربط حساب لينكدإن", "اربط حسابك بطريقة آمنة."],
    ["حدد تخصصك وهدفك", "اختر هدفك، مثل الحصول على وظيفة أو جذب عملاء أو بناء علامة شخصية."],
    ["اختر نبرتك وجدولك", "حدد أسلوب المحتوى وعدد المنشورات وأوقات النشر."],
    ["راجع وانشر", "راجع المحتوى قبل النشر أو فعّل النشر المجدول حسب تفضيلك."],
  ] as const;

  const useCases = [
    [BriefcaseBusiness, "للباحث عن وظيفة", "شارك خبراتك ومهاراتك ومشاريعك حتى يظهر ملفك أمام مسؤولي التوظيف."],
    [Target, "للمستقل أو الاستشاري", "انشر محتوى يثبت خبرتك ويبني الثقة مع العملاء المحتملين."],
    [TrendingUp, "لرائد الأعمال", "شارك الدروس والتحديثات والرؤية خلف مشروعك لبناء جمهور مؤمن بما تقدمه."],
    [Lightbulb, "للمدير أو الخبير", "حوّل خبرتك اليومية إلى أفكار قيادية وتعليمية قابلة للنشر."],
    [Sparkles, "لصنّاع المحتوى", "حافظ على جدول ثابت دون الوقوع في مشكلة «ماذا أنشر اليوم؟»."],
  ] as const;

  const plans = [
    ["التجربة المجانية", "$0", "3 منشورات لتجربة جودة المحتوى قبل الاشتراك.", "ابدأ مجانًا", false],
    ["Pro شهري", "$49/شهر", "منشورات يومية غير محدودة، جدولة مرنة، وتوصيات لتحسين ملفك.", "اشترك في Pro", true],
    ["Pro سنوي", "$490/سنة", "كل مزايا Pro مع توفير يعادل شهرين مقارنة بالدفع الشهري.", "اختر الخطة السنوية", false],
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="https://cdn.builder.io/api/v1/image/assets%2F346e6505607b4f3892f8a2e9c5da6d92%2Fb7cab537912b481c8b9aca0820f138bb?format=webp&width=800&height=1200" alt="شعار لينك بوست" className="h-9 w-9 rounded-xl object-contain" />
            <span className="text-lg font-bold tracking-tight">لينك بوست</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex" aria-label="التنقل الرئيسي">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">المزايا</a>
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground">كيف يعمل</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">الأسعار</a>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link to="/auth"><Button variant="ghost" size="sm">تسجيل الدخول</Button></Link>
            <Link to="/auth"><Button size="sm" className="bg-gradient-primary shadow-soft">ابدأ مجانًا</Button></Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-gradient-hero">
          <div className="mx-auto max-w-7xl px-4 py-16 md:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <Badge className="mb-4 border-0 bg-accent/20 text-accent-foreground hover:bg-accent/30"><Sparkles className="me-1 h-3 w-3" /> مساعدك الذكي على لينكدإن</Badge>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">اكتب وانشر محتوى لينكدإن احترافيًا بالذكاء الاصطناعي</h1>
              <p className="mt-5 text-lg text-muted-foreground">لينك بوست يكتب لك منشورات لينكدإن مبنية على تخصصك وأهدافك ونبرة صوتك، ثم يساعدك على جدولتها بمرونة. ركّز على عملك، واترك للذكاء الاصطناعي مهمة الحفاظ على حضورك المهني.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/auth"><Button size="lg" className="min-h-12 gap-2 bg-gradient-primary px-6 shadow-soft">جرّب مجانًا — 3 منشورات <Arrow className="h-4 w-4" /></Button></Link>
                <Link to="/auth"><Button size="lg" variant="outline" className="min-h-12 px-6">حسّن حسابي على لينكدإن</Button></Link>
              </div>
              <p className="mt-6 text-sm text-muted-foreground"><Check className="me-1 inline h-4 w-4 text-primary" /> لا تحتاج بطاقة للدخول. ابدأ بثلاثة منشورات مجانية.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">عندك خبرة تستحق الظهور، لكن ما عندك وقت تكتب كل يوم؟</h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">الاستمرارية في لينكدإن تصنع الفرق، لكن البحث عن فكرة وكتابة منشور ثم نشره في الوقت المناسب قد يتحول إلى مهمة مؤجلة دائمًا. لينك بوست يحوّل خبرتك وأهدافك إلى محتوى مهني جاهز للنشر، بأسلوب يشبهك لا بأسلوب آلي مكرر.</p>
          </div>
        </section>

        <section id="features" className="bg-secondary/40 py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mx-auto max-w-2xl text-center"><h2 className="text-3xl font-bold md:text-4xl">كل ما تحتاجه لنمو حسابك على لينكدإن</h2></div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {features.map(([Icon, title, description]) => <Card key={title} className="border-border/60 p-6 transition-all hover:-translate-y-0.5 hover:shadow-soft"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10"><Icon className="h-5 w-5 text-primary" /></div><h3 className="text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p></Card>)}
            </div>
            <div className="mt-10 text-center"><Link to="/auth"><Button size="lg" className="min-h-12 bg-gradient-primary px-6 shadow-soft">ابدأ كتابة محتواك الآن <Arrow className="ms-2 h-4 w-4 inline" /></Button></Link></div>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-7xl px-4 py-20">
          <div className="mx-auto max-w-3xl text-center"><h2 className="text-3xl font-bold md:text-4xl">من حساب هادئ إلى حضور مهني مستمر في دقائق</h2></div>
          <div className="mt-12 grid gap-4 md:grid-cols-5">
            {steps.map(([title, description], index) => <Card key={title} className="relative p-6"><div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">{index + 1}</div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm leading-7 text-muted-foreground">{description}</p></Card>)}
          </div>
        </section>

        <section className="bg-secondary/40 py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mx-auto max-w-2xl text-center"><h2 className="text-3xl font-bold md:text-4xl">محتوى لينكدإن يناسب هدفك المهني</h2></div>
            <div className="mt-12 grid gap-5 md:grid-cols-5">
              {useCases.map(([Icon, title, description]) => <Card key={title} className="border-border/60 p-5"><Icon className="mb-4 h-6 w-6 text-primary" /><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p></Card>)}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-20 md:grid-cols-2">
          <img src={heroCompare} alt="الفرق بين ملف لينكدإن هادئ وحضور مهني مستمر" width={1024} height={1024} loading="lazy" className="h-auto w-full rounded-2xl shadow-soft" />
          <div><Badge className="border-0 bg-accent/20 text-accent-foreground">حضور مهني أوضح</Badge><h2 className="mt-4 text-3xl font-bold md:text-4xl">لا تترك ملفك المهني صامتًا</h2><p className="mt-4 text-lg leading-8 text-muted-foreground">ملف لينكدإن الجيد هو البداية، لكن المحتوى المستمر هو ما يحوّله إلى مصدر للفرص. لينك بوست يساعدك على الظهور بخبرة ووضوح أمام أصحاب العمل والعملاء والشركاء المحتملين.</p></div>
        </section>

        <section id="pricing" className="bg-secondary/40 py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mx-auto max-w-3xl text-center"><h2 className="text-3xl font-bold md:text-4xl">ابدأ مجانًا، وطوّر حضورك عندما تكون جاهزًا</h2></div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {plans.map(([title, price, description, cta, featured]) => <Card key={title} className={`relative p-6 ${featured ? "border-primary shadow-glow" : ""}`}>{featured && <Badge className="absolute -top-3 start-6 border-0 bg-gradient-primary text-primary-foreground">الأكثر اختيارًا</Badge>}<h3 className="text-lg font-semibold">{title}</h3><div className="mt-4 text-4xl font-extrabold" dir="ltr">{price}</div><p className="mt-3 min-h-12 text-sm leading-7 text-muted-foreground">{description}</p><Link to="/auth" className="mt-6 block"><Button className={`min-h-12 w-full ${featured ? "bg-gradient-primary" : ""}`} variant={featured ? "default" : "outline"}>{cta}</Button></Link></Card>)}
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">يمكن إظهار الريال السعودي والدرهم الإماراتي كخيارات عملة عند دعم الدفع متعدد العملات.</p>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-3xl px-4 py-20">
          <h2 className="text-center text-3xl font-bold md:text-4xl">أسئلة شائعة</h2>
          <Accordion type="single" collapsible className="mt-10 rounded-2xl border border-border/60 bg-card px-6">
            {faqItems.map(([question, answer], index) => <AccordionItem key={question} value={`faq-${index}`}><AccordionTrigger className="text-right text-base hover:no-underline">{question}</AccordionTrigger><AccordionContent className="leading-7 text-muted-foreground">{answer}</AccordionContent></AccordionItem>)}
          </Accordion>
        </section>

        <section className="bg-gradient-hero py-20">
          <div className="mx-auto max-w-3xl px-4 text-center"><h2 className="text-3xl font-bold md:text-4xl">حضورك المهني يستحق أن يكون مستمرًا</h2><p className="mt-4 text-lg leading-8 text-muted-foreground">لا تنتظر الفكرة المثالية أو الوقت المناسب. أخبر لينك بوست عن تخصصك وهدفك، ودع الذكاء الاصطناعي يساعدك على نشر محتوى مهني يعبّر عنك.</p><Link to="/auth" className="mt-8 inline-block"><Button size="lg" className="min-h-12 bg-gradient-primary px-7 shadow-soft">ابدأ 3 منشورات مجانًا <Arrow className="ms-2 inline h-4 w-4" /></Button></Link></div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row"><Link to="/" className="flex items-center gap-2"><img src="https://cdn.builder.io/api/v1/image/assets%2F346e6505607b4f3892f8a2e9c5da6d92%2Fb7cab537912b481c8b9aca0820f138bb?format=webp&width=800&height=1200" alt="شعار لينك بوست" className="h-8 w-8 rounded-lg object-contain" /><span className="font-semibold">لينك بوست</span></Link><nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground" aria-label="روابط التذييل"><a href="#pricing">الأسعار</a><a href="#how">كيف يعمل</a><a href="#faq">الأسئلة الشائعة</a><a href="/privacy">سياسة الخصوصية</a><a href="/terms">الشروط</a><a href="/contact">التواصل</a></nav></div>
          <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground"><a href="/ar/how-to-write-linkedin-post">كتابة منشورات لينكدإن</a><a href="/ar/linkedin-profile-optimization">تحسين ملف لينكدإن</a><a href="/ar/linkedin-content-ideas">أفكار محتوى لينكدإن</a><a href="/ar/linkedin-post-scheduler">جدولة منشورات لينكدإن</a></div>
          <p className="mt-6 text-center text-sm text-muted-foreground">© {new Date().getFullYear()} لينك بوست. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
