import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/library")({
  component: LibraryPage,
});

const CATEGORIES = ["snippet", "product", "guideline", "boilerplate", "tagline"] as const;

type Asset = {
  id: string;
  title: string;
  category: string;
  body: string;
  tags: string[];
};

function LibraryPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<Asset> | null>(null);
  const [saving, setSaving] = useState(false);

  const assets = useQuery({
    queryKey: ["assets"],
    queryFn: async () => (await supabase.from("content_assets").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const filtered = (assets.data ?? []).filter(
    (a) =>
      (filter === "all" || a.category === filter) &&
      (!search || a.title.toLowerCase().includes(search.toLowerCase()) || a.body.toLowerCase().includes(search.toLowerCase())),
  );

  const save = async () => {
    if (!editing?.title?.trim() || !editing.body?.trim()) {
      return toast.error("Title and body required");
    }
    setSaving(true);
    const payload = {
      title: editing.title,
      category: editing.category || "snippet",
      body: editing.body,
      tags: editing.tags ?? [],
    };
    const res = editing.id
      ? await supabase.from("content_assets").update(payload).eq("id", editing.id)
      : await supabase.from("content_assets").insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success("Saved");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["assets"] });
    qc.invalidateQueries({ queryKey: ["assets-list"] });
    qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this asset?")) return;
    await supabase.from("content_assets").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["assets"] });
    qc.invalidateQueries({ queryKey: ["assets-list"] });
    qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };

  return (
    <div className="px-8 py-10 max-w-6xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-3">Library</p>
          <h1 className="font-display text-5xl">Asset Library</h1>
          <p className="mt-2 text-muted-foreground">Reusable snippets, product blurbs, taglines, brand boilerplate.</p>
        </div>
        <button
          onClick={() => setEditing({ title: "", category: "snippet", body: "", tags: [] })}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" /> New asset
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <input
          placeholder="Search assets…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-md border border-input bg-card px-3 py-2 text-sm"
        />
        <div className="flex gap-1">
          {(["all", ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`text-xs rounded-full px-3 py-1.5 border capitalize ${
                filter === c ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:bg-accent"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.length === 0 && (
          <div className="md:col-span-2 rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
            No assets. Create one to pull as grounded context in the generator.
          </div>
        )}
        {filtered.map((a) => (
          <div key={a.id} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between mb-2">
              <button onClick={() => setEditing(a)} className="text-left">
                <h3 className="font-display text-xl">{a.title}</h3>
                <span className="text-xs uppercase tracking-wider text-gold mt-1 inline-block">{a.category}</span>
              </button>
              <button onClick={() => remove(a.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="size-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">{a.body}</p>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
          <div className="w-full max-w-2xl bg-card rounded-lg border border-border shadow-editorial">
            <div className="p-6 space-y-4">
              <h2 className="font-display text-2xl">{editing.id ? "Edit asset" : "New asset"}</h2>
              <input
                placeholder="Title"
                value={editing.title ?? ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <select
                value={editing.category ?? "snippet"}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm capitalize"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <textarea
                placeholder="Content / body"
                value={editing.body ?? ""}
                onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                rows={10}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
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
