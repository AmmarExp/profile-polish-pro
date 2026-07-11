import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2, RotateCcw, Save, Send, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/posts/new")({ component: PostComposer });

const topics = ["إنجاز مهني", "نصيحة في مجالي", "قصة من تجربتي", "رأي في اتجاه", "مشاركة معرفة", "شكر وتقدير"];
const tones = [{ label: "ودّي", emoji: "😊" }, { label: "رسمي", emoji: "🎩" }, { label: "ملهم", emoji: "🔥" }, { label: "تعليمي", emoji: "📚" }, { label: "خفيف الظل", emoji: "😄" }];
const generatedText = "من أكثر الدروس التي تعلمتها في مسيرتي المهنية: لا تنتظر الظروف المثالية لتبدأ.\n\nكل خطوة صغيرة، وكل محادثة صادقة، وكل مهارة جديدة تتعلمها اليوم تصنع فرقاً أكبر مما تتوقع غداً.\n\nابدأ بما لديك، وشارك ما تتعلمه، ودع الاستمرارية تبني قصتك المهنية.\n\nما الخطوة الصغيرة التي ستأخذها هذا الأسبوع؟";

function PostComposer() {
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("ودّي");
  const [writing, setWriting] = useState(false);
  const [content, setContent] = useState(generatedText);

  const generate = () => {
    setWriting(true);
    // TODO: call generateLinkedInPost(topic, tone)
    window.setTimeout(() => { setWriting(false); setStep(3); }, 900);
  };

  return <AppShell><div className="mx-auto max-w-3xl space-y-7" dir="rtl">
    <header><p className="text-sm text-muted-foreground">كتابة منشور</p><h1 className="text-2xl font-bold">أنشئ منشورك خطوة بخطوة</h1></header>
    <div className="flex items-center gap-2">{[1, 2, 3].map((item) => <div key={item} className="flex flex-1 items-center gap-2"><div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold", item <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{item}</div>{item < 3 && <div className={cn("h-1 flex-1 rounded", item < step ? "bg-primary" : "bg-muted")} />}</div>)}</div>
    {step === 1 && <Card className="space-y-6 p-5 sm:p-7"><div><h2 className="text-xl font-bold">عمَّ تريد الكتابة؟</h2><p className="mt-1 text-sm text-muted-foreground">شارك فكرة أو موقفاً أو معرفة تريد تحويلها إلى منشور.</p></div><Input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="مثال: شاركت في مؤتمر وتعلمت..." className="h-12" /><div className="flex flex-wrap gap-2">{topics.map((item) => <Button key={item} variant="outline" size="sm" onClick={() => setTopic(item)}>{item}</Button>)}</div><div className="flex justify-end"><Button onClick={() => setStep(2)} disabled={!topic.trim()} className="gap-2">التالي <span>←</span></Button></div></Card>}
    {step === 2 && <Card className="space-y-6 p-5 sm:p-7"><div><h2 className="text-xl font-bold">اختر أسلوب الكتابة</h2><p className="mt-1 text-sm text-muted-foreground">سنستخدمه لصياغة المنشور بطريقة تشبهك.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{tones.map((item) => <button type="button" key={item.label} onClick={() => setTone(item.label)} className={cn("rounded-xl border p-4 text-right transition", tone === item.label ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40")}><span className="text-xl">{item.emoji}</span><span className="mt-2 block font-semibold">{item.label}</span></button>)}</div><div className="flex justify-between"><Button variant="outline" onClick={() => setStep(1)}>السابق</Button><Button onClick={generate} disabled={writing} className="gap-2">{writing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} اكتب المنشور</Button></div></Card>}
    {step === 3 && <Card className="space-y-5 p-5 sm:p-7">{writing ? <div className="flex min-h-72 flex-col items-center justify-center gap-4"><Loader2 className="h-9 w-9 animate-spin text-primary" /><p className="font-medium">جارٍ الكتابة بالذكاء الاصطناعي...</p></div> : <><div><h2 className="text-xl font-bold">منشورك جاهز للمراجعة</h2><p className="mt-1 text-sm text-muted-foreground">الأسلوب المختار: {tone}</p></div><Textarea value={content} onChange={(event) => setContent(event.target.value)} rows={10} className="leading-7" /><p className="text-left text-xs text-muted-foreground">312 / 3000</p><div className="flex flex-wrap gap-2"><Button variant="outline">✏️ عدّل الأسلوب</Button><Button variant="outline" onClick={generate}><RotateCcw className="h-4 w-4" /> أعد الكتابة</Button><Button variant="outline"><Save className="h-4 w-4" /> احفظ مسودة</Button><Button className="bg-[#0A66C2] hover:bg-[#0A66C2]/90"><Send className="h-4 w-4" /> انشر على LinkedIn</Button></div></>}</Card>}
  </div></AppShell>;
}
