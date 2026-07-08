import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/billing")({
  component: BillingPage,
});

function BillingPage() {
  const { t, lang } = useI18n();
  const [sub, setSub] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase.from("subscriptions").select("*").eq("user_id", u.user.id).maybeSingle();
      setSub(data);
    })();
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold">{t("bill.title")}</h1>

        <Card className="p-6">
          <h2 className="font-semibold">{t("bill.current")}</h2>
          <div className="mt-3 flex items-center gap-3">
            <Badge>{sub?.plan ?? "free"}</Badge>
            <span className="text-sm text-muted-foreground">{sub?.status ?? "trial"}</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{t("bill.soon")}</p>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            { name: t("price.pro.t"), price: lang === "ar" ? "٤٩$" : "$49", per: t("price.month"), desc: t("price.pro.d") },
            { name: t("price.yearly.t"), price: lang === "ar" ? "٤٩٠$" : "$490", per: t("price.year"), desc: t("price.yearly.d") },
          ].map((p) => (
            <Card key={p.name} className="p-6">
              <h3 className="font-semibold">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.per}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              <Button className="mt-4 w-full bg-gradient-primary" disabled>
                {t("bill.upgrade")}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
