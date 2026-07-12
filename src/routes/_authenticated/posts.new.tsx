import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { generateLinkedInPost } from "@/lib/ai.functions";
import { publishPostNow } from "@/lib/linkedin.functions";
import { toast } from "sonner";
import { AlertCircle, Image, Loader2, RotateCcw, Save, Send, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/posts/new")({
  validateSearch: (s: Record<string, unknown>) => ({
    id: typeof s.id === "string" ? s.id : undefined,
    topic: typeof s.topic === "string" ? s.topic : undefined,
    tone: typeof s.tone === "string" ? s.tone : undefined,
  }),
  component: PostComposer,
});

const topics = ["إنجاز مهني", "نصيحة في مجالي", "قصة من تجربتي", "رأي في اتجاه", "مشاركة معرفة", "شكر وتقدير"];
const tones = [
  { label: "ودّي", emoji: "😊" },
  { label: "رسمي", emoji: "🎩" },
  { label: "ملهم", emoji: "🔥" },
  { label: "تعليمي", emoji: "📚" },
  { label: "خفيف الظل", emoji: "😄" },
];

function PostComposer() {
  const search = useSearch({ from: "/_authenticated/posts/new" });
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState(search.topic ?? "");
  const [tone, setTone] = useState(search.tone ?? "ودّي");
  const [writing, setWriting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [content, setContent] = useState("");
  const [postId, setPostId] = useState<string | null>(search.id ?? null);
  const [profile, setProfile] = useState<any>(null);
  const [includeImage, setIncludeImage] = useState(false);
  const [imageDescription, setImageDescription] = useState("");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(false);

  const genFn = useServerFn(generateLinkedInPost);
  const publishFn = useServerFn(publishPostNow);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name, specialty, industry, goal, language, linkedin_connected")
        .eq("id", uid)
        .maybeSingle();
      setProfile(p);
      if (search.id) {
        const { data: existing } = await supabase.from("posts").select("content").eq("id", search.id).maybeSingle();
        if (existing?.content) {
          setContent(existing.content);
          setStep(3);
        }
      } else if (search.topic) {
        setStep(2);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = async () => {
    if (!topic.trim()) return;
    setWriting(true);
    setStep(3);
    try {
      const out = await genFn({ data: { topic, tone, profile: profile ?? undefined } });
      setContent(out);
    } catch (e: any) {
      toast.error(e?.message ?? "تعذر توليد المنشور");
      setStep(2);
    } finally {
      setWriting(false);
    }
  };

  const saveDraft = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    if (postId) {
      const { error } = await supabase.from("posts").update({ content, status: "draft" }).eq("id", postId);
      if (error) return toast.error(error.message);
    } else {
      const { data, error } = await supabase
        .from("posts")
        .insert({ user_id: uid, content, status: "draft", source: "ai", language: profile?.language ?? "ar" })
        .select("id")
        .single();
      if (error) return toast.error(error.message);
      setPostId(data.id);
    }
    toast.success("تم حفظ المسودة");
  };

  const publish = async () => {
    if (!profile?.linkedin_connected) return;
    setPublishing(true);
    try {
      let id = postId;
      if (!id) {
        const { data: auth } = await supabase.auth.getUser();
        const uid = auth.user!.id;
        const { data, error } = await supabase
          .from("posts")
          .insert({ user_id: uid, content, status: "draft", source: "ai", language: profile?.language ?? "ar" })
          .select("id")
          .single();
        if (error) throw error;
        id = data.id;
        setPostId(id);
      } else {
        await supabase.from("posts").update({ content }).eq("id", id);
      }
      await publishFn({ data: { postId: id! } });
      toast.success("تم النشر على LinkedIn");
    } catch (e: any) {
      toast.error(e?.message ?? "فشل النشر");
    } finally {
      setPublishing(false);
    }
  };

  const generateImage = () => {
    // TODO: call generatePostImage(content, imageDescription)
    setGeneratingImage(true);
    setGeneratedImage(false);
    window.setTimeout(() => {
      setGeneratingImage(false);
      setGeneratedImage(true);
    }, 900);
  };

  const notConnected = profile && !profile.linkedin_connected;
  const chars = content.length;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-7" dir="rtl">
        <header>
          <p className="text-sm text-muted-foreground">كتابة منشور</p>
          <h1 className="text-2xl font-bold">أنشئ منشورك خطوة بخطوة</h1>
        </header>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex flex-1 items-center gap-2">
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold", item <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{item}</div>
              {item < 3 && <div className={cn("h-1 flex-1 rounded", item < step ? "bg-primary" : "bg-muted")} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card className="space-y-6 p-5 sm:p-7">
            <div><h2 className="text-xl font-bold">عمَّ تريد الكتابة؟</h2><p className="mt-1 text-sm text-muted-foreground">شارك فكرة أو موقفاً أو معرفة تريد تحويلها إلى منشور.</p></div>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="مثال: شاركت في مؤتمر وتعلمت..." className="h-12" />
            <div className="flex flex-wrap gap-2">{topics.map((item) => <Button key={item} variant="outline" size="sm" onClick={() => setTopic(item)}>{item}</Button>)}</div>
            <div className="flex justify-end"><Button onClick={() => setStep(2)} disabled={!topic.trim()} className="gap-2">التالي <span>←</span></Button></div>
          </Card>
        )}

        {step === 2 && (
          <Card className="space-y-6 p-5 sm:p-7">
            <div><h2 className="text-xl font-bold">اختر أسلوب الكتابة</h2><p className="mt-1 text-sm text-muted-foreground">سنستخدمه لصياغة المنشور بطريقة تشبهك.</p></div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {tones.map((item) => (
                <button type="button" key={item.label} onClick={() => setTone(item.label)} className={cn("rounded-xl border p-4 text-right transition", tone === item.label ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40")}>
                  <span className="text-xl">{item.emoji}</span>
                  <span className="mt-2 block font-semibold">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>السابق</Button>
              <Button onClick={generate} disabled={writing} className="gap-2">{writing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} اكتب المنشور</Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="space-y-5 p-5 sm:p-7">
            {writing ? (
              <div className="flex min-h-72 flex-col items-center justify-center gap-4">
                <Loader2 className="h-9 w-9 animate-spin text-primary" />
                <p className="font-medium">جارٍ الكتابة بالذكاء الاصطناعي...</p>
              </div>
            ) : (
              <>
                <div><h2 className="text-xl font-bold">منشورك جاهز للمراجعة</h2><p className="mt-1 text-sm text-muted-foreground">الأسلوب المختار: {tone}</p></div>
                {notConnected && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div className="flex-1">ربط حساب LinkedIn مطلوب للنشر. <Link to="/linkedin" className="underline font-semibold">اربط الحساب الآن</Link></div>
                  </div>
                )}
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} className="leading-7" />
                <p className="text-left text-xs text-muted-foreground">{chars} / 3000</p>
                <section className="rounded-2xl border border-border bg-secondary/30 p-4 sm:p-5">
                  <div className="flex items-center gap-2"><div className="rounded-xl bg-primary/10 p-2"><Image className="h-5 w-5 text-primary" /></div><h3 className="font-bold">هل تريد توليد صورة للمنشور؟</h3></div>
                  <div className="mt-4 space-y-3">
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-background"><input type="radio" name="post-image" checked={!includeImage} onChange={() => { setIncludeImage(false); setGeneratedImage(false); }} className="h-4 w-4 accent-primary" />لا، أكتفي بالنص فقط</label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-background"><input type="radio" name="post-image" checked={includeImage} onChange={() => setIncludeImage(true)} className="h-4 w-4 accent-primary" />نعم، ولّد صورة مناسبة للمنشور</label>
                  </div>
                  {includeImage && <div className="mt-5 space-y-3 border-t border-border pt-5"><div className="space-y-2"><label htmlFor="image-description" className="text-sm font-medium">وصف الصورة (اختياري)</label><Input id="image-description" value={imageDescription} onChange={(event) => setImageDescription(event.target.value)} placeholder="سيتم توليد صورة بناءً على محتوى المنشور تلقائياً" /></div><Button variant="outline" onClick={generateImage} disabled={generatingImage} className="border-primary/50 text-primary hover:bg-primary/10">{generatingImage && <Loader2 className="h-4 w-4 animate-spin" />} ولّد الصورة</Button>{(generatingImage || generatedImage) && <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-primary/40 bg-primary/5">{generatingImage ? <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground"><Loader2 className="h-7 w-7 animate-spin text-primary" />جارٍ تحضير الصورة...</div> : <div className="flex flex-col items-center gap-2 text-center"><Image className="h-9 w-9 text-primary" /><p className="font-medium">معاينة الصورة التجريبية</p><p className="text-xs text-muted-foreground">ستظهر الصورة المولدة هنا.</p></div>}</div>}</div>}
                </section>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setStep(2)}>✏️ عدّل الأسلوب</Button>
                  <Button variant="outline" onClick={generate} disabled={writing}><RotateCcw className="h-4 w-4" /> أعد الكتابة</Button>
                  <Button variant="outline" onClick={saveDraft}><Save className="h-4 w-4" /> احفظ مسودة</Button>
                  <Button onClick={publish} disabled={publishing || notConnected || !content.trim()} className="bg-[#0A66C2] hover:bg-[#0A66C2]/90">
                    {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} انشر على LinkedIn
                  </Button>
                </div>
              </>
            )}
          </Card>
        )}
      </div>
    </AppShell>
  );
}
