import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Settings as SettingsIcon,
  CreditCard,
  Linkedin,
  ShieldCheck,
  LogOut,
  Zap,
  Menu,
  X,
} from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    })();
  }, []);

  const items = [
    { to: "/dashboard", icon: LayoutDashboard, label: t("nav.dashboard") },
    { to: "/posts", icon: FileText, label: t("nav.posts") },
    { to: "/settings", icon: SettingsIcon, label: t("nav.settings") },
    { to: "/billing", icon: CreditCard, label: t("nav.billing") },
    { to: "/linkedin", icon: Linkedin, label: t("nav.linkedin") },
    ...(isAdmin ? [{ to: "/admin", icon: ShieldCheck, label: t("nav.admin") }] : []),
  ] as const;

  const logout = async () => {
    await supabase.auth.signOut();
    nav({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Top bar mobile */}
      <div className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold">ReachLink</span>
        </Link>
        <Button size="icon" variant="ghost" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            open ? "block" : "hidden"
          } fixed inset-x-0 top-14 z-40 border-b border-border bg-background md:sticky md:top-0 md:block md:h-screen md:w-64 md:border-e md:border-b-0`}
        >
          <div className="hidden h-16 items-center gap-2 border-b border-border px-5 md:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">ReachLink</span>
          </div>
          <nav className="flex flex-col gap-1 p-3">
            {items.map(({ to, icon: Icon, label }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto flex items-center justify-between border-t border-border p-3">
            <LanguageSwitcher />
            <Button size="sm" variant="ghost" onClick={logout} className="gap-2">
              <LogOut className="h-4 w-4" />
              {t("nav.logout")}
            </Button>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
