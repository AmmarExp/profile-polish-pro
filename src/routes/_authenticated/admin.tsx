import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { BarChart3, FileText, LayoutDashboard, Linkedin, Menu, Search, Settings, Sparkles, Users, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({ component: AdminPage });

type Section = "overview" | "users" | "tones" | "templates" | "settings";

const navItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "users", label: "المستخدمون", icon: Users },
  { id: "tones", label: "إدارة المودات", icon: Sparkles },
  { id: "templates", label: "القوالب", icon: FileText },
  { id: "settings", label: "الإعدادات العامة", icon: Settings },
];

const tones = [
  { name: "ودّي", emoji: "😊", prompt: "اكتب المنشور بأسلوب ودي وحميمي كأنك تتحدث مع أصدقاء. استخدم لغة بسيطة\nوجُمَلاً قصيرة. ابدأ بسؤال أو موقف من الحياة اليومية. أضف لمسة شخصية\nوتجنب المصطلحات التقنية المعقدة." },
  { name: "رسمي", emoji: "🎩", prompt: "اكتب بلغة مهنية وواضحة، مع الحفاظ على نبرة رسمية ومباشرة." },
  { name: "ملهم", emoji: "🔥", prompt: "اكتب رسالة ملهمة تركز على الدروس والتقدم والثقة بالنفس." },
  { name: "تعليمي", emoji: "📚", prompt: "بسّط الفكرة إلى خطوات عملية وأمثلة مفيدة وسهلة التطبيق." },
  { name: "خفيف الظل", emoji: "😄", prompt: "اكتب بروح مرحة ولطيفة، من دون أن تفقد الرسالة المهنية." },
];

const people = [
  ["أحمد محمد", "ahmed@reachlink.sa", "برو", "متصل ✅", "منذ 5 دقائق"],
  ["سارة العتيبي", "sara@reachlink.sa", "مجاني", "غير متصل", "منذ ساعة"],
  ["خالد السالم", "khaled@reachlink.sa", "برو", "متصل ✅", "أمس"],
  ["نورة القحطاني", "noura@reachlink.sa", "مجاني", "متصل ✅", "أمس"],
  ["فهد الغامدي", "fahad@reachlink.sa", "برو", "غير متصل", "منذ 3 أيام"],
];

