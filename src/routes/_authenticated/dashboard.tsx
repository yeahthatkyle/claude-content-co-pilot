import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, BookOpen, Mic, Telescope, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const stats = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [g, a, r, v] = await Promise.all([
        supabase.from("generated_content").select("id, title, content_type, status, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("content_assets").select("id", { count: "exact", head: true }),
        supabase.from("research_notes").select("id", { count: "exact", head: true }),
        supabase.from("brand_voice").select("id", { count: "exact", head: true }),
      ]);
      return {
        recent: g.data ?? [],
        assets: a.count ?? 0,
        research: r.count ?? 0,
        voices: v.count ?? 0,
      };
    },
  });

  return (
    <div className="px-8 py-10 max-w-6xl">
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-3">Workspace</p>
          <h1 className="font-display text-5xl">Dashboard</h1>
        </div>
        <Link
          to="/generator"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Sparkles className="size-4" /> New draft
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <StatCard label="Generated" value={stats.data?.recent.length ?? 0} icon={Sparkles} to="/generator" />
        <StatCard label="Brand voices" value={stats.data?.voices ?? 0} icon={Mic} to="/brand-voice" />
        <StatCard label="Assets" value={stats.data?.assets ?? 0} icon={BookOpen} to="/library" />
        <StatCard label="Research notes" value={stats.data?.research ?? 0} icon={Telescope} to="/research" />
      </div>

      <div>
        <h2 className="font-display text-2xl mb-4">Recent drafts</h2>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {(stats.data?.recent ?? []).length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No drafts yet. <Link to="/generator" className="underline">Generate your first one →</Link>
            </div>
          ) : (
            (stats.data?.recent ?? []).map((d) => (
              <Link
                key={d.id}
                to="/generator"
                search={{ id: d.id }}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-accent/40 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{d.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {d.content_type} · {d.status} · {new Date(d.created_at).toLocaleDateString()}
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground shrink-0" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, to }: { label: string; value: number; icon: typeof Sparkles; to: string }) {
  return (
    <Link to={to} className="block rounded-lg border border-border bg-card p-5 hover:bg-accent/40 transition-colors">
      <Icon className="size-4 text-muted-foreground mb-3" />
      <div className="font-display text-3xl">{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </Link>
  );
}
