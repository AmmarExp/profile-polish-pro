import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/settings")({ component: SettingsPage });

function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [autoPublish, setAutoPublish] = useState(true);
  const [scheduleActive, setScheduleActive] = useState(true);
  const save = () => { // TODO: save profile to Supabase
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };
  return <AppShell><div className="mx-auto max-w-3xl space-y-6" dir="rtl"><header><p className="text-sm text-muted-foreground">تخصيص تجربتك</p><h1 className="text-2xl font-bold">الإعدادات</h1></header><Card className="space-y-5 p-5 sm:p-7"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold">ملفي المهني</h2><p className="mt-1 text-sm text-muted-foreground">كلما اكتمل ملفك، أصبح المحتوى أدق.</p></div><span className="text-sm font-semibold text-primary">اكتمال الملف — 40%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full w-2/5 rounded-full bg-primary" /></div><div className="grid gap-4 sm:grid-cols-2"><Field label="الاسم الكامل" value="عمار أحمد" /><Field label="المسمى الوظيفي (Headline)" value="مدير منتجات رقمية" /><Field label="التخصص" value="إدارة المنتجات" /><Field label="القطاع" value="التقنية" /></div><Field label="نبذة مختصرة" value="أساعد الفرق على بناء منتجات رقمية مفيدة وقابلة للنمو." multiline /><Field label="هدفك من LinkedIn" value="بناء حضور مهني ومشاركة المعرفة في إدارة المنتجات." multiline /><div className="grid gap-4 sm:grid-cols-2"><div><Label>الأسلوب المفضل</Label><Select defaultValue="friendly"><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="friendly">ودّي</SelectItem><SelectItem value="formal">رسمي</SelectItem><SelectItem value="inspiring">ملهم</SelectItem><SelectItem value="educational">تعليمي</SelectItem><SelectItem value="light">خفيف</SelectItem></SelectContent></Select></div><div><Label>اللغة</Label><Select defaultValue="ar"><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ar">العربية</SelectItem><SelectItem value="en">English</SelectItem></SelectContent></Select></div></div><Button onClick={save}>{saved ? "تم الحفظ ✓" : "حفظ التغييرات"}</Button></Card><Card className="space-y-5 p-5 sm:p-7"><div><h2 className="text-xl font-bold">إعدادات النشر</h2><p className="mt-1 text-sm text-muted-foreground">تحكم بالجدولة وتفضيلات النشر.</p></div><div className="grid gap-4 sm:grid-cols-2"><Field label="منشورات في اليوم" value="1" /><Field label="المنطقة الزمنية" value="Asia/Riyadh" /></div><Field label="أوقات النشر" value="09:00" /><div className="flex items-center justify-between rounded-xl border border-border p-4"><div><p className="font-medium">توليد ونشر تلقائي</p><p className="text-sm text-muted-foreground">أنشئ محتوى مقترحاً حسب جدولك.</p></div><Switch checked={autoPublish} onCheckedChange={setAutoPublish} /></div><div className="flex items-center justify-between rounded-xl border border-border p-4"><div><p className="font-medium">الجدولة مفعّلة</p><p className="text-sm text-muted-foreground">فعّل خطة النشر الأسبوعية.</p></div><Switch checked={scheduleActive} onCheckedChange={setScheduleActive} /></div></Card><Card className="space-y-4 p-5 sm:p-7"><div><h2 className="text-xl font-bold">الحساب والأمان</h2><p className="mt-1 text-sm text-muted-foreground">تتم إدارة بيانات الدخول وربط الحسابات بأمان.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline">تغيير كلمة المرور</Button><Button variant="outline">إدارة حساب LinkedIn</Button></div></Card></div></AppShell>;
}
function Field({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) { return <div><Label>{label}</Label>{multiline ? <Textarea className="mt-2" defaultValue={value} rows={3} /> : <Input className="mt-2" defaultValue={value} />}</div>; }
