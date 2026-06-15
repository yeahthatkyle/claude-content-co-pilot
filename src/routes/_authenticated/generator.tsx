import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { generateContent } from "@/lib/claude.functions";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const search = z.object({ id: z.string().uuid().optional() });

export const Route = createFileRoute("/_authenticated/generator")({
  validateSearch: search,
  component: Generator,
});

type ContentType = "blog" | "social" | "email" | "ad" | "landing";

function Generator() {
  const { id } = Route.useSearch();
  const qc = useQueryClient();
  const generate = useServerFn(generateContent);

  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState<ContentType>("blog");
  const [prompt, setPrompt] = useState("");
  const [brandVoiceId, setBrandVoiceId] = useState<string>("");
  const [assetIds, setAssetIds] = useState<string[]>([]);
  const [researchIds, setResearchIds] = useState<string[]>([]);
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const voices = useQuery({
    queryKey: ["brand_voices"],
    queryFn: async () => (await supabase.from("brand_voice").select("id,name,is_default").order("created_at")).data ?? [],
  });
  const assets = useQuery({
    queryKey: ["assets-list"],
    queryFn: async () => (await supabase.from("content_assets").select("id,title,category").order("title")).data ?? [],
  });
  const research = useQuery({
    queryKey: ["research-list"],
    queryFn: async () => (await supabase.from("research_notes").select("id,title,topic").order("title")).data ?? [],
  });

  // Default brand voice
  useEffect(() => {
    if (!brandVoiceId && voices.data?.length) {
      const def = voices.data.find((v) => v.is_default) ?? voices.data[0];
      setBrandVoiceId(def.id);
    }
  }, [voices.data, brandVoiceId]);

  // Load existing draft
  const existing = useQuery({
    queryKey: ["draft", id],
    enabled: !!id,
    queryFn: async () => (await supabase.from("generated_content").select("*").eq("id", id!).maybeSingle()).data,
  });
  useEffect(() => {
    if (existing.data) {
      setTitle(existing.data.title);
      setContentType(existing.data.content_type as ContentType);
      setPrompt(existing.data.prompt);
      setOutput(existing.data.body);
      if (existing.data.brand_voice_id) setBrandVoiceId(existing.data.brand_voice_id);
      setAssetIds(existing.data.asset_ids ?? []);
      setResearchIds(existing.data.research_ids ?? []);
    }
  }, [existing.data]);

  const canGenerate = useMemo(() => title.trim() && prompt.trim() && !loading, [title, prompt, loading]);

  const onGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setOutput("");
    try {
      const res = await generate({
        data: {
          title: title.trim(),
          contentType,
          prompt: prompt.trim(),
          brandVoiceId: brandVoiceId || null,
          assetIds,
          researchIds,
          save: true,
        },
      });
      setOutput(res.body);
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Draft generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleId = (list: string[], setList: (v: string[]) => void, id: string) =>
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="px-8 py-10 max-w-6xl">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-3">Compose</p>
      <h1 className="font-display text-5xl mb-10">Content Generator</h1>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8">
        {/* Form */}
        <div className="space-y-5">
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Why mid-market CFOs are automating AP in 2026"
              className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm"
            />
          </Field>

          <Field label="Content type">
            <div className="grid grid-cols-5 gap-1.5">
              {(["blog", "social", "email", "ad", "landing"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setContentType(t)}
                  className={`rounded-md border px-2 py-2 text-xs capitalize transition-colors ${
                    contentType === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border bg-card hover:bg-accent"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Brief / prompt">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What should this piece accomplish? Audience, angle, must-include points, CTA..."
              rows={5}
              className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm font-mono"
            />
          </Field>

          <Field label="Brand voice">
            <select
              value={brandVoiceId}
              onChange={(e) => setBrandVoiceId(e.target.value)}
              className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm"
            >
              <option value="">— Default Corpay voice —</option>
              {voices.data?.map((v) => (
                <option key={v.id} value={v.id}>{v.name}{v.is_default ? " (default)" : ""}</option>
              ))}
            </select>
          </Field>

          <Field label={`Reference assets (${assetIds.length})`}>
            <ChipPicker
              items={assets.data?.map((a) => ({ id: a.id, label: a.title, sub: a.category })) ?? []}
              selected={assetIds}
              onToggle={(id) => toggleId(assetIds, setAssetIds, id)}
              empty="No assets yet — add some in the Library."
            />
          </Field>

          <Field label={`Research to cite (${researchIds.length})`}>
            <ChipPicker
              items={research.data?.map((r) => ({ id: r.id, label: r.title, sub: r.topic ?? "" })) ?? []}
              selected={researchIds}
              onToggle={(id) => toggleId(researchIds, setResearchIds, id)}
              empty="No research notes yet."
            />
          </Field>

          <button
            onClick={onGenerate}
            disabled={!canGenerate}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? "Generating with Claude…" : "Generate"}
          </button>
        </div>

        {/* Output */}
        <div className="rounded-lg border border-border bg-card">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Output</span>
            {output && (
              <button
                onClick={copy}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
          <div className="p-6 min-h-[60vh] whitespace-pre-wrap text-sm leading-relaxed font-mono">
            {loading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
                <Loader2 className="size-4 animate-spin" /> Claude is writing…
              </div>
            ) : output ? (
              output
            ) : (
              <div className="text-muted-foreground italic">Your draft will appear here.</div>
            )}
          </div>
        </div>
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

function ChipPicker({
  items,
  selected,
  onToggle,
  empty,
}: {
  items: Array<{ id: string; label: string; sub?: string }>;
  selected: string[];
  onToggle: (id: string) => void;
  empty: string;
}) {
  if (!items.length) return <div className="text-xs text-muted-foreground italic">{empty}</div>;
  return (
    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 rounded-md border border-input bg-card">
      {items.map((it) => {
        const on = selected.includes(it.id);
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onToggle(it.id)}
            className={`text-xs rounded-full px-3 py-1 border transition-colors ${
              on
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border bg-background hover:bg-accent"
            }`}
            title={it.sub}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
