import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ModeShell, Button, Card, Label, Field, CopyButton, PillTabs, Spinner } from "@/components/Shell";
import { saveGeneration } from "@/lib/generate.functions";
import { generateContent } from "@/services/claude";

export const Route = createFileRoute("/creative")({
  head: () => ({ meta: [{ title: "Creative — Corpay Content Engine" }] }),
  component: CreativePage,
});

const STAGES = ["Idea", "Script", "Moodboard", "Storyboard", "Execution Round", "Final"] as const;
const PERSONAS = ["All Personas", "Fleet Guy", "T&E Traveler", "Barb (AP Manager)"] as const;
const PRODUCTS = ["Multi-Card", "AP Automation", "International Payments", "Brand"] as const;

function CreativePage() {
  
  const save = useServerFn(saveGeneration);
  const [selectedStage, setSelectedStage] = useState<(typeof STAGES)[number]>("Idea");
  const [brief, setBrief] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<string>(PERSONAS[0]);
  const [selectedProduct, setSelectedProduct] = useState<string>(PRODUCTS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setOutput("");
    try {
      const res = await generateContent({
        mode: "creative",
        stage: selectedStage,
        brief: brief,
        persona: selectedPersona,
        product: selectedProduct,
      });
      setOutput(res);
      void save({ data: { mode: "creative", stage: selectedStage, persona: selectedPersona, product: selectedProduct, brief, output: res } }).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModeShell title="🎬 Creative">
      <Card className="mb-6">
        <div className="space-y-6">
          <div>
            <Label>Stage</Label>
            <PillTabs options={STAGES} value={stage} onChange={setStage} />
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
              <Field as="select" value={persona} onChange={(e) => setPersona(e.target.value)}>
                {PERSONAS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Field>
            </div>
            <div>
              <Label>Product</Label>
              <Field as="select" value={product} onChange={(e) => setProduct(e.target.value)}>
                {PRODUCTS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Field>
            </div>
          </div>
          <div>
            <Button onClick={onGenerate} disabled={isLoading}>
              {isLoading ? (<span className="inline-flex items-center gap-2"><Spinner />Generating…</span>) : "Generate"}
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="border-destructive/50 mb-6">
          <p className="text-sm text-destructive-foreground">{error}</p>
        </Card>
      )}

      {output && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Output</h2>
            <CopyButton text={output} />
          </div>
          <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-foreground">{output}</pre>
        </Card>
      )}
    </ModeShell>
  );
}
