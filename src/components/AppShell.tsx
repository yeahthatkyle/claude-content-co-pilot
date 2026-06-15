import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles, BookOpen, Mic, Telescope, LayoutDashboard, LogOut } from "lucide-react";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/generator", label: "Generator", icon: Sparkles },
  { to: "/brand-voice", label: "Brand Voice", icon: Mic },
  { to: "/library", label: "Asset Library", icon: BookOpen },
  { to: "/research", label: "Research", icon: Telescope },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
          <div className="px-6 pt-7 pb-4">
            <Link to="/dashboard" className="flex items-baseline gap-2">
              <span className="font-display text-2xl tracking-tight">Corpay</span>
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">/ Engine</span>
            </Link>
          </div>
          <nav className="flex-1 px-3 pt-2 space-y-1">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-border">
            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
