import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  FileText,
  Home,
  Linkedin,
  LogOut,
  Menu,
  PenLine,
  Settings as SettingsIcon,
  Wrench,
  X,
} from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const items = [
    { to: "/dashboard", icon: Home, label: "الرئيسية" },
    { to: "/posts/new", icon: PenLine, label: "كتابة منشور" },
    { to: "/posts", icon: FileText, label: "منشوراتي" },
    { to: "/planner", icon: CalendarDays, label: "خطة الأسبوع" },
    { to: "/tools", icon: Wrench, label: "أدوات الكتابة" },
    { to: "/linkedin", icon: Linkedin, label: "LinkedIn" },
    { to: "/settings", icon: SettingsIcon, label: "الإعدادات" },
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
          <img src="https://cdn.builder.io/api/v1/image/assets%2F346e6505607b4f3892f8a2e9c5da6d92%2Fb7cab537912b481c8b9aca0820f138bb?format=webp&width=800&height=1200" alt="شعار لينك بوست" className="h-8 w-8 rounded-lg object-contain" />
          <span className="font-bold">LinkPost</span>
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
            <img src="https://cdn.builder.io/api/v1/image/assets%2F346e6505607b4f3892f8a2e9c5da6d92%2Fb7cab537912b481c8b9aca0820f138bb?format=webp&width=800&height=1200" alt="شعار لينك بوست" className="h-8 w-8 rounded-lg object-contain" />
            <span className="font-bold">LinkPost</span>
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
