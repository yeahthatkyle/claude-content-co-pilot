import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Corpay Content Engine" },
      { name: "description", content: "Three creative modes — Creative, Thought Leadership, Static & Social." },
    ],
  }),
  component: Home,
});

const MODES = [
  {
    to: "/creative",
    emoji: "🎬",
    title: "Creative",
    desc: "Big-idea concepts, scripts, moodboards, storyboards, full executions.",
  },
  {
    to: "/thought-leadership",
    emoji: "💡",
    title: "Thought Leadership",
    desc: "Blog posts + matched LinkedIn posts. Topic suggestions on demand.",
  },
  {
    to: "/static-social",
    emoji: "📐",
    title: "Static & Social",
    desc: "Three A/B/C variations for social, digital, OOH, banners.",
  },
] as const;

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Choose a mode</p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">What are we making today?</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MODES.map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className="group rounded-xl border border-border bg-card p-8 hover:border-primary transition-colors min-h-[260px] flex flex-col"
            >
              <div className="text-4xl mb-6">{m.emoji}</div>
              <h2 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">
                {m.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
