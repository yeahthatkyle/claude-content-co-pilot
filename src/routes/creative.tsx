import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  ModeShell, Button, Card, Label, Field, CopyButton,
  Spinner, Markdown, Stepper, ImageCard,
} from "@/components/Shell";
import { runGeneration, saveGeneration, generateImage } from "@/lib/generate.functions";

export const Route = createFileRoute("/creative")({
  head: () => ({ meta: [{ title: "Creative — Corpay Content Engine" }] }),
  component: CreativePage,
});

const STAGES = ["Idea", "Script", "Moodboard", "Storyboard", "Execution Round", "Final"] as const;
type Stage = (typeof STAGES)[number];
const PERSONAS = ["All Personas", "Fleet Guy", "T&E Traveler", "Barb (AP Manager)"] as const;
const PRODUCTS = ["Multi-Card", "AP Automation", "International Payments", "Brand"] as const;

type StageResult = { stage: Stage; output: string };

function parseIdeaConcepts(text: string): string[] {
  const parts = text.split(/(?=#+\s*Concept\s+\d+)/i);
  const concepts = parts.map((p) => p.trim()).filter(Boolean);
  return concepts.length > 1 ? concepts : [text];
}

function buildMoodboardImagePrompt(text: string): string {
  // Strip markdown headers and bullet leaders, collect the most descriptive lines
  const lines = text
    .split("\n")
    .map((l) => l.replace(/^#{1,4}\s*/, "").replace(/^[-*]\s*/, "").trim())
    .filter((l) => l.length > 15 && !/^(motion feel|sound design|typography)/i.test(l));
  const body = lines.slice(0, 10).join(". ").replace(/\.{2,}/g, ".").slice(0, 600);
  return `Advertising moodboard composition. ${body}. Commercial photography, high production value, cinematic lighting, editorial quality.`;
}

function parseStoryboardFrames(text: string): { visual: string; label: string }[] {
  const parts = text.split(/(?=#+\s*Frame\s*\d+)/i).filter((p) => p.trim());
  if (parts.length < 2) return [{ visual: text, label: "Scene" }];
  return parts.map((p) => {
    const labelMatch = p.match(/#+\s*(Frame\s*\d+)/i);
    const visualMatch = p.match(/Visual[^:]*:\s*([^\n]+)/i);
    return {
      label: labelMatch ? labelMatch[1] : "Frame",
      visual: visualMatch ? visualMatch[1].trim() : p.split("\n").slice(1, 3).join(" ").trim(),
    };
  });
}

function CreativePage() {
  const doGenerate = useServerFn(runGeneration);
  const save = useServerFn(saveGeneration);
  const doImage = useServerFn(generateImage);

  // Pipeline state
  const [activeIndex, setActiveIndex] = useState(0);
  const [completed, setCompleted] = useState<StageResult[]>([]);
  const [initialBrief, setInitialBrief] = useState("");
  const [refinement, setRefinement] = useState("");
  const [persona, setPersona] = useState<string>(PERSONAS[0]);
  const [product, setProduct] = useState<string>(PRODUCTS[0]);
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Image generation state: keyed by a string identifier
  const [images, setImages] = useState<Record<string, string>>({});
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});

  const activeStage = STAGES[activeIndex];
  const prevOutput = completed[activeIndex - 1]?.output ?? "";
  const brief = activeIndex === 0 ? initialBrief : prevOutput;

  const runStage = async (opts: { stage: Stage; brief: string; refinementNote?: string }) => {
    setIsLoading(true);
    setError(null);
    setOutput("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    const combinedBrief = opts.refinementNote
      ? `${opts.brief}\n\nAdditional direction: ${opts.refinementNote}`
      : opts.brief;
    try {
      const res = await doGenerate({
        data: { mode: "creative", stage: opts.stage, brief: combinedBrief, persona, product },
      });
      setOutput(res.body);
      void save({ data: { mode: "creative", stage: opts.stage, persona, product, brief: combinedBrief, output: res.body } }).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const approve = () => {
    if (!output || activeIndex >= STAGES.length - 1) return;
    setCompleted((prev) => {
      const next = [...prev];
      next[activeIndex] = { stage: activeStage, output };
      return next;
    });
    setOutput("");
    setRefinement("");
    setActiveIndex((i) => i + 1);
  };

  const revert = (toIndex: number) => {
    setActiveIndex(toIndex);
    setCompleted((prev) => prev.slice(0, toIndex));
    setOutput(completed[toIndex]?.output ?? "");
    setRefinement("");
    setError(null);
  };

  const startOver = () => {
    setActiveIndex(0);
    setCompleted([]);
    setOutput("");
    setInitialBrief("");
    setRefinement("");
    setError(null);
  };

  const genImage = async (key: string, prompt: string, aspectRatio: "landscape_4_3" | "landscape_16_9") => {
    setImageLoading((prev) => ({ ...prev, [key]: true }));
    setImages((prev) => { const next = { ...prev }; delete next[key]; return next; });
    try {
      const res = await doImage({ data: { prompt, aspectRatio } });
      setImages((prev) => ({ ...prev, [key]: res.imageUrl }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Image generation failed");
    } finally {
      setImageLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const ideaConcepts = activeStage === "Idea" && output ? parseIdeaConcepts(output) : null;
  const isMoodboard = activeStage === "Moodboard" && !!output;
  const storyFrames = activeStage === "Storyboard" && output ? parseStoryboardFrames(output) : null;

  return (
    <ModeShell title="🎬 Creative">
      <Stepper
        steps={STAGES}
        activeIndex={activeIndex}
        onRevert={revert}
      />

      {/* Form */}
      <Card className="mb-6">
        <div className="space-y-5">
          {activeIndex === 0 ? (
            <div>
              <Label>Campaign Brief</Label>
              <Field
                as="textarea"
                maxLength={500}
                rows={4}
                placeholder="Describe the campaign brief, objective, or challenge…"
                value={initialBrief}
                onChange={(e) => setInitialBrief(e.target.value)}
              />
              <div className="text-xs text-muted-foreground mt-1">{initialBrief.length} / 500</div>
            </div>
          ) : (
            <div>
              <Label>Refinements for {activeStage} <span className="normal-case text-muted-foreground font-normal">(optional — leave blank to build straight from {STAGES[activeIndex - 1]})</span></Label>
              <Field
                as="textarea"
                rows={2}
                placeholder={`Any specific direction for the ${activeStage} stage…`}
                value={refinement}
                onChange={(e) => setRefinement(e.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Persona</Label>
              <Field as="select" value={persona} onChange={(e) => setPersona(e.target.value)}>
                {PERSONAS.map((p) => <option key={p}>{p}</option>)}
              </Field>
            </div>
            <div>
              <Label>Product</Label>
              <Field as="select" value={product} onChange={(e) => setProduct(e.target.value)}>
                {PRODUCTS.map((p) => <option key={p}>{p}</option>)}
              </Field>
            </div>
          </div>

          <div className="flex gap-3 items-center flex-wrap">
            <Button
              onClick={() => runStage({ stage: activeStage, brief, refinementNote: refinement })}
              disabled={isLoading || (activeIndex === 0 && !initialBrief.trim())}
            >
              {isLoading
                ? <span className="inline-flex items-center gap-2"><Spinner />Generating…</span>
                : output ? `Regenerate ${activeStage}` : `Generate ${activeStage}`}
            </Button>
            {activeIndex > 0 && (
              <button type="button" onClick={startOver} className="text-xs text-muted-foreground hover:text-foreground">
                Start over
              </button>
            )}
          </div>
        </div>
      </Card>

      {error && (
        <Card className="border-destructive/50 mb-6">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      {/* Idea: 3 concept cards */}
      {ideaConcepts && ideaConcepts.length > 1 && (
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Pick a concept to develop
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {ideaConcepts.map((concept, i) => (
              <Card key={i} className="flex flex-col justify-between gap-4">
                <Markdown content={concept} />
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => {
                    setCompleted([{ stage: "Idea", output: concept }]);
                    setOutput("");
                    setRefinement("");
                    setActiveIndex(1);
                  }}
                  disabled={isLoading}
                >
                  Build on this →
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Moodboard: full output + single Envision board */}
      {isMoodboard && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Moodboard</p>
              <CopyButton text={output} />
            </div>
            <Markdown content={output} />
            <div className="mt-6 pt-4 border-t border-border flex gap-3 items-center flex-wrap">
              <Button
                variant="outline"
                onClick={() => genImage("moodboard", buildMoodboardImagePrompt(output), "landscape_4_3")}
                disabled={!!imageLoading["moodboard"]}
              >
                {imageLoading["moodboard"]
                  ? <span className="inline-flex items-center gap-2"><Spinner />Envisioning…</span>
                  : images["moodboard"] ? "Re-envision →" : "Envision this board →"}
              </Button>
              <ApproveBar stage={activeStage} onApprove={approve} isLast={activeIndex === STAGES.length - 1} />
            </div>
            <ImageCard url={images["moodboard"]} alt="Moodboard" loading={imageLoading["moodboard"]} />
          </Card>
        </div>
      )}

      {/* Storyboard: frames with image gen */}
      {storyFrames && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Storyboard</p>
            <CopyButton text={output} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {storyFrames.map((frame, i) => {
              const key = `frame-${i}`;
              return (
                <Card key={i}>
                  <p className="text-xs font-semibold text-primary mb-2">{frame.label}</p>
                  <Markdown content={output.split(/(?=#+\s*Frame\s*\d+)/i)[i + 1] ?? frame.visual} />
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      onClick={() => genImage(key, frame.visual.slice(0, 400), "landscape_16_9")}
                      disabled={!!imageLoading[key]}
                    >
                      {imageLoading[key] ? <span className="inline-flex items-center gap-2"><Spinner />Generating…</span> : "Generate Frame →"}
                    </Button>
                    <ImageCard url={images[key]} alt={frame.label} loading={imageLoading[key]} />
                  </div>
                </Card>
              );
            })}
          </div>
          <ApproveBar stage={activeStage} onApprove={approve} isLast={activeIndex === STAGES.length - 1} />
        </div>
      )}

      {/* Default output for Script / Execution Round / Final (and Idea fallback) */}
      {output && !ideaConcepts?.length && !isMoodboard && !storyFrames && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{activeStage}</h2>
            <CopyButton text={output} />
          </div>
          <Markdown content={output} />
          {activeIndex < STAGES.length - 1 && (
            <div className="mt-6 pt-4 border-t border-border">
              <ApproveBar stage={activeStage} onApprove={approve} isLast={false} />
            </div>
          )}
        </Card>
      )}

      {/* Single-concept Idea fallback also needs approve button */}
      {ideaConcepts?.length === 1 && output && (
        <div className="mt-4">
          <ApproveBar stage={activeStage} onApprove={approve} isLast={false} />
        </div>
      )}
    </ModeShell>
  );
}

function ApproveBar({ stage, onApprove, isLast }: { stage: Stage; onApprove: () => void; isLast: boolean }) {
  const next = STAGES[STAGES.indexOf(stage) + 1];
  if (isLast) return null;
  return (
    <div className="flex gap-3 items-center">
      <Button onClick={onApprove}>
        Approved — build {next} →
      </Button>
    </div>
  );
}
