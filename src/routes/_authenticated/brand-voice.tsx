import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Star, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/brand-voice")({
  component: BrandVoicePage,
});

type Voice = {
  id: string;
  name: string;
  description: string | null;
  tone: string | null;
  audience: string | null;
  do_list: string | null;
  dont_list: string | null;
  example_copy: string | null;
  is_default: boolean;
};

function BrandVoicePage() {
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const list = useQuery({
    queryKey: ["brand_voices_full"],
    queryFn: async () => (await supabase.from("brand_voice").select("*").order("created_at")).data ?? [],
  });

  const active = list.data?.find((v) => v.id === activeId) ?? list.data?.[0] ?? null;
  const [form, setForm] = useState<Partial<Voice>>({});

  // Sync form when active changes
  const currentId = active?.id ?? null;
  if (currentId && form.id !== currentId) {
    setForm(active!);
  }

  const create = async () => {
    const { data, error } = await supabase
      .from("brand_voice")
      .insert({ name: "New voice", is_default: !list.data?.length })
      .select()
      .single();
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["brand_voices_full"] });
    qc.invalidateQueries({ queryKey: ["brand_voices"] });
    setActiveId(data.id);
    setForm(data);
  };

  const save = async () => {
    if (!form.id) return;
    setSaving(true);
    const { error } = await supabase
      .from("brand_voice")
      .update({
        name: form.name,
        description: form.description,
        tone: form.tone,
        audience: form.audience,
        do_list: form.do_list,
        dont_list: form.dont_list,
        example_copy: form.example_copy,
      })
      .eq("id", form.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["brand_voices_full"] });
    qc.invalidateQueries({ queryKey: ["brand_voices"] });
  };

  const makeDefault = async () => {
    if (!form.id) return;
    await supabase.from("brand_voice").update({ is_default: false }).neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("brand_voice").update({ is_default: true }).eq("id", form.id);
    qc.invalidateQueries({ queryKey: ["brand_voices_full"] });
    qc.invalidateQueries({ queryKey: ["brand_voices"] });
    toast.success("Set as default");
  };

  const remove = async () => {
    if (!form.id || !confirm("Delete this brand voice?")) return;
    await supabase.from("brand_voice").delete().eq("id", form.id);
    setActiveId(null);
    setForm({});
    qc.invalidateQueries({ queryKey: ["brand_voices_full"] });
    qc.invalidateQueries({ queryKey: ["brand_voices"] });
  };

  return (
    <div className="px-8 py-10 max-w-6xl">
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-3">Foundations</p>
          <h1 className="font-display text-5xl">Brand Voice</h1>
        </div>
        <button onClick={create} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus className="size-4" /> New voice
        </button>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        <aside className="space-y-1">
          {(list.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground italic">No voices yet. Create one to ground every draft.</p>
          )}
          {(list.data ?? []).map((v) => (
            <button
              key={v.id}
              onClick={() => { setActiveId(v.id); setForm(v); }}
              className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
                form.id === v.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="truncate">{v.name}</span>
                {v.is_default && <Star className="size-3 fill-gold text-gold" />}
              </div>
            </button>
          ))}
        </aside>

        {form.id ? (
          <div className="space-y-4 rounded-lg border border-border bg-card p-6">
            <Field label="Name">
              <input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </Field>
            <Field label="Description">
              <textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </Field>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Tone">
                <textarea value={form.tone ?? ""} onChange={(e) => setForm({ ...form, tone: e.target.value })} rows={3} placeholder="Confident, direct, numbers-driven..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </Field>
              <Field label="Audience">
                <textarea value={form.audience ?? ""} onChange={(e) => setForm({ ...form, audience: e.target.value })} rows={3} placeholder="Mid-market CFOs, AP managers, treasury leads..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </Field>
              <Field label="DO">
                <textarea value={form.do_list ?? ""} onChange={(e) => setForm({ ...form, do_list: e.target.value })} rows={4} placeholder="• Use concrete numbers&#10;• Lead with buyer pain..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono" />
              </Field>
              <Field label="DON'T">
                <textarea value={form.dont_list ?? ""} onChange={(e) => setForm({ ...form, dont_list: e.target.value })} rows={4} placeholder="• No 'unlock', 'leverage', 'synergy'&#10;• No filler intros..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono" />
              </Field>
            </div>
            <Field label="Example copy">
              <textarea value={form.example_copy ?? ""} onChange={(e) => setForm({ ...form, example_copy: e.target.value })} rows={6} placeholder="Paste a piece of writing that exemplifies the voice." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </Field>

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
                  {saving && <Loader2 className="size-3.5 animate-spin" />}
                  Save
                </button>
                {!form.is_default && (
                  <button onClick={makeDefault} className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-accent">
                    <Star className="size-3.5" /> Set default
                  </button>
                )}
              </div>
              <button onClick={remove} className="inline-flex items-center gap-2 text-sm text-destructive hover:underline">
                <Trash2 className="size-4" /> Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-16 text-center text-muted-foreground">
            Select a voice or create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">{label}</span>
      {children}
    </label>
  );
}
