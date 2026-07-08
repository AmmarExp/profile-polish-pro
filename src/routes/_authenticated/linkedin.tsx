import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Linkedin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/linkedin")({
  component: LinkedInPage,
});

function LinkedInPage() {
  const { t, lang } = useI18n();
  const [profile, setProfile] = useState<any>(null);

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
    setProfile(data);
  };
  useEffect(() => { load(); }, []);

  const simulate = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    await supabase.from("profiles").update({ linkedin_connected: !profile?.linkedin_connected }).eq("id", u.user.id);
    toast.success(lang === "ar" ? "تم التحديث" : "Updated");
    load();
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">{t("li.title")}</h1>
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-[#0A66C2]/10 p-3">
              <Linkedin className="h-6 w-6 text-[#0A66C2]" />
            </div>
            <div>
              <p className="font-medium">LinkedIn</p>
              {profile?.linkedin_connected ? (
                <Badge>{t("dash.connected")}</Badge>
              ) : (
                <Badge variant="outline">{t("dash.notconnected")}</Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{t("li.desc")}</p>
          <div className="mt-4 flex gap-2">
            <Button disabled className="bg-[#0A66C2] hover:bg-[#0A66C2]/90">{t("li.connect")}</Button>
            <Button variant="outline" onClick={simulate}>{t("li.simulate")}</Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
