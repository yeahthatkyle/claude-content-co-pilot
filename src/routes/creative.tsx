import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ModeShell, Button, Card, Label, Field, CopyButton, PillTabs, Spinner, Markdown } from "@/components/Shell";
import { runGeneration, saveGeneration } from "@/lib/generate.functions";

export const Route = createFileRoute("/creative")({
  head: () => ({ meta: [{ title: "Creative — Corpay Content Engine" }] }),
  component: CreativePage,
});

const STAGES = ["Idea", "Script", "Moodboard", "Storyboard", "Execution Round", "Final"] as const;
const PERSONAS = ["All Personas", "Fleet Guy", "T&E Traveler", "Barb (AP Manager)"] as const;
const PRODUCTS = ["Multi-Card", "AP Automation", "International Payments", "Brand"] as const;

function parseIdeaConcepts(text: string): string[] {
  const parts = text.split(/(?=#+\s*Concept\s+\d+)/i);
  const concepts = parts.map((p) => p.trim()).filter(Boolean);
  return concepts.length > 1 ? concepts : [text];
}

function CreativePage() {
  const generate = useServerFn(runGeneration);
  const save = useServerFn(saveGeneration);
  const [selectedStage, setSelectedStage] = useState<(typeof STAGES)[number]>("Idea");
  const [brief, setBrief] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<string>(PERSONAS[0]);
  const [selectedProduct, setSelectedProduct] = useState<string>(PRODUCTS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const runGenerate = async (opts: {
    stage: (typeof STAGES)[number];
    brief: string;
    persona: string;
    product: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setOutput("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const res = await generate({
        data: { mode: "creative", ...opts },
      });
      setOutput(res.body);
      void save({
        data: { mode: "creative", stage: opts.stage, persona: opts.persona, product: opts.product, brief: opts.brief, output: res.body },
      }).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const onGenerate = () =>
    runGenerate({ stage: selectedStage, brief, persona: selectedPersona, product: selectedProduct });

  const developConcept = (concept: string) => {
    const nextStage = "Script" as const;
    const trimmed = concept.slice(0, 500);
    setSelectedStage(nextStage);
    setBrief(trimmed);
    void runGenerate({ stage: nextStage, brief: trimmed, persona: selectedPersona, product: selectedProduct });
  };

  const ideaConcepts = selectedStage === "Idea" && output ? parseIdeaConcepts(output) : null;

  return (
    <ModeShell title="🎬 Creative">
      <Card className="mb-6">
        <div className="space-y-6">
          <div>
            <Label>Stage</Label>
            <PillTabs options={STAGES} value={selectedStage} onChange={(s) => { setSelectedStage(s); setOutput(""); }} />
          </div>
          <div>
            <Label>Brief</Label>
            <Field
              as="textarea"
              maxLength={500}
              rows={4}
              placeholder="Describe the campaign brief..."
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
            />
            <div className="text-xs text-muted-foreground mt-1">{brief.length} / 500</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Persona</Label>
              <Field as="select" value={selectedPersona} onChange={(e) => setSelectedPersona(e.target.value)}>
                {PERSONAS.map((p) => <option key={p} value={p}>{p}</option>)}
              </Field>
            </div>
            <div>
              <Label>Product</Label>
              <Field as="select" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                {PRODUCTS.map((p) => <option key={p} value={p}>{p}</option>)}
              </Field>
            </div>
          </div>
          <div>
            <Button onClick={onGenerate} disabled={isLoading}>
              {isLoading ? <span className="inline-flex items-center gap-2"><Spinner />Generating…</span> : "Generate"}
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="border-destructive/50 mb-6">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      {/* Idea stage: parse into selectable concept cards */}
      {ideaConcepts && ideaConcepts.length > 1 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Pick a concept to develop
            </p>
            <CopyButton text={output} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {ideaConcepts.map((concept, i) => (
              <Card key={i} className="flex flex-col justify-between gap-4">
                <Markdown content={concept} />
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => developConcept(concept)}
                  disabled={isLoading}
                >
                  {isLoading ? <span className="inline-flex items-center gap-2"><Spinner />Generating…</span> : "Develop into Script →"}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      ) : output ? (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Output</h2>
            <CopyButton text={output} />
          </div>
          <Markdown content={output} />
        </Card>
      ) : null}
    </ModeShell>
  );
}
