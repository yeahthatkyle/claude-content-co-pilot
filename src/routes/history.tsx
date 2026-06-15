import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ModeShell, Card, Markdown } from "@/components/Shell";
import { getGenerations } from "@/lib/generate.functions";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "History — Corpay Content Engine" }] }),
  component: HistoryPage,
});

type Generation = {
  id: string;
  mode: string;
  stage: string | null;
  persona: string | null;
  product: string | null;
  brief: string | null;
  output: string;
  created_at: string;
};

const MODE_LABELS: Record<string, string> = {
  "creative": "🎬 Creative",
  "thought-leadership": "💡 Thought Leadership",
  "static-social": "🖼️ Static & Social",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HistoryPage() {
  const fetchGens = useServerFn(getGenerations);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGens({ data: {} })
      .then((r) => setGenerations(r.generations as Generation[]))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load history"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ModeShell title="📋 History">
      {loading && (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}

      {error && (
        <Card className="border-destructive/50 mb-6">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      {!loading && generations.length === 0 && !error && (
        <Card>
          <p className="text-sm text-muted-foreground">No generations yet. Generate something first.</p>
        </Card>
      )}

      {generations.length > 0 && (
        <div className="space-y-3">
          {generations.map((g) => {
            const isOpen = expanded === g.id;
            const summary = g.brief
              ? g.brief.length > 80 ? g.brief.slice(0, 80) + "…" : g.brief
              : [g.stage, g.persona, g.product].filter(Boolean).join(" · ") || "—";

            return (
              <Card key={g.id} className="p-0 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : g.id)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-surface/50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-xs font-medium text-primary whitespace-nowrap">
                      {MODE_LABELS[g.mode] ?? g.mode}
                    </span>
                    {g.stage && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                        {g.stage}
                      </span>
                    )}
                    <span className="text-sm text-foreground truncate">{summary}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground hidden md:block">
                      {formatDate(g.created_at)}
                    </span>
                    <span className="text-muted-foreground text-xs">{isOpen ? "▲" : "▼"}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-border pt-4">
                    <div className="flex flex-wrap gap-4 mb-4 text-xs text-muted-foreground">
                      {g.persona && <span>Persona: <strong className="text-foreground">{g.persona}</strong></span>}
                      {g.product && <span>Product: <strong className="text-foreground">{g.product}</strong></span>}
                      <span>{formatDate(g.created_at)}</span>
                    </div>
                    <Markdown content={g.output} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </ModeShell>
  );
}
