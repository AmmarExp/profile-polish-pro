import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({ component: SettingsPage });

type Profile = {
  full_name: string;
  headline: string;
  specialty: string;
  industry: string;
  bio: string;
  goal: string;
  tone: string;
  language: string;
};

const empty: Profile = { full_name: "", headline: "", specialty: "", industry: "", bio: "", goal: "", tone: "friendly", language: "ar" };

function SettingsPage() {
  const [profile, setProfile] = useState<Profile>(empty);
  const [saving, setSaving] = useState(false);
  const [autoPublish, setAutoPublish] = useState(true);
  const [scheduleActive, setScheduleActive] = useState(true);
  const [postsPerDay, setPostsPerDay] = useState<number>(1);
  const [timezone, setTimezone] = useState("Asia/Riyadh");
  const [publishTimes, setPublishTimes] = useState<string>("09:00");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return;
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from("profiles").select("full_name, headline, specialty, industry, bio, goal, tone, language").eq("id", uid).maybeSingle(),
        supabase.from("schedule_settings").select("*").eq("user_id", uid).maybeSingle(),
      ]);
      if (p) {
        setProfile({
          full_name: p.full_name ?? "",
          headline: p.headline ?? "",
          specialty: p.specialty ?? "",
          industry: p.industry ?? "",
          bio: p.bio ?? "",
          goal: p.goal ?? "",
          tone: p.tone ?? "friendly",
          language: p.language ?? "ar",
        });
      }
      if (s) {
        setAutoPublish(s.auto_generate);
        setScheduleActive(s.active);
        setPostsPerDay(s.posts_per_day);
        setTimezone(s.timezone);
        setPublishTimes((s.publish_times ?? []).join(", ") || "09:00");
      }
      setLoading(false);
    })();
  }, []);

  const completion = useMemo(() => {
    const fields: (keyof Profile)[] = ["full_name", "headline", "specialty", "industry", "bio", "goal", "tone", "language"];
    const filled = fields.filter((f) => (profile[f] ?? "").toString().trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  const setField = (k: keyof Profile) => (v: string) => setProfile((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error("جلسة غير صالحة");
      const times = publishTimes.split(",").map((t) => t.trim()).filter(Boolean);
      const [{ error: pErr }, { error: sErr }] = await Promise.all([
        supabase.from("profiles").update({
          full_name: profile.full_name,
          headline: profile.headline,
          specialty: profile.specialty,
          industry: profile.industry,
          bio: profile.bio,
          goal: profile.goal,
          tone: profile.tone as any,
          language: profile.language,
        }).eq("id", uid),
        supabase.from("schedule_settings").upsert({
          user_id: uid,
          auto_generate: autoPublish,
          active: scheduleActive,
          posts_per_day: postsPerDay,
          timezone,
          publish_times: times,
        }, { onConflict: "user_id" }),
      ]);
      if (pErr) throw pErr;
      if (sErr) throw sErr;
      toast.success("تم حفظ التغييرات ✓");
    } catch (e: any) {
      toast.error(e?.message ?? "تعذر الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6" dir="rtl">
        <header>
          <p className="text-sm text-muted-foreground">تخصيص تجربتك</p>
          <h1 className="text-2xl font-bold">الإعدادات</h1>
        </header>

        <Card className="space-y-5 p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">ملفي المهني</h2>
              <p className="mt-1 text-sm text-muted-foreground">كلما اكتمل ملفك، أصبح المحتوى أدق.</p>
            </div>
            <span className="text-sm font-semibold text-primary">اكتمال الملف — {completion}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completion}%` }} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="الاسم الكامل" value={profile.full_name} onChange={setField("full_name")} />
            <Field label="المسمى الوظيفي (Headline)" value={profile.headline} onChange={setField("headline")} />
            <Field label="التخصص" value={profile.specialty} onChange={setField("specialty")} />
            <Field label="القطاع" value={profile.industry} onChange={setField("industry")} />
          </div>
          <Field label="نبذة مختصرة" value={profile.bio} onChange={setField("bio")} multiline />
          <Field label="هدفك من LinkedIn" value={profile.goal} onChange={setField("goal")} multiline />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>الأسلوب المفضل</Label>
              <Select value={profile.tone} onValueChange={setField("tone")}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">ودّي</SelectItem>
                  <SelectItem value="formal">رسمي</SelectItem>
                  <SelectItem value="inspiring">ملهم</SelectItem>
                  <SelectItem value="educational">تعليمي</SelectItem>
                  <SelectItem value="witty">خفيف</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>اللغة</Label>
              <Select value={profile.language} onValueChange={setField("language")}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={save} disabled={saving || loading}>{saving ? "جارٍ الحفظ…" : "حفظ التغييرات"}</Button>
        </Card>

        <Card className="space-y-5 p-5 sm:p-7">
          <div>
            <h2 className="text-xl font-bold">إعدادات النشر</h2>
            <p className="mt-1 text-sm text-muted-foreground">تحكم بالجدولة وتفضيلات النشر.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>منشورات في اليوم</Label>
              <Input className="mt-2" type="number" min={1} max={5} value={postsPerDay} onChange={(e) => setPostsPerDay(Number(e.target.value) || 1)} />
            </div>
            <div>
              <Label>المنطقة الزمنية</Label>
              <Input className="mt-2" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>أوقات النشر (مفصولة بفواصل)</Label>
            <Input className="mt-2" value={publishTimes} onChange={(e) => setPublishTimes(e.target.value)} placeholder="09:00, 18:00" />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <div><p className="font-medium">توليد ونشر تلقائي</p><p className="text-sm text-muted-foreground">أنشئ محتوى مقترحاً حسب جدولك.</p></div>
            <Switch checked={autoPublish} onCheckedChange={setAutoPublish} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <div><p className="font-medium">الجدولة مفعّلة</p><p className="text-sm text-muted-foreground">فعّل خطة النشر الأسبوعية.</p></div>
            <Switch checked={scheduleActive} onCheckedChange={setScheduleActive} />
          </div>
        </Card>

        <Card className="space-y-4 p-5 sm:p-7">
          <div>
            <h2 className="text-xl font-bold">الحساب والأمان</h2>
            <p className="mt-1 text-sm text-muted-foreground">تتم إدارة بيانات الدخول وربط الحسابات بأمان.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">تغيير كلمة المرور</Button>
            <Button variant="outline">إدارة حساب LinkedIn</Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <div>
      <Label>{label}</Label>
      {multiline ? (
        <Textarea className="mt-2" value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
      ) : (
        <Input className="mt-2" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}
