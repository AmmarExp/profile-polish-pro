import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const { t, lang, dir } = useI18n();
  const nav = useNavigate();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const [step, setStep] = useState(1);
  const [p, setP] = useState<any>({ tone: "friendly", language: lang });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      if (data) setP({ ...data, tone: data.tone ?? "friendly", language: data.language ?? lang });
    })();
  }, []);

  const canNext =
    (step === 1 && p.full_name && p.headline) ||
    (step === 2 && p.specialty && p.industry) ||
    step === 3;

  const finish = async () => {
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { error } = await supabase.from("profiles").update({
        full_name: p.full_name,
        headline: p.headline,
        bio: p.bio,
        specialty: p.specialty,
        industry: p.industry,
        goal: p.goal,
        tone: p.tone ?? "friendly",
        language: p.language ?? lang,
        onboarded: true,
      }).eq("id", u.user.id);
      if (error) throw error;
      await supabase.from("schedule_settings").upsert({
        user_id: u.user.id,
        posts_per_day: 1,
        publish_times: ["09:00"],
        timezone: "Asia/Riyadh",
        active: false,
        auto_generate: true,
      });
      toast.success(lang === "ar" ? "تم الحفظ" : "Saved");
      nav({ to: "/linkedin" });
    } catch (e: any) {
      toast.error(e.message);
    } finally { setSaving(false); }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t("onb.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("onb.subtitle")}</p>
        </div>

        <div className="flex items-center gap-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className={`h-1.5 flex-1 rounded-full ${step >= n ? "bg-gradient-primary" : "bg-secondary"}`} />
          ))}
        </div>

        <Card className="p-6 space-y-4">
          {step === 1 && (
            <>
              <h2 className="font-semibold">{t("onb.s1")}</h2>
              <div><Label>{t("auth.name")}</Label><Input value={p.full_name ?? ""} onChange={(e) => setP({ ...p, full_name: e.target.value })} /></div>
              <div><Label>{t("set.headline")}</Label><Input placeholder={lang === "ar" ? "مثال: مطور واجهات أمامية" : "e.g. Frontend Developer"} value={p.headline ?? ""} onChange={(e) => setP({ ...p, headline: e.target.value })} /></div>
              <div><Label>{t("set.bio")}</Label><Textarea rows={3} value={p.bio ?? ""} onChange={(e) => setP({ ...p, bio: e.target.value })} /></div>
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="font-semibold">{t("onb.s2")}</h2>
              <div><Label>{t("set.specialty")}</Label><Input value={p.specialty ?? ""} onChange={(e) => setP({ ...p, specialty: e.target.value })} /></div>
              <div><Label>{t("set.industry")}</Label><Input value={p.industry ?? ""} onChange={(e) => setP({ ...p, industry: e.target.value })} /></div>
              <div><Label>{t("set.goal")}</Label><Textarea rows={2} placeholder={lang === "ar" ? "مثلاً: جذب فرص وظيفية في الخارج" : "e.g. attract remote job opportunities"} value={p.goal ?? ""} onChange={(e) => setP({ ...p, goal: e.target.value })} /></div>
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="font-semibold">{t("onb.s3")}</h2>
              <div><Label>{t("set.tone")}</Label>
                <Select value={p.tone ?? "friendly"} onValueChange={(v) => setP({ ...p, tone: v })}>
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
              <div><Label>{t("set.lang")}</Label>
                <Select value={p.language ?? "ar"} onValueChange={(v) => setP({ ...p, language: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </Card>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 1}>
            {lang === "ar" ? "السابق" : "Back"}
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext} className="bg-gradient-primary gap-2">
              {lang === "ar" ? "التالي" : "Next"} <Arrow className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={finish} disabled={saving} className="bg-gradient-primary gap-2">
              <Check className="h-4 w-4" /> {saving ? "..." : t("onb.finish")}
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
