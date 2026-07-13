import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FileText, LayoutDashboard, Linkedin, Loader2, Menu, Search, Settings, Sparkles, Users, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import {
  adminListSettings, adminListTones, adminListUsers, adminOverview,
  adminSaveSettings, adminSaveTone, adminToggleUser, checkIsAdmin,
} from "@/lib/admin.functions";
import { generateLinkedInPost } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({ component: AdminPage });

type Section = "overview" | "users" | "tones" | "settings";

const navItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "users", label: "المستخدمون", icon: Users },
  { id: "tones", label: "إدارة المودات", icon: Sparkles },
  { id: "settings", label: "الإعدادات العامة", icon: Settings },
];

const toneEmojis: Record<string, string> = {
  "ودّي": "😊", "رسمي": "🎩", "ملهم": "🔥", "تعليمي": "📚", "خفيف الظل": "😄",
};

function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [section, setSection] = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const check = useServerFn(checkIsAdmin);

  useEffect(() => {
    (async () => {
      try {
        const r = await check();
        setIsAdmin(!!r.isAdmin);
      } catch {
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) {
    return <AppShell><div className="flex min-h-72 items-center justify-center" dir="rtl"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></AppShell>;
  }
  if (!isAdmin) {
    return <AppShell><div className="py-20 text-center" dir="rtl"><h1 className="text-2xl font-bold">غير مصرح لك بالوصول</h1><p className="mt-2 text-muted-foreground">لا تملك صلاحية الوصول إلى لوحة التحكم.</p><Button className="mt-4" onClick={() => history.back()}>رجوع</Button></div></AppShell>;
  }

  const selectSection = (nextSection: Section) => { setSection(nextSection); setSidebarOpen(false); };

  return (
    <AppShell>
      <div className="mx-auto flex max-w-7xl gap-6" dir="rtl">
        <aside className={`fixed inset-y-0 right-0 z-50 w-72 border-l border-border bg-background p-5 shadow-xl transition-transform lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:translate-x-0 lg:rounded-2xl lg:border lg:shadow-soft ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground"><Sparkles className="h-5 w-5" /></div><span className="font-bold">لوحة تحكم المشرف</span></div>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></Button>
          </div>
          <nav className="space-y-2">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => selectSection(id)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right text-sm font-medium transition ${section === id ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <div className="flex items-center justify-between lg:hidden"><h1 className="text-xl font-bold">لوحة تحكم المشرف</h1><Button variant="outline" size="icon" onClick={() => setSidebarOpen(true)}><Menu className="h-5 w-5" /></Button></div>
          {section === "overview" && <Overview />}
          {section === "users" && <UsersSection />}
          {section === "tones" && <TonesSection />}
          {section === "settings" && <SettingsSection />}
        </main>
      </div>
    </AppShell>
  );
}

function Overview() {
  const [stats, setStats] = useState<{ totalUsers: number; linkedinConnected: number; publishedToday: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const fn = useServerFn(adminOverview);
  useEffect(() => {
    (async () => {
      try { setStats(await fn()); } catch (e: any) { toast.error(e?.message ?? "تعذر تحميل الإحصائيات"); }
      finally { setLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const cards: Array<[string, number | string, typeof Users]> = [
    ["إجمالي المستخدمين", stats?.totalUsers ?? "—", Users],
    ["المنشورات المنشورة اليوم", stats?.publishedToday ?? "—", FileText],
    ["المتصلون بـ LinkedIn", stats?.linkedinConnected ?? "—", Linkedin],
  ];
  return (
    <>
      <header><p className="text-sm text-muted-foreground">نظرة عامة</p><h1 className="text-2xl font-bold sm:text-3xl">أهلاً بك في لوحة المشرف</h1></header>
      {loading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map(([label, value, Icon]) => (
            <Card key={label} className="p-5 shadow-soft">
              <div className="flex items-start justify-between">
                <div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p></div>
                <div className="rounded-xl bg-primary/10 p-3"><Icon className="h-5 w-5 text-primary" /></div>
              </div>
            </Card>
          ))}
        </section>
      )}
    </>
  );
}

function UsersSection() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"الكل" | "متصل" | "معطّل">("الكل");
  const listFn = useServerFn(adminListUsers);
  const toggleFn = useServerFn(adminToggleUser);

  const load = async () => {
    setLoading(true);
    try { setRows(await listFn()); } catch (e: any) { toast.error(e?.message ?? "تعذر التحميل"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const toggle = async (id: string, disabled: boolean) => {
    try {
      await toggleFn({ data: { userId: id, disabled } });
      toast.success(disabled ? "تم تعطيل المستخدم" : "تم تفعيل المستخدم");
      setRows((rs) => rs.map((r) => r.id === id ? { ...r, disabled } : r));
    } catch (e: any) { toast.error(e?.message ?? "فشل التحديث"); }
  };

  const filtered = useMemo(() => rows.filter((r) => {
    if (filter === "متصل" && !r.linkedin_connected) return false;
    if (filter === "معطّل" && !r.disabled) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (r.full_name ?? "").toLowerCase().includes(q) || (r.linkedin_email ?? "").toLowerCase().includes(q);
    }
    return true;
  }), [rows, query, filter]);

  return (
    <>
      <header><p className="text-sm text-muted-foreground">إدارة الحسابات</p><h1 className="text-2xl font-bold sm:text-3xl">المستخدمون</h1></header>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1"><Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={query} onChange={(e) => setQuery(e.target.value)} className="pr-9" placeholder="ابحث عن مستخدم..." /></div>
        <div className="flex flex-wrap gap-2">{(["الكل", "متصل", "معطّل"] as const).map((chip) => <Button key={chip} variant={filter === chip ? "default" : "outline"} size="sm" onClick={() => setFilter(chip)}>{chip}</Button>)}</div>
      </div>
      <Card className="overflow-x-auto">
        {loading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
          <table className="w-full min-w-[760px] text-right text-sm">
            <thead className="border-b bg-secondary/50 text-muted-foreground">
              <tr>{["الاسم", "البريد", "LinkedIn", "الحالة", "الإجراءات"].map((h) => <th key={h} className="whitespace-nowrap p-4 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="p-4 font-medium">{r.full_name ?? "—"}</td>
                  <td className="p-4 text-muted-foreground">{r.linkedin_email ?? "—"}</td>
                  <td className="p-4"><Badge variant="outline" className={r.linkedin_connected ? "border-emerald-500/40 text-emerald-700" : "text-muted-foreground"}>{r.linkedin_connected ? "متصل ✅" : "غير متصل"}</Badge></td>
                  <td className="p-4">{r.disabled ? <Badge variant="destructive">معطّل</Badge> : <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10">نشط</Badge>}</td>
                  <td className="p-4">
                    {r.disabled
                      ? <Button variant="ghost" size="sm" onClick={() => toggle(r.id, false)}>تفعيل</Button>
                      : <Button variant="ghost" size="sm" className="text-destructive" onClick={() => toggle(r.id, true)}>تعطيل</Button>}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">لا يوجد مستخدمون</td></tr>}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}

function TonesSection() {
  const [tones, setTones] = useState<Array<{ tone: string; system_prompt: string; updated_at: string }>>([]);
  const [expanded, setExpanded] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [testOpen, setTestOpen] = useState(false);
  const [testTone, setTestTone] = useState("");
  const [testPrompt, setTestPrompt] = useState("");
  const [testTopic, setTestTopic] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [testing, setTesting] = useState(false);

  const listFn = useServerFn(adminListTones);
  const saveFn = useServerFn(adminSaveTone);
  const genFn = useServerFn(generateLinkedInPost);

  useEffect(() => {
    (async () => {
      try {
        const r = await listFn();
        setTones(r);
        if (r[0]) setExpanded(r[0].tone);
      } catch (e: any) { toast.error(e?.message ?? "تعذر التحميل"); }
      finally { setLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateLocal = (tone: string, prompt: string) => setTones((ts) => ts.map((t) => t.tone === tone ? { ...t, system_prompt: prompt } : t));

  const save = async (t: { tone: string; system_prompt: string }) => {
    setSavingKey(t.tone);
    try {
      await saveFn({ data: { tone: t.tone, system_prompt: t.system_prompt } });
      toast.success("تم حفظ البرامت");
    } catch (e: any) { toast.error(e?.message ?? "فشل الحفظ"); }
    finally { setSavingKey(null); }
  };

  const openTest = (t: { tone: string; system_prompt: string }) => {
    setTestTone(t.tone); setTestPrompt(t.system_prompt); setTestTopic(""); setTestOutput("");
    setTestOpen(true);
  };
  const runTest = async () => {
    if (!testTopic.trim()) return;
    setTesting(true);
    try {
      const out = await genFn({ data: { topic: testTopic, tone: testTone, promptOverride: testPrompt } });
      setTestOutput(out);
    } catch (e: any) { toast.error(e?.message ?? "فشل التوليد"); }
    finally { setTesting(false); }
  };

  return (
    <>
      <header><p className="text-sm text-muted-foreground">إعدادات الذكاء الاصطناعي</p><h1 className="text-2xl font-bold sm:text-3xl">إدارة مودات الكتابة</h1><p className="mt-2 text-muted-foreground">قم بكتابة البرامت الخاص بكل أسلوب كتابة. سيستخدمه الذكاء الاصطناعي مع كل عميل.</p></header>
      {loading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <div className="space-y-3">
          {tones.map((t) => {
            const isOpen = expanded === t.tone;
            return (
              <Card key={t.tone} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div><h2 className="text-lg font-bold">{toneEmojis[t.tone] ?? "✍️"} {t.tone}</h2><p className="mt-1 text-sm text-muted-foreground">آخر تحديث: {new Date(t.updated_at).toLocaleDateString("ar-EG")}</p></div>
                  <Button variant={isOpen ? "outline" : "default"} size="sm" onClick={() => setExpanded(isOpen ? "" : t.tone)}>{isOpen ? "إغلاق" : "تعديل"}</Button>
                </div>
                {isOpen && (
                  <div className="mt-5 border-t pt-5">
                    <div className="space-y-2">
                      <Label htmlFor={`prompt-${t.tone}`}>البرامت الخاص بهذا الأسلوب</Label>
                      <Textarea id={`prompt-${t.tone}`} rows={10} value={t.system_prompt} onChange={(e) => updateLocal(t.tone, e.target.value)} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button className="bg-gradient-primary" onClick={() => save(t)} disabled={savingKey === t.tone}>
                        {savingKey === t.tone && <Loader2 className="h-4 w-4 animate-spin" />} احفظ البرامت
                      </Button>
                      <Button variant="outline" onClick={() => openTest(t)}>اختبر الآن</Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={testOpen} onOpenChange={setTestOpen}>
        <DialogContent dir="rtl" className="sm:max-w-lg">
          <DialogHeader><DialogTitle>اختبر الآن — {testTone}</DialogTitle><DialogDescription>جرّب البرامت على موضوع تجريبي قبل حفظه.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label htmlFor="test-topic">أدخل موضوعاً للاختبار</Label><Input id="test-topic" value={testTopic} onChange={(e) => setTestTopic(e.target.value)} placeholder="مثال: درس تعلمته في العمل" /></div>
            {testOutput && <div className="max-h-64 overflow-auto rounded-xl bg-secondary p-4 text-sm leading-7 whitespace-pre-wrap">{testOutput}</div>}
            <Button onClick={runTest} disabled={testing || !testTopic.trim()} className="w-full bg-gradient-primary">
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : null} توليد
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SettingsSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const listFn = useServerFn(adminListSettings);
  const saveFn = useServerFn(adminSaveSettings);

  useEffect(() => {
    (async () => {
      try {
        const r = await listFn();
        setValues(Object.fromEntries(r.map((e: any) => [e.key, e.value])));
      } catch (e: any) { toast.error(e?.message ?? "تعذر التحميل"); }
      finally { setLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await saveFn({ data: { entries: Object.entries(values).map(([key, value]) => ({ key, value })) } });
      toast.success("تم حفظ الإعدادات");
    } catch (e: any) { toast.error(e?.message ?? "فشل الحفظ"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <>
      <header><p className="text-sm text-muted-foreground">تخصيص المنصة</p><h1 className="text-2xl font-bold sm:text-3xl">الإعدادات العامة</h1></header>
      <Card className="max-w-2xl space-y-5 p-5 sm:p-7">
        <div className="space-y-2"><Label htmlFor="app-name">اسم التطبيق</Label><Input id="app-name" value={values.app_name ?? ""} onChange={(e) => set("app_name", e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="monthly-limit">الحد الأقصى لمنشورات المجانيين في الشهر</Label><Input id="monthly-limit" type="number" value={values.max_free_posts_per_month ?? ""} onChange={(e) => set("max_free_posts_per_month", e.target.value)} /></div>
        <div className="flex items-center justify-between rounded-xl border border-border p-4">
          <div><Label>تفعيل توليد الصور</Label><p className="mt-1 text-sm text-muted-foreground">اسمح للمستخدمين بطلب صور لمنشوراتهم.</p></div>
          <Switch checked={values.image_generation_enabled === "true"} onCheckedChange={(v) => set("image_generation_enabled", v ? "true" : "false")} />
        </div>
        <div className="space-y-2"><Label htmlFor="welcome-message">رسالة الترحيب للمستخدمين الجدد</Label><Textarea id="welcome-message" rows={5} value={values.welcome_message ?? ""} onChange={(e) => set("welcome_message", e.target.value)} /></div>
        <Button className="bg-gradient-primary" onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />} حفظ الإعدادات</Button>
      </Card>
    </>
  );
}