function AdminPage() {
  // TODO: connect the administrator role gate.
  const [isAdmin] = useState(true);
  const [section, setSection] = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedTone, setExpandedTone] = useState("ودّي");
  const [testOpen, setTestOpen] = useState(false);
  const [testTopic, setTestTopic] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [imageGeneration, setImageGeneration] = useState(true);

  if (!isAdmin) {
    return <AppShell><div className="py-20 text-center" dir="rtl"><h1 className="text-2xl font-bold">غير مصرح لك</h1><p className="mt-2 text-muted-foreground">لا تملك صلاحية الوصول إلى لوحة التحكم.</p></div></AppShell>;
  }

  const selectSection = (nextSection: Section) => {
    setSection(nextSection);
    setSidebarOpen(false);
  };

  return (
    <AppShell>
      <div className="mx-auto flex max-w-7xl gap-6" dir="rtl">
        <aside className={`fixed inset-y-0 right-0 z-50 w-72 border-l border-border bg-background p-5 shadow-xl transition-transform lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:translate-x-0 lg:rounded-2xl lg:border lg:shadow-soft ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground"><Sparkles className="h-5 w-5" /></div><span className="font-bold">لوحة تحكم المشرف</span></div>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></Button>
          </div>
          <nav className="space-y-2">
            {navItems.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => selectSection(id)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right text-sm font-medium transition ${section === id ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}><Icon className="h-4 w-4" />{label}</button>)}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <div className="flex items-center justify-between lg:hidden"><h1 className="text-xl font-bold">لوحة تحكم المشرف</h1><Button variant="outline" size="icon" onClick={() => setSidebarOpen(true)}><Menu className="h-5 w-5" /></Button></div>
          {section === "overview" && <Overview />}
          {section === "users" && <UsersSection />}
          {section === "tones" && <TonesSection expandedTone={expandedTone} setExpandedTone={setExpandedTone} onTest={() => setTestOpen(true)} />}
          {section === "templates" && <TemplatesSection />}
          {section === "settings" && <SettingsSection imageGeneration={imageGeneration} setImageGeneration={setImageGeneration} />}
        </main>
      </div>

      <Dialog open={testOpen} onOpenChange={setTestOpen}>
        <DialogContent dir="rtl" className="sm:max-w-lg"><DialogHeader><DialogTitle>اختبر الآن</DialogTitle><DialogDescription>جرّب البرامت على موضوع تجريبي قبل حفظه.</DialogDescription></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label htmlFor="test-topic">أدخل موضوعاً للاختبار</Label><Input id="test-topic" value={testTopic} onChange={(event) => setTestTopic(event.target.value)} placeholder="مثال: درس تعلمته في العمل" /></div>{testOutput && <div className="rounded-xl bg-secondary p-4 text-sm leading-7">{testOutput}</div>}<Button onClick={() => setTestOutput(`هذا مثال تجريبي لمنشور عن: ${testTopic || "موضوعك"}.\n\nالفكرة البسيطة قد تصنع فرقاً كبيراً عندما نشاركها مع الآخرين.`)} className="w-full bg-gradient-primary">توليد</Button></div></DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Overview() {
  const stats = [["إجمالي المستخدمين", "248", Users], ["المستخدمون النشطون (7 أيام)", "89", BarChart3], ["المنشورات المنشورة اليوم", "34", FileText], ["المستخدمون المرتبطون بـ LinkedIn", "156", Linkedin]];
  return <><header><p className="text-sm text-muted-foreground">نظرة عامة</p><h1 className="text-2xl font-bold sm:text-3xl">أهلاً بك في لوحة المشرف</h1></header><section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value, Icon]) => <Card key={String(label)} className="p-5 shadow-soft"><div className="flex items-start justify-between"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p></div><div className="rounded-xl bg-primary/10 p-3"><Icon className="h-5 w-5 text-primary" /></div></div></Card>)}</section><section className="grid gap-4 lg:grid-cols-2"><ChartCard title="منشورات يومية — آخر 30 يوم" kind="bars" /><ChartCard title="نمو المستخدمين — آخر 6 أشهر" kind="line" /></section><section><h2 className="mb-3 text-xl font-bold">النشاط الأخير</h2><Card className="divide-y divide-border">{["أحمد نشر منشوراً • منذ 5 دقائق", "سارة أنشأت حساباً جديداً • منذ 24 دقيقة", "خالد ربط حساب LinkedIn • منذ ساعة", "نورة حفظت مسودة جديدة • منذ ساعتين", "فهد اشترك في خطة برو • أمس"].map((activity) => <div key={activity} className="flex items-center gap-3 p-4"><span className="h-2 w-2 rounded-full bg-primary" /><p className="text-sm">{activity}</p></div>)}</Card></section></>;
}

function ChartCard({ title, kind }: { title: string; kind: "bars" | "line" }) {
  const barHeights = ["h-[35%]", "h-[62%]", "h-[45%]", "h-[78%]", "h-[55%]", "h-[90%]", "h-[68%]", "h-[82%]", "h-[48%]", "h-[73%]", "h-[96%]", "h-[66%]"];
  return <Card className="p-5"><h2 className="font-bold">{title}</h2><div className="mt-6 flex h-48 items-end gap-2 rounded-xl bg-secondary/60 p-5">{kind === "bars" ? barHeights.map((height, index) => <span key={index} className={`flex-1 rounded-t bg-gradient-primary ${height}`} />) : <svg viewBox="0 0 400 160" className="h-full w-full" preserveAspectRatio="none"><path d="M0 130 C45 105 65 120 95 90 S145 110 180 70 S230 95 260 55 S330 55 400 18" fill="none" stroke="hsl(var(--primary))" strokeWidth="7" strokeLinecap="round" /></svg>}</div></Card>;
}

function UsersSection() {
  const [filter, setFilter] = useState("الكل");
  return <><header><p className="text-sm text-muted-foreground">إدارة الحسابات</p><h1 className="text-2xl font-bold sm:text-3xl">المستخدمون</h1></header><div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pr-9" placeholder="ابحث عن مستخدم..." /></div><div className="flex flex-wrap gap-2">{["الكل", "برو", "مجاني", "متصل بـ LinkedIn"].map((chip) => <Button key={chip} variant={filter === chip ? "default" : "outline"} size="sm" onClick={() => setFilter(chip)}>{chip}</Button>)}</div></div><Card className="overflow-x-auto"><table className="w-full min-w-[760px] text-right text-sm"><thead className="border-b bg-secondary/50 text-muted-foreground"><tr>{["الاسم", "البريد الإلكتروني", "الخطة", "LinkedIn", "آخر نشاط", "الإجراءات"].map((heading) => <th key={heading} className="whitespace-nowrap p-4 font-medium">{heading}</th>)}</tr></thead><tbody>{people.map(([name, email, plan, linkedin, lastActive]) => <tr key={email} className="border-b border-border last:border-0"><td className="p-4 font-medium">{name}</td><td className="p-4 text-muted-foreground">{email}</td><td className="p-4"><Badge className={plan === "برو" ? "bg-primary/10 text-primary hover:bg-primary/10" : "bg-secondary text-foreground hover:bg-secondary"}>{plan}</Badge></td><td className="p-4"><Badge variant="outline" className={linkedin === "متصل ✅" ? "border-emerald-500/40 text-emerald-700" : "text-muted-foreground"}>{linkedin}</Badge></td><td className="p-4 text-muted-foreground">{lastActive}</td><td className="p-4"><div className="flex gap-2"><Button variant="ghost" size="sm">عرض</Button><Button variant="ghost" size="sm" className="text-destructive">تعطيل</Button></div></td></tr>)}</tbody></table></Card></>;
}

function TonesSection({ expandedTone, setExpandedTone, onTest }: { expandedTone: string; setExpandedTone: (tone: string) => void; onTest: () => void }) {
  const [prompts, setPrompts] = useState(Object.fromEntries(tones.map((tone) => [tone.name, tone.prompt])));
  return <><header><p className="text-sm text-muted-foreground">إعدادات الذكاء الاصطناعي</p><h1 className="text-2xl font-bold sm:text-3xl">إدارة مودات الكتابة</h1><p className="mt-2 text-muted-foreground">قم بكتابة البرامت الخاص بكل أسلوب كتابة. سيستخدمه الذكاء الاصطناعي مع كل عميل.</p></header><div className="space-y-3">{tones.map((tone) => { const expanded = expandedTone === tone.name; return <Card key={tone.name} className="p-5"><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-bold">{tone.emoji} {tone.name}</h2><p className="mt-1 text-sm text-muted-foreground">آخر تحديث: 10 يوليو 2026</p></div><Button variant={expanded ? "outline" : "default"} size="sm" onClick={() => setExpandedTone(expanded ? "" : tone.name)}>{expanded ? "إغلاق" : "تعديل"}</Button></div>{expanded && <div className="mt-5 border-t pt-5"><div className="space-y-2"><Label htmlFor={`prompt-${tone.name}`}>البرامت الخاص بهذا الأسلوب</Label><Textarea id={`prompt-${tone.name}`} rows={10} value={prompts[tone.name]} onChange={(event) => setPrompts({ ...prompts, [tone.name]: event.target.value })} placeholder="اكتب هنا التعليمات التي سيستخدمها الذكاء الاصطناعي عند اختيار هذا الأسلوب. مثال: اكتب بلغة بسيطة وودية وكأنك تحدث صديقاً..." /></div><div className="mt-4 flex flex-wrap gap-2"><Button className="bg-gradient-primary">احفظ البرامت</Button><Button variant="outline" onClick={onTest}>اختبر الآن</Button></div></div>}</Card>; })}</div></>;
}

function TemplatesSection() {
  const [activeTemplates, setActiveTemplates] = useState([true, true, false, true, true]);
  const templates = [["قصة من تجربة", "ودّي", "العربية"], ["نصيحة مهنية", "تعليمي", "العربية"], ["إنجاز فريق", "رسمي", "العربية"], ["فكرة ملهمة", "ملهم", "العربية"], ["موقف خفيف", "خفيف الظل", "العربية"]];
  return <><div className="flex flex-wrap items-end justify-between gap-3"><header><p className="text-sm text-muted-foreground">مكتبة المحتوى</p><h1 className="text-2xl font-bold sm:text-3xl">القوالب</h1></header><Button className="bg-gradient-primary">إضافة قالب جديد</Button></div><Card className="overflow-x-auto"><table className="w-full min-w-[600px] text-right text-sm"><thead className="border-b bg-secondary/50 text-muted-foreground"><tr>{["الاسم", "الأسلوب", "اللغة", "الحالة", "الإجراءات"].map((heading) => <th key={heading} className="p-4 font-medium">{heading}</th>)}</tr></thead><tbody>{templates.map(([name, tone, language], index) => <tr key={name} className="border-b border-border last:border-0"><td className="p-4 font-medium">{name}</td><td className="p-4"><Badge variant="outline">{tone}</Badge></td><td className="p-4">{language}</td><td className="p-4"><div className="flex items-center gap-2"><Switch checked={activeTemplates[index]} onCheckedChange={(checked) => setActiveTemplates(activeTemplates.map((active, activeIndex) => activeIndex === index ? checked : active))} /><span className="text-sm">{activeTemplates[index] ? "نشط" : "معطّل"}</span></div></td><td className="p-4"><Button variant="ghost" size="sm">تعديل</Button></td></tr>)}</tbody></table></Card></>;
}

function SettingsSection({ imageGeneration, setImageGeneration }: { imageGeneration: boolean; setImageGeneration: (value: boolean) => void }) {
  return <><header><p className="text-sm text-muted-foreground">تخصيص المنصة</p><h1 className="text-2xl font-bold sm:text-3xl">الإعدادات العامة</h1></header><Card className="max-w-2xl space-y-5 p-5 sm:p-7"><div className="space-y-2"><Label htmlFor="app-name">اسم التطبيق</Label><Input id="app-name" defaultValue="ReachLink" /></div><div className="space-y-2"><Label htmlFor="monthly-limit">الحد الأقصى لمنشورات المجانيين في الشهر</Label><Input id="monthly-limit" type="number" defaultValue="3" /></div><div className="flex items-center justify-between rounded-xl border border-border p-4"><div><Label>تفعيل توليد الصور</Label><p className="mt-1 text-sm text-muted-foreground">اسمح للمستخدمين بطلب صور لمنشوراتهم.</p></div><Switch checked={imageGeneration} onCheckedChange={setImageGeneration} /></div><div className="space-y-2"><Label htmlFor="welcome-message">رسالة الترحيب للمستخدمين الجدد</Label><Textarea id="welcome-message" rows={5} defaultValue="مرحباً بك في ReachLink. لنبدأ في تحويل أفكارك إلى محتوى مهني مؤثر." /></div><Button className="bg-gradient-primary">حفظ الإعدادات</Button></Card></>;
}
