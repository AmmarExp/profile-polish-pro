import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useServerFn } from "@tanstack/react-start";
import { improveHeadline, generateComment, improveSummary } from "@/lib/ai.functions";
import { toast } from "sonner";
import { Copy, Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tools")({ component: ToolsPage });

function useCopy() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
    } catch {
      toast.error("تعذر النسخ");
    }
  };
  return { copiedId, copy };
}

function ToolsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6" dir="rtl">
        <header>
          <p className="text-sm text-muted-foreground">مساحة التحسين</p>
          <h1 className="text-2xl font-bold">أدوات الكتابة الذكية</h1>
        </header>
        <Tabs defaultValue="headline">
          <TabsList className="grid h-auto w-full grid-cols-3">
            <TabsTrigger value="headline">محسّن الـ Headline</TabsTrigger>
            <TabsTrigger value="comment">مساعد التعليق</TabsTrigger>
            <TabsTrigger value="summary">محسّن الملخص</TabsTrigger>
          </TabsList>
          <TabsContent value="headline" className="pt-3"><HeadlineTool /></TabsContent>
          <TabsContent value="comment" className="pt-3"><CommentTool /></TabsContent>
          <TabsContent value="summary" className="pt-3"><SummaryTool /></TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function HeadlineTool() {
  const fn = useServerFn(improveHeadline);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Array<{ headline: string; reason: string }>>([]);
  const { copiedId, copy } = useCopy();

  const run = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const items = await fn({ data: { headline: text } });
      setResults(items);
    } catch (e: any) {
      toast.error(e?.message ?? "تعذر التحسين");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-4 p-5">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="الصق عنوانك الحالي على LinkedIn" rows={5} />
        <Button onClick={run} disabled={busy} className="gap-2">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}حسّن العنوان ✨</Button>
      </Card>
      <div className="grid gap-3">
        {results.map((r, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold">{r.headline}</h3>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => copy(`h-${i}`, r.headline)}>
                <Copy className="h-3.5 w-3.5" />{copiedId === `h-${i}` ? "تم النسخ ✓" : "نسخ"}
              </Button>
            </div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{r.reason}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CommentTool() {
  const fn = useServerFn(generateComment);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Array<{ type: string; comment: string }>>([]);
  const { copiedId, copy } = useCopy();

  const run = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const items = await fn({ data: { post: text } });
      setResults(items);
    } catch (e: any) {
      toast.error(e?.message ?? "تعذر التوليد");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-4 p-5">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="الصق المنشور الذي تريد التعليق عليه" rows={5} />
        <Button onClick={run} disabled={busy} className="gap-2">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}اقترح تعليقاً ✨</Button>
      </Card>
      <div className="grid gap-3 md:grid-cols-3">
        {results.map((r, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold">{r.type}</h3>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => copy(`c-${i}`, r.comment)}>
                <Copy className="h-3.5 w-3.5" />{copiedId === `c-${i}` ? "تم النسخ ✓" : "نسخ"}
              </Button>
            </div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{r.comment}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SummaryTool() {
  const fn = useServerFn(improveSummary);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [improved, setImproved] = useState<string>("");
  const { copiedId, copy } = useCopy();

  const run = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const out = await fn({ data: { summary: text } });
      setImproved(out);
    } catch (e: any) {
      toast.error(e?.message ?? "تعذر التحسين");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-4 p-5">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="الصق ملخصك الحالي أو اكتب نبذة مختصرة" rows={5} />
        <Button onClick={run} disabled={busy} className="gap-2">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}حسّن الملخص ✨</Button>
      </Card>
      {improved && (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <Card className="p-5">
              <p className="mb-3 text-sm font-semibold text-muted-foreground">قبل</p>
              <p className="text-sm leading-7">{text}</p>
            </Card>
            <Card className="border-primary/30 bg-primary/5 p-5">
              <p className="mb-3 text-sm font-semibold text-primary">بعد</p>
              <p className="text-sm leading-7 whitespace-pre-wrap">{improved}</p>
            </Card>
          </div>
          <Button className="gap-2" onClick={() => copy("summary", improved)}>
            <Copy className="h-4 w-4" />{copiedId === "summary" ? "تم النسخ ✓" : "نسخ النسخة المحسّنة"}
          </Button>
        </>
      )}
    </div>
  );
}
