import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import heroCompare from "@/assets/hero-compare.jpg";
import {
  Sparkles,
  Calendar,
  Wand2,
  Languages as LanguagesIcon,
  TrendingUp,
  Palette,
  Check,
  ArrowLeft,
  ArrowRight,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { t, lang, dir } = useI18n();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">ReachLink</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">{t("nav.features")}</a>
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground">{t("nav.how")}</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">{t("nav.pricing")}</a>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link to="/auth">
              <Button variant="ghost" size="sm">{t("nav.login")}</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-gradient-primary shadow-soft">{t("nav.start")}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-accent/20 text-accent-foreground hover:bg-accent/30 border-0">
              <Sparkles className="me-1 h-3 w-3" /> {t("hero.badge")}
            </Badge>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              {t("hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-primary shadow-soft gap-2">
                  {t("hero.cta")} <Arrow className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#how">
                <Button size="lg" variant="outline">{t("hero.cta2")}</Button>
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground justify-center">
              <div className="flex items-center gap-1"><Check className="h-4 w-4 text-primary" /> {lang === "ar" ? "بدون بطاقة" : "No card"}</div>
              <div className="flex items-center gap-1"><Check className="h-4 w-4 text-primary" /> {lang === "ar" ? "3 منشورات مجانية" : "3 free posts"}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">{t("feat.title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("feat.subtitle")}</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { icon: Wand2, t: t("feat.1.title"), d: t("feat.1.desc") },
            { icon: TrendingUp, t: t("feat.2.title"), d: t("feat.2.desc") },
            { icon: Palette, t: t("feat.3.title"), d: t("feat.3.desc") },
            { icon: Calendar, t: t("feat.4.title"), d: t("feat.4.desc") },
            { icon: LanguagesIcon, t: t("feat.5.title"), d: t("feat.5.desc") },
            { icon: Sparkles, t: t("feat.6.title"), d: t("feat.6.desc") },
          ].map(({ icon: Icon, t: title, d }) => (
            <Card key={title} className="border-border/60 p-6 transition-all hover:shadow-soft hover:-translate-y-0.5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Compare */}
      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold md:text-4xl text-center">{t("compare.title")}</h2>
          <p className="mt-3 text-muted-foreground text-center mx-auto max-w-2xl">{t("compare.subtitle")}</p>
          <div className="mt-8 flex items-start gap-4 rounded-2xl bg-background p-5 shadow-soft max-w-2xl mx-auto">
            <div className="rounded-xl bg-accent/20 p-3 flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-accent-foreground" />
            </div>
            <p className="text-sm leading-relaxed">{t("compare.jobs")}</p>
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">{t("how.title")}</h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {[
            [t("how.1.t"), t("how.1.d")],
            [t("how.2.t"), t("how.2.d")],
            [t("how.3.t"), t("how.3.d")],
            [t("how.4.t"), t("how.4.d")],
          ].map(([title, desc], i) => (
            <Card key={title} className="relative p-6">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </Card>
          ))}
        </div>
        <div className="mt-16 mx-auto max-w-2xl">
          <h3 className="text-2xl font-bold text-center">{lang === "ar" ? "منشورات مستمرة = فرص وظيفية أكثر" : "Consistent posts = more opportunities"}</h3>
          <p className="mt-3 text-muted-foreground text-center">
            {lang === "ar"
              ? "شركات كثيرة توظف عبر لينكدإن أولاً. كل منشور جديد لك يزيد من ظهورك أمام مسؤولي التوظيف."
              : "Many companies hire on LinkedIn first. Every new post you make puts you in front of more recruiters."}
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">{t("price.title")}</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { plan: "free", price: "0", per: "", title: t("price.free.t"), desc: t("price.free.d"), pop: false },
              { plan: "pro_monthly", price: "49", per: t("price.month"), title: t("price.pro.t"), desc: t("price.pro.d"), pop: true },
              { plan: "pro_yearly", price: "490", per: t("price.year"), title: t("price.yearly.t"), desc: t("price.yearly.d"), pop: false },
            ].map((p) => (
              <Card key={p.plan} className={`relative p-6 ${p.pop ? "border-primary shadow-glow" : ""}`}>
                {p.pop && (
                  <Badge className="absolute -top-3 start-6 bg-gradient-primary text-primary-foreground border-0">
                    {t("price.pop")}
                  </Badge>
                )}
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">${p.price}</span>
                  <span className="text-sm text-muted-foreground">{p.per}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>
                <Link to="/auth" className="mt-6 block">
                  <Button className={`w-full ${p.pop ? "bg-gradient-primary" : ""}`} variant={p.pop ? "default" : "outline"}>
                    {t("price.cta")}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">ReachLink</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ReachLink. {t("foot.rights")}
          </p>
        </div>
      </footer>
    </div>
  );
}
