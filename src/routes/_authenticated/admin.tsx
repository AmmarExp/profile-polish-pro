import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, CreditCard, FileText, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { t } = useI18n();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, active: 0, today: 0 });
  const [tpl, setTpl] = useState<any>({ name: "", description: "", tone: "friendly", language: "ar", system_prompt: "", user_prompt: "", is_active: true });

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { setIsAdmin(false); return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!data);
      if (!data) return;
      const [{ data: ps }, { data: ss }, { data: ts }, { count: usersCount }, { count: activeCount }, { count: todayCount }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("subscriptions").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("prompt_templates").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("posts").select("*", { count: "exact", head: true }).gte("created_at", new Date(new Date().setHours(0,0,0,0)).toISOString()),
      ]);
      setProfiles(ps ?? []); setSubs(ss ?? []); setTemplates(ts ?? []);
      setStats({ users: usersCount ?? 0, active: activeCount ?? 0, today: todayCount ?? 0 });
    })();
  }, []);

  const saveTemplate = async () => {
    if (!tpl.name || !tpl.system_prompt) { toast.error("name + prompt"); return; }
    const { error } = await supabase.from("prompt_templates").insert(tpl);
    if (error) toast.error(error.message);
    else { toast.success("saved"); setTpl({ name: "", description: "", tone: "friendly", language: "ar", system_prompt: "", user_prompt: "", is_active: true }); location.reload(); }
  };

  if (isAdmin === null) return <AppShell><p>...</p></AppShell>;
  if (!isAdmin) return <AppShell><p className="text-center text-muted-foreground">{t("admin.no.access")}</p></AppShell>;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-2xl font-bold">{t("admin.title")}</h1>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5"><div className="flex items-center gap-3"><Users className="h-6 w-6 text-primary" /><div><p className="text-xs text-muted-foreground">{t("admin.total.users")}</p><p className="text-2xl font-bold">{stats.users}</p></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><CreditCard className="h-6 w-6 text-primary" /><div><p className="text-xs text-muted-foreground">{t("admin.active")}</p><p className="text-2xl font-bold">{stats.active}</p></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><FileText className="h-6 w-6 text-primary" /><div><p className="text-xs text-muted-foreground">{t("admin.posts.today")}</p><p className="text-2xl font-bold">{stats.today}</p></div></div></Card>
        </div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">{t("admin.users")}</TabsTrigger>
            <TabsTrigger value="subs">{t("admin.subs")}</TabsTrigger>
            <TabsTrigger value="prompts">{t("admin.prompts")}</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-start text-muted-foreground">
                  <tr><th className="p-2 text-start">{t("auth.name")}</th><th className="p-2 text-start">{t("set.specialty")}</th><th className="p-2 text-start">LinkedIn</th><th className="p-2 text-start">Trial used</th></tr>
                </thead>
                <tbody>
                  {profiles.map((p) => (
                    <tr key={p.id} className="border-t border-border"><td className="p-2">{p.full_name || "—"}</td><td className="p-2">{p.specialty || "—"}</td><td className="p-2">{p.linkedin_connected ? "✓" : "—"}</td><td className="p-2">{p.trial_posts_used}/{p.trial_posts_limit}</td></tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          <TabsContent value="subs">
            <Card className="p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr><th className="p-2 text-start">User</th><th className="p-2 text-start">Plan</th><th className="p-2 text-start">Status</th></tr></thead>
                <tbody>
                  {subs.map((s) => (
                    <tr key={s.id} className="border-t border-border"><td className="p-2 text-xs">{s.user_id.slice(0,8)}</td><td className="p-2"><Badge>{s.plan}</Badge></td><td className="p-2">{s.status}</td></tr>
                  ))}
                  {subs.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">—</td></tr>}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          <TabsContent value="prompts" className="space-y-4">
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2"><Sparkles className="h-4 w-4" /><h3 className="font-semibold">New template</h3></div>
              <div className="grid gap-3 md:grid-cols-2">
                <div><Label>Name</Label><Input value={tpl.name} onChange={(e) => setTpl({...tpl, name: e.target.value})} /></div>
                <div><Label>Language</Label><Input value={tpl.language} onChange={(e) => setTpl({...tpl, language: e.target.value})} /></div>
              </div>
              <div><Label>System prompt</Label><Textarea rows={3} value={tpl.system_prompt} onChange={(e) => setTpl({...tpl, system_prompt: e.target.value})} /></div>
              <div><Label>User prompt</Label><Textarea rows={3} value={tpl.user_prompt} onChange={(e) => setTpl({...tpl, user_prompt: e.target.value})} /></div>
              <Button onClick={saveTemplate}>Save template</Button>
            </Card>
            <div className="space-y-2">
              {templates.map((tp) => (
                <Card key={tp.id} className="p-3">
                  <div className="flex items-center justify-between"><span className="font-medium">{tp.name}</span><Badge>{tp.tone}</Badge></div>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{tp.system_prompt}</p>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
