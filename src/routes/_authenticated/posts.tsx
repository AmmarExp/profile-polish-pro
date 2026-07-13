import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { publishPostNow } from "@/lib/linkedin.functions";
import { toast } from "sonner";
import { ExternalLink, FilePlus2, Pencil, Send, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/posts")({ component: PostsPage });

type PostRow = {
  id: string;
  content: string;
  status: "draft" | "scheduled" | "published" | "failed";
  created_at: string;
  scheduled_at: string | null;
  published_at: string | null;
  linkedin_post_id: string | null;
  error_message: string | null;
};

function PostsPage() {
  const [rows, setRows] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [toDelete, setToDelete] = useState<string | null>(null);
  const publish = useServerFn(publishPostNow);
  const navigate = useNavigate();

  const load = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    const { data, error } = await supabase
      .from("posts")
      .select("id, content, status, created_at, scheduled_at, published_at, linkedin_post_id, error_message")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as PostRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const groups = useMemo(() => ({
    drafts: rows.filter((r) => r.status === "draft"),
    scheduled: rows.filter((r) => r.status === "scheduled"),
    published: rows.filter((r) => r.status === "published"),
    failed: rows.filter((r) => r.status === "failed"),
  }), [rows]);

  const handlePublish = async (id: string) => {
    try {
      await publish({ data: { postId: id } });
      toast.success("تم النشر على LinkedIn");
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "فشل النشر");
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    const id = toDelete;
    setToDelete(null);
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    load();
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6" dir="rtl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm text-muted-foreground">إدارة المحتوى</p><h1 className="text-2xl font-bold">منشوراتي</h1></div>
          <Button asChild className="gap-2"><Link to="/posts_new"><FilePlus2 className="h-4 w-4" />كتابة منشور جديد</Link></Button>
        </div>
        <Tabs defaultValue="drafts">
          <TabsList className="grid h-auto w-full grid-cols-4">
            <TabsTrigger value="drafts">المسودات ({groups.drafts.length})</TabsTrigger>
            <TabsTrigger value="scheduled">المجدولة ({groups.scheduled.length})</TabsTrigger>
            <TabsTrigger value="published">المنشورة ({groups.published.length})</TabsTrigger>
            <TabsTrigger value="failed">الفاشلة ({groups.failed.length})</TabsTrigger>
          </TabsList>
          {(Object.keys(groups) as (keyof typeof groups)[]).map((key) => (
            <TabsContent key={key} value={key} className="space-y-3 pt-3">
              {loading ? (
                <Card className="p-8 text-center text-sm text-muted-foreground">جارٍ التحميل…</Card>
              ) : groups[key].length ? (
                groups[key].map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    kind={key}
                    now={now}
                    onPublish={() => handlePublish(post.id)}
                    onEdit={() => navigate({ to: "/posts_new", search: { id: post.id } })}
                    onDelete={() => setToDelete(post.id)}
                  />
                ))
              ) : (
                <EmptyState />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المنشور</AlertDialogTitle>
            <AlertDialogDescription>لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function relTime(from: number, to: number) {
  const diff = Math.max(0, to - from);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  if (h > 0) return `${h} س ${m} د`;
  if (m > 0) return `${m} د ${s} ث`;
  return `${s} ث`;
}

function PostCard({ post, kind, now, onPublish, onEdit, onDelete }: { post: PostRow; kind: string; now: number; onPublish: () => void; onEdit: () => void; onDelete: () => void }) {
  const tone = kind === "failed" ? "bg-destructive/10 text-destructive" : kind === "published" ? "bg-emerald-500/10 text-emerald-700" : kind === "scheduled" ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-700";
  const label = kind === "failed" ? "فشل" : kind === "published" ? "منشور" : kind === "scheduled" ? "مجدول" : "مسودة";
  const dateLabel = new Date(post.scheduled_at ?? post.published_at ?? post.created_at).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });
  const scheduledAt = post.scheduled_at ? new Date(post.scheduled_at).getTime() : null;
  const countdown = scheduledAt && scheduledAt > now ? relTime(now, scheduledAt) : null;
  return (
    <Card className="p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2"><Badge className={tone}>{label}</Badge><span className="text-xs text-muted-foreground">{dateLabel}</span></div>
        {kind === "scheduled" && countdown && <span className="text-xs font-medium text-primary">ينشر خلال {countdown}</span>}
      </div>
      <p className="line-clamp-3 text-sm leading-7">{post.content}</p>
      {kind === "failed" && post.error_message && <p className="mt-3 text-sm text-destructive">{post.error_message}</p>}
      {kind === "published" && post.linkedin_post_id && (
        <a href={`https://www.linkedin.com/feed/update/${post.linkedin_post_id}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#0A66C2]">
          عرض على LinkedIn <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={onEdit}><Pencil className="h-3.5 w-3.5" /> تعديل</Button>
        {kind !== "published" && (
          <Button size="sm" variant="outline" onClick={onPublish}><Send className="h-3.5 w-3.5" /> نشر الآن</Button>
        )}
        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /> حذف</Button>
      </div>
    </Card>
  );
}

function EmptyState() {
  return <Card className="p-12 text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-2xl">📝</div><p className="font-medium">لا توجد منشورات هنا بعد</p><p className="mt-1 text-sm text-muted-foreground">ابدأ بكتابة منشورك التالي.</p></Card>;
}
