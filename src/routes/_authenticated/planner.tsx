import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarDays, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/planner")({ component: PlannerPage });

const days = [
  { day: "السبت", date: "12 يوليو", topic: "درس من قيادة فريق متعدد التخصصات", tone: "ملهم 🔥" },
  { day: "الأحد", date: "13 يوليو" },
  { day: "الاثنين", date: "14 يوليو", topic: "ثلاث نصائح لاجتماعات أكثر فاعلية", tone: "تعليمي 📚" },
  { day: "الثلاثاء", date: "15 يوليو" },
  { day: "الأربعاء", date: "16 يوليو", topic: "لماذا أؤمن بقوة التعلّم المستمر", tone: "ودّي 😊" },
  { day: "الخميس", date: "17 يوليو" },
  { day: "الجمعة", date: "18 يوليو" },
];

function PlannerPage() {
  return <AppShell><div className="mx-auto max-w-4xl space-y-6" dir="rtl"><header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm text-muted-foreground">التخطيط للمحتوى</p><h1 className="text-2xl font-bold">خطة محتوى الأسبوع</h1><p className="mt-1 text-sm text-muted-foreground">الأسبوع: 12 - 18 يوليو 2026</p></div><Button className="gap-2" onClick={() => { /* TODO: call generateWeeklyPlan() */ }}><Sparkles className="h-4 w-4" />اقترح خطة هذا الأسبوع</Button></header><Card className="p-3 sm:p-5"><div className="mb-4 flex items-center gap-2 font-semibold"><CalendarDays className="h-5 w-5 text-primary" />جدول الأسبوع</div><div className="space-y-2">{days.map((item) => <div key={item.day} className={item.topic ? "flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center" : "flex flex-col gap-3 rounded-xl border border-dashed border-primary/40 p-4 sm:flex-row sm:items-center"}><div className="min-w-28"><p className="font-semibold">{item.day}</p><p className="text-xs text-muted-foreground">{item.date}</p></div>{item.topic ? <><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /><Badge variant="secondary" className="max-w-fit">{item.topic}</Badge><Badge className="max-w-fit bg-primary/10 text-primary">{item.tone}</Badge></> : <Button variant="ghost" className="w-fit text-primary">إضافة منشور +</Button>}</div>)}</div></Card><section><h2 className="mb-3 text-xl font-bold">اقتراحات الذكاء الاصطناعي</h2><div className="grid gap-3 md:grid-cols-3">{["السبت", "الثلاثاء", "الخميس"].map((day) => <Card key={day} className="flex flex-col p-4"><Badge className="w-fit bg-secondary text-secondary-foreground">{day}</Badge><p className="mt-4 text-sm leading-7">شارك نصيحة من تجربتك في إدارة الفرق</p><Badge className="mt-3 w-fit bg-primary/10 text-primary">ملهم 🔥</Badge><Button variant="link" className="mt-auto px-0 pt-5 text-primary">استخدم هذه الفكرة ←</Button></Card>)}</div></section></div></AppShell>;
}
