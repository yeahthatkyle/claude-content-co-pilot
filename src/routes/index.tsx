import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, BookOpen, Mic, Telescope } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Corpay Content Engine — AI-powered marketing for B2B payments" },
      {
        name: "description",
        content:
          "An internal AI content engine for the Corpay marketing team. Brand voice, research, asset library, and Claude-powered drafts in one place.",
      },
      { property: "og:title", content: "Corpay Content Engine" },
      {
        property: "og:description",
        content: "AI content engine for the Corpay marketing team, powered by Claude.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl tracking-tight">Corpay</span>
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">/ Content Engine</span>
          </div>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Sign in <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20">
        <p className="text-xs uppercase tracking-[0.22em] text-gold mb-6">
          Internal · Marketing · Powered by Claude
        </p>
        <h1 className="font-display text-6xl md:text-8xl leading-[0.95] tracking-tight max-w-4xl">
          The content engine
          <br />
          for <span className="italic">Corpay</span> marketing.
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
          Brand voice, market research, reusable assets and Claude-powered drafts — in one workspace.
          Stop pasting prompts. Start shipping on-brand copy.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Get started <ArrowRight className="size-4" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-3 text-sm font-medium hover:bg-accent"
          >
            How it works
          </a>
        </div>
      </section>

      <section id="features" className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-20 grid md:grid-cols-2 gap-x-12 gap-y-14">
          {[
            {
              icon: Sparkles,
              title: "Claude-powered generator",
              body:
                "Drafts blog posts, emails, social, ads and landing pages — grounded in your brand voice and asset library, not generic AI fluff.",
            },
            {
              icon: Mic,
              title: "Brand voice memory",
              body:
                "Define tone, audience, do/don't lists and example copy once. Every draft inherits them automatically.",
            },
            {
              icon: BookOpen,
              title: "Reusable asset library",
              body:
                "Store taglines, product descriptions, boilerplate and snippets. Pull them into any prompt as grounded context.",
            },
            {
              icon: Telescope,
              title: "Research & competitive intel",
              body:
                "Capture sources, summaries and insights. Reference them when generating so output stays factual and current.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-5">
              <div className="shrink-0 size-12 rounded-md bg-gold/20 text-gold-foreground flex items-center justify-center">
                <Icon className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-2xl">{title}</h3>
                <p className="mt-2 text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 text-xs text-muted-foreground flex justify-between">
          <span>© Corpay Marketing — Internal tool</span>
          <span>Powered by Claude</span>
        </div>
      </footer>
    </div>
  );
}
