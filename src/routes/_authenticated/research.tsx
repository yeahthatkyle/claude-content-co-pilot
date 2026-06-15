import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/research")({
  component: ResearchPage,
});

type Note = {
  id: string;
  title: string;
  source_url: string | null;
  topic: string | null;
  summary: string;
  insights: string | null;
};

function ResearchPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Note> | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const notes = useQuery({
    queryKey: ["research"],
    queryFn: async () => (await supabase.from("research_notes").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const filtered = (notes.data ?? []).filter(
    (n) => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.summary.toLowerCase().includes(search.toLowerCase()),
  );

  const save = async () => {
    if (!editing?.title?.trim() || !editing?.summary?.trim()) return toast.error("Title and summary required");
    setSaving(true);
    const payload = {
      title: editing.title,
      source_url: editing.source_url || null,
      topic: editing.topic || null,
      summary: editing.summary,
      insights: editing.insights || null,
    };
    const res = editing.id
      ? await supabase.from("research_notes").update(payload).eq("id", editing.id)
      : await supabase.from("research_notes").insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success("Saved");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["research"] });
    qc.invalidateQueries({ queryKey: ["research-list"] });
    qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    await supabase.from("research_notes").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["research"] });
    qc.invalidateQueries({ queryKey: ["research-list"] });
    qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };

  return (
    <div className="px-8 py-10 max-w-6xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-3">Intelligence</p>
          <h1 className="font-display text-5xl">Research</h1>
          <p className="mt-2 text-muted-foreground">Market intel, competitive insights, source material to ground every draft.</p>
        </div>
        <button
          onClick={() => setEditing({ title: "", source_url: "", topic: "", summary: "", insights: "" })}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" /> New note
        </button>
      </div>

      <input
        placeholder="Search notes…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md rounded-md border border-input bg-card px-3 py-2 text-sm mb-6"
      />

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
            No research notes yet.
          </div>
        )}
        {filtered.map((n) => (
          <div key={n.id} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <button onClick={() => setEditing(n)} className="text-left">
                  <h3 className="font-display text-xl">{n.title}</h3>
                </button>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  {n.topic && <span className="text-gold uppercase tracking-wider">{n.topic}</span>}
                  {n.source_url && (
                    <a href={n.source_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                      <ExternalLink className="size-3" /> Source
                    </a>
                  )}
                </div>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{n.summary}</p>
                {n.insights && (
                  <p className="mt-2 text-sm border-l-2 border-gold pl-3 italic">{n.insights}</p>
                )}
              </div>
              <button onClick={() => remove(n.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
          <div className="w-full max-w-2xl bg-card rounded-lg border border-border shadow-editorial">
            <div className="p-6 space-y-4">
              <h2 className="font-display text-2xl">{editing.id ? "Edit note" : "New research note"}</h2>
              <input placeholder="Title" value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Topic (e.g., AP automation)" value={editing.topic ?? ""} onChange={(e) => setEditing({ ...editing, topic: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                <input placeholder="Source URL" value={editing.source_url ?? ""} onChange={(e) => setEditing({ ...editing, source_url: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <textarea placeholder="Summary" value={editing.summary ?? ""} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} rows={6} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              <textarea placeholder="Key insights / takeaways" value={editing.insights ?? ""} onChange={(e) => setEditing({ ...editing, insights: e.target.value })} rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-md border border-border text-sm hover:bg-accent">Cancel</button>
                <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
                  {saving && <Loader2 className="size-3.5 animate-spin" />} Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
