import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { useServerFn } from "@tanstack/react-start";
import { generatePost } from "@/lib/ai.functions";
import { publishPostNow } from "@/lib/linkedin.functions";
import { toast } from "sonner";
import { Wand2, Send, CalendarClock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/posts")({
  component: PostsPage,
});

function PostsPage() {
  const { t, lang } = useI18n();
  const generate = useServerFn(generatePost);
  const publish = useServerFn(publishPostNow);
  const [posts, setPosts] = useState<any[]>([]);
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [scheduleAt, setScheduleAt] = useState<Record<string, string>>({});

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", u.user.id)
      .order("created_at", { ascending: false });
    setPosts(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const doGenerate = async () => {
    setLoading(true);
    try {
      const p = await generate({ data: { topic } });
      setContent(p?.content ?? "");
      toast.success(lang === "ar" ? "تم التوليد" : "Generated");
      load();
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const saveManual = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user || !content.trim()) return;
    const { error } = await supabase.from("posts").insert({
      user_id: u.user.id,
      content,
      source: "manual",
      status: "draft",
    });
    if (error) toast.error(error.message);
    else { toast.success(lang === "ar" ? "تم الحفظ" : "Saved"); setContent(""); load(); }
  };


  const publishNow = async (id: string) => {
    try {
      await publish({ data: { postId: id } });
      toast.success(lang === "ar" ? "تم النشر على لينكدإن" : "Published to LinkedIn");
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const schedule = async (id: string) => {
    const val = scheduleAt[id];
    if (!val) { toast.error(lang === "ar" ? "اختر الوقت" : "Pick a time"); return; }
    const iso = new Date(val).toISOString();
    await supabase.from("posts").update({ status: "scheduled", scheduled_at: iso }).eq("id", id);
    toast.success(lang === "ar" ? "تمت الجدولة" : "Scheduled");
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("posts").delete().eq("id", id);
    load();
  };


  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold">{t("posts.title")}</h1>

        <Card className="p-5 space-y-4">
          <h2 className="font-semibold">{t("posts.new")}</h2>
          <div className="flex gap-2">
            <Input
              placeholder={t("posts.topic")}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <Button onClick={doGenerate} disabled={loading} className="bg-gradient-primary gap-2 shrink-0">
              <Wand2 className="h-4 w-4" />{loading ? "..." : t("posts.generate")}
            </Button>
          </div>
          <div>
            <Label>{t("posts.content")}</Label>
            <Textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={saveManual} variant="outline">{t("posts.save")}</Button>
          </div>
        </Card>

        <div className="space-y-3">
          {posts.map((p) => (
            <Card key={p.id} className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <Badge variant="secondary">{t(`posts.status.${p.status}` as any)}</Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(p.created_at).toLocaleString()}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm">{p.content}</p>
              {p.scheduled_at && p.status === "scheduled" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {lang === "ar" ? "مجدول:" : "Scheduled:"} {new Date(p.scheduled_at).toLocaleString()}
                </p>
              )}
              {p.error_message && (
                <p className="mt-2 text-xs text-destructive">{p.error_message}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {p.status !== "published" && (
                  <Button size="sm" onClick={() => publishNow(p.id)} className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 gap-1">
                    <Send className="h-3 w-3" />{t("posts.publishnow")}
                  </Button>
                )}
                {p.status !== "published" && (
                  <>
                    <Input
                      type="datetime-local"
                      className="h-8 w-auto text-xs"
                      value={scheduleAt[p.id] ?? ""}
                      onChange={(e) => setScheduleAt((s) => ({ ...s, [p.id]: e.target.value }))}
                    />
                    <Button size="sm" variant="outline" onClick={() => schedule(p.id)} className="gap-1">
                      <CalendarClock className="h-3 w-3" />{t("posts.schedule")}
                    </Button>
                  </>
                )}
                <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>✕</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
