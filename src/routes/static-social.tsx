import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ModeShell, Button, Card, Label, Field, CopyButton, PillTabs, Spinner } from "@/components/Shell";
import { saveGeneration } from "@/lib/generate.functions";
import { generateContent } from "@/services/claude";

export const Route = createFileRoute("/static-social")({
  head: () => ({ meta: [{ title: "Static & Social — Corpay Content Engine" }] }),
  component: StaticPage,
});

const ASSET_TYPES = ["Social Post", "Digital Ad", "OOH", "Banner"] as const;
const PLATFORMS = ["LinkedIn", "Meta", "Display", "Print"] as const;
const PERSONAS = ["All Personas", "Fleet Guy", "T&E Traveler", "Barb (AP Manager)"] as const;

type Variation = {
  label: string;
  headline: string;
  subhead: string;
  body: string;
  cta: string;
  visual: string;
  persona: string;
  platformNote: string;
  raw: string;
};

function parseVariations(text: string): Variation[] {
  const parts = text.split(/###\s*Variation\s+/i).slice(1);
  return parts.map((p) => {
    const labelMatch = p.match(/^([A-Z])/);
    const label = labelMatch ? labelMatch[1] : "";
    const get = (k: string) => {
      const re = new RegExp(`${k}:\\s*([^\\n]+(?:\\n(?!\\w[\\w ]*:)[^\\n]+)*)`, "i");
      const m = p.match(re);
      return (m ? m[1] : "").trim();
    };
    return {
      label,
      headline: get("Headline"),
      subhead: get("Subhead"),
      body: get("Body Copy"),
      cta: get("CTA"),
      visual: get("Visual Direction"),
      persona: get("Persona"),
      platformNote: get("Platform Note"),
      raw: p.trim(),
    };
  });
}

function StaticPage() {
  const save = useServerFn(saveGeneration);
  const [assetType, setAssetType] = useState<(typeof ASSET_TYPES)[number]>("Social Post");
  const [platform, setPlatform] = useState<(typeof PLATFORMS)[number]>("LinkedIn");
  const [persona, setPersona] = useState<string>(PERSONAS[0]);
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onGenerate = async () => {
    setLoading(true);
    setError(null);
    setVariations([]);
    try {
      const res = await generateContent({ mode: "static-social", assetType, platform, persona, brief });
      setVariations(parseVariations(res.body));
      void save({
        data: {
          mode: "static-social",
          stage: assetType,
          persona,
          product: platform,
          brief,
          output: res.body,
        },
      }).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModeShell title="📐 Static & Social">
      <Card className="mb-6">
        <div className="space-y-6">
          <div>
            <Label>Asset Type</Label>
            <PillTabs options={ASSET_TYPES} value={assetType} onChange={setAssetType} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Platform</Label>
              <Field as="select" value={platform} onChange={(e) => setPlatform(e.target.value as typeof platform)}>
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </Field>
            </div>
            <div>
              <Label>Persona</Label>
              <Field as="select" value={persona} onChange={(e) => setPersona(e.target.value)}>
                {PERSONAS.map((p) => <option key={p} value={p}>{p}</option>)}
              </Field>
            </div>
          </div>
          <div>
            <Label>Brief (optional)</Label>
            <Field
              as="textarea"
              rows={3}
              placeholder="Optional brief, offer, or angle..."
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
            />
          </div>
          <div>
            <Button onClick={onGenerate} disabled={loading}>
              {loading ? (<span className="inline-flex items-center gap-2"><Spinner />Generating…</span>) : "Generate"}
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="border-destructive/50 mb-6">
          <p className="text-sm text-destructive-foreground">{error}</p>
        </Card>
      )}

      {variations.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {variations.map((v) => (
            <Card key={v.label}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-semibold text-primary">{v.label}</h2>
                <CopyButton text={v.raw} />
              </div>
              <div className="space-y-3 text-sm">
                <Row label="Headline" value={v.headline} />
                <Row label="Subhead" value={v.subhead} />
                <Row label="Body Copy" value={v.body} />
                <Row label="CTA" value={v.cta} />
                <Row label="Visual Direction" value={v.visual} />
                <Row label="Persona" value={v.persona} />
                <Row label="Platform Note" value={v.platformNote} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </ModeShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="text-foreground whitespace-pre-wrap">{value}</div>
    </div>
  );
}
