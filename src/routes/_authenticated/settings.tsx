import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t, lang } = useI18n();
  const [profile, setProfile] = useState<any>({});
  const [schedule, setSchedule] = useState<any>({
    posts_per_day: 1,
    publish_times: ["09:00"],
    timezone: "Asia/Riyadh",
    active: true,
    auto_generate: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
        supabase.from("schedule_settings").select("*").eq("user_id", u.user.id).maybeSingle(),
      ]);
      setProfile(p ?? {});
      if (s) setSchedule(s);
    })();
  }, []);

  const save = async () => {
    setLoading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { error: pe } = await supabase.from("profiles").update({
        full_name: profile.full_name,
        headline: profile.headline,
        bio: profile.bio,
        specialty: profile.specialty,
        industry: profile.industry,
        goal: profile.goal,
        tone: profile.tone ?? "friendly",
        language: profile.language ?? "ar",
      }).eq("id", u.user.id);
      if (pe) throw pe;

      const { error: se } = await supabase.from("schedule_settings").upsert({
        user_id: u.user.id,
        posts_per_day: Number(schedule.posts_per_day) || 1,
        publish_times: Array.isArray(schedule.publish_times) ? schedule.publish_times : String(schedule.publish_times).split(",").map((s: string) => s.trim()),
        timezone: schedule.timezone || "Asia/Riyadh",
        active: !!schedule.active,
        auto_generate: !!schedule.auto_generate,
      });
      if (se) throw se;
      toast.success(t("set.saved"));
    } catch (e: any) {
      toast.error(e.message);
    } finally { setLoading(false); }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">{t("set.title")}</h1>

        <Card className="p-6 space-y-4">
          <h2 className="font-semibold">{t("set.profile")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>{t("auth.name")}</Label><Input value={profile.full_name ?? ""} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} /></div>
            <div><Label>{t("set.headline")}</Label><Input value={profile.headline ?? ""} onChange={(e) => setProfile({ ...profile, headline: e.target.value })} /></div>
            <div><Label>{t("set.specialty")}</Label><Input value={profile.specialty ?? ""} onChange={(e) => setProfile({ ...profile, specialty: e.target.value })} /></div>
            <div><Label>{t("set.industry")}</Label><Input value={profile.industry ?? ""} onChange={(e) => setProfile({ ...profile, industry: e.target.value })} /></div>
          </div>
          <div><Label>{t("set.bio")}</Label><Textarea rows={3} value={profile.bio ?? ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /></div>
          <div><Label>{t("set.goal")}</Label><Textarea rows={2} value={profile.goal ?? ""} onChange={(e) => setProfile({ ...profile, goal: e.target.value })} /></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>{t("set.tone")}</Label>
              <Select value={profile.tone ?? "friendly"} onValueChange={(v) => setProfile({ ...profile, tone: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">{t("tone.friendly")}</SelectItem>
                  <SelectItem value="formal">{t("tone.formal")}</SelectItem>
                  <SelectItem value="inspiring">{t("tone.inspiring")}</SelectItem>
                  <SelectItem value="educational">{t("tone.educational")}</SelectItem>
                  <SelectItem value="witty">{t("tone.witty")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("set.lang")}</Label>
              <Select value={profile.language ?? "ar"} onValueChange={(v) => setProfile({ ...profile, language: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="font-semibold">{t("set.schedule")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>{t("set.perday")}</Label>
              <Input type="number" min={1} max={10} value={schedule.posts_per_day}
                onChange={(e) => setSchedule({ ...schedule, posts_per_day: Number(e.target.value) })} />
            </div>
            <div><Label>{t("set.tz")}</Label><Input value={schedule.timezone} onChange={(e) => setSchedule({ ...schedule, timezone: e.target.value })} /></div>
          </div>
          <div>
            <Label>{t("set.times")}</Label>
            <Input
              value={Array.isArray(schedule.publish_times) ? schedule.publish_times.join(", ") : schedule.publish_times}
              onChange={(e) => setSchedule({ ...schedule, publish_times: e.target.value.split(",").map((s: string) => s.trim()) })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>{t("set.auto")}</Label>
            <Switch checked={!!schedule.auto_generate} onCheckedChange={(v) => setSchedule({ ...schedule, auto_generate: v })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>{t("set.active")}</Label>
            <Switch checked={!!schedule.active} onCheckedChange={(v) => setSchedule({ ...schedule, active: v })} />
          </div>
        </Card>

        <Button onClick={save} disabled={loading} className="bg-gradient-primary">
          {loading ? "..." : t("set.save")}
        </Button>
      </div>
    </AppShell>
  );
}
