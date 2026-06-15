import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ModeShell, Button, Card, Label, Field, CopyButton, PillTabs, Spinner, Markdown } from "@/components/Shell";
import { runGeneration, saveGeneration } from "@/lib/generate.functions";

export const Route = createFileRoute("/thought-leadership")({
  head: () => ({ meta: [{ title: "Thought Leadership — Corpay Content Engine" }] }),
  component: TLPage,
});

const TONES = ["Authoritative", "Conversational", "Provocative"] as const;

function TLPage() {
  const generate = useServerFn(runGeneration);
  const save = useServerFn(saveGeneration);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Authoritative");
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [blog, setBlog] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSuggest = async () => {
    setSuggesting(true);
    setError(null);
    try {
      const res = await generate({
        data: { mode: "thought-leadership", action: "suggest-topics" },
      });
      setSuggestions(res.topics);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to suggest topics");
    } finally {
      setSuggesting(false);
    }
  };

  const onGenerate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setError(null);
    setBlog("");
    setLinkedin("");
    try {
      const res = await generate({
        data: { mode: "thought-leadership", topic, tone },
      });
      const body = res.body;
      const [blogPart, linkedinPart] = body.split("---LINKEDIN---");
      setBlog((blogPart ?? body).trim());
      setLinkedin((linkedinPart ?? "").trim());
      void save({
        data: { mode: "thought-leadership", brief: `${topic} | ${tone}`, output: body },
      }).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModeShell title="💡 Thought Leadership">
      <Card className="mb-6">
        <div className="space-y-6">
          <div>
            <Label>Topic</Label>
            <div className="flex gap-2">
              <Field
                placeholder="Enter a topic or click Suggest"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <Button variant="outline" onClick={onSuggest} disabled={suggesting}>
                {suggesting ? <span className="inline-flex items-center gap-1"><Spinner />Suggesting…</span> : "Suggest a Topic"}
              </Button>
            </div>
            {suggestions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setTopic(s); setSuggestions([]); }}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-surface text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label>Tone</Label>
            <PillTabs options={TONES} value={tone} onChange={setTone} />
          </div>
          <div>
            <Button onClick={onGenerate} disabled={isLoading || !topic.trim()}>
              {isLoading ? (<span className="inline-flex items-center gap-2"><Spinner />Generating…</span>) : "Generate"}
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="border-destructive/50 mb-6">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      {(blog || linkedin) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Blog Post</h2>
              <CopyButton text={blog} />
            </div>
            <Markdown content={blog} />
          </Card>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">LinkedIn Post</h2>
              <CopyButton text={linkedin} />
            </div>
            <Markdown content={linkedin} />
          </Card>
        </div>
      )}
    </ModeShell>
  );
}
