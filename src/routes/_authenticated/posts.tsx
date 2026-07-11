import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, FilePlus2, Pencil, Send, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/posts")({ component: PostsPage });

const posts = {
  drafts: [{ content: "أحياناً يكون أفضل قرار مهني هو التوقف قليلاً للتفكير في الاتجاه، وليس فقط الاستمرار في السرعة. هذه ثلاثة أسئلة تساعدني على إعادة ترتيب أولوياتي...", date: "اليوم، 10:30 ص", status: "مسودة" }],
  scheduled: [{ content: "مشاركة المعرفة مع الفريق ليست مجرد مهمة إضافية، بل استثمار مستمر في الثقة والنتائج. إليكم الطريقة التي جعلت الاجتماعات الأسبوعية أكثر فاعلية...", date: "18 يوليو 2026، 9:00 ص", status: "مجدول" }],
  published: [{ content: "كل نجاح صغير يستحق أن نتوقف عنده. ليس لأنه نهاية الطريق، بل لأنه تذكير جميل بأن الخطوات اليومية تصنع فرقاً حقيقياً مع الوقت...", date: "14 يوليو 2026", status: "منشور" }],
  failed: [{ content: "فكرة اليوم: كيف يمكننا بناء ثقافة عمل تشجع الناس على طرح الأسئلة قبل تقديم الإجابات؟ هذه بعض الدروس التي تعلمتها...", date: "13 يوليو 2026", status: "فشل" }],
};

function PostsPage() {
  return <AppShell><div className="mx-auto max-w-4xl space-y-6" dir="rtl">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm text-muted-foreground">إدارة المحتوى</p><h1 className="text-2xl font-bold">منشوراتي</h1></div><Button asChild className="gap-2"><Link to="/posts/new"><FilePlus2 className="h-4 w-4" />كتابة منشور جديد</Link></Button></div>
    <Tabs defaultValue="drafts"><TabsList className="grid h-auto w-full grid-cols-4"><TabsTrigger value="drafts">المسودات</TabsTrigger><TabsTrigger value="scheduled">المجدولة</TabsTrigger><TabsTrigger value="published">المنشورة</TabsTrigger><TabsTrigger value="failed">الفاشلة</TabsTrigger></TabsList>{Object.entries(posts).map(([key, records]) => <TabsContent key={key} value={key} className="space-y-3 pt-3">{records.length ? records.map((post) => <PostCard key={post.date} {...post} kind={key} />) : <EmptyState />}</TabsContent>)}</Tabs>
  </div></AppShell>;
}

function PostCard({ content, date, status, kind }: { content: string; date: string; status: string; kind: string }) {
  const tone = kind === "failed" ? "bg-destructive/10 text-destructive" : kind === "published" ? "bg-emerald-500/10 text-emerald-700" : kind === "scheduled" ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-700";
  return <Card className="p-5"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><Badge className={tone}>{status}</Badge><span className="text-xs text-muted-foreground">{date}</span></div>{kind === "scheduled" && <span className="text-xs font-medium text-primary">ينشر خلال 3 ساعات</span>}</div><p className="line-clamp-3 text-sm leading-7">{content}</p>{kind === "failed" && <p className="mt-3 text-sm text-destructive">فشل الاتصال بـ LinkedIn</p>}{kind === "published" && <a href="#" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#0A66C2]">عرض على LinkedIn <ExternalLink className="h-3.5 w-3.5" /></a>}<div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="outline"><Pencil className="h-3.5 w-3.5" /> تعديل</Button><Button size="sm" variant="outline"><Send className="h-3.5 w-3.5" /> نشر الآن</Button><Button size="sm" variant="ghost" className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /> حذف</Button></div></Card>;
}
function EmptyState() { return <Card className="p-12 text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-2xl">📝</div><p className="font-medium">لا توجد منشورات هنا بعد</p><p className="mt-1 text-sm text-muted-foreground">ابدأ بكتابة منشورك التالي.</p></Card>; }
