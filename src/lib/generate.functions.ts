import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MODEL = "claude-sonnet-4-5-20250929";

const Input = z.object({
  mode: z.enum(["creative", "thought-leadership", "static-social"]),
  stage: z.string().nullable().optional(),
  persona: z.string().nullable().optional(),
  product: z.string().nullable().optional(),
  brief: z.string().nullable().optional(),
  topic: z.string().nullable().optional(),
  tone: z.string().nullable().optional(),
  assetType: z.string().nullable().optional(),
  platform: z.string().nullable().optional(),
  action: z.enum(["generate", "suggest-topics"]).default("generate"),
});

async function callClaude(system: string, user: string, maxTokens = 3500) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Claude error (${resp.status}): ${t.slice(0, 400)}`);
  }
  const json = (await resp.json()) as { content: Array<{ type: string; text?: string }> };
  return json.content.filter((c) => c.type === "text").map((c) => c.text ?? "").join("\n").trim();
}

const BRAND_SYSTEM = `You are a senior creative working at Optimism, an ad agency, on the Corpay account.
Corpay is a global leader in B2B payments: Multi-Card (corporate cards), AP Automation, International Payments (FX/treasury), and the Corpay master brand.
Write sharp, credible, audience-aware marketing work. Concrete numbers and concrete buyer pain over fluff. No clichés, no "unlock", no "leverage", no em-dash overuse.
Audience personas:
- Fleet Guy: operations/fleet manager, cares about fuel cost control, driver compliance, downtime.
- T&E Traveler: frequent business traveler, cares about reimbursement speed, simple expense capture, points/perks.
- Barb (AP Manager): controller / AP lead, cares about invoice volume, fraud risk, close cycle, supplier relationships.
- All Personas: speak to the universal benefit across the buyer set.`;

export const runGeneration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    // Suggest topics
    if (data.action === "suggest-topics") {
      const out = await callClaude(
        BRAND_SYSTEM,
        `Suggest 5 fresh thought-leadership topics for Corpay relevant to today's B2B payments landscape. Return ONLY a JSON array of 5 short topic strings (each under 90 characters). No prose, no markdown, just the JSON array.`,
        600,
      );
      let topics: string[] = [];
      try {
        const m = out.match(/\[[\s\S]*\]/);
        topics = m ? (JSON.parse(m[0]) as string[]) : [];
      } catch {
        topics = out.split("\n").map((s) => s.replace(/^[-*\d.\s"]+|"$/g, "").trim()).filter(Boolean).slice(0, 5);
      }
      return { topics, body: "" };
    }

    let system = BRAND_SYSTEM;
    let user = "";

    if (data.mode === "creative") {
      const stageGuidance: Record<string, string> = {
        Idea: "Produce 3 distinct big-idea concepts. For each: a one-line concept, the insight it's built on, and a tagline.",
        Script: "Write a 30-second video script with VO, on-screen text, and scene direction. Include a hook in the first 3 seconds.",
        Moodboard: "Describe a moodboard in 6 visual references: tone, color, typography, photographic style, motion feel, sound design. Be specific.",
        Storyboard: "Write a 6-frame storyboard. For each frame: visual description, on-screen copy, VO, duration.",
        "Execution Round": "Produce final production-ready execution notes: hero film 30s + 15s cutdown + 6s bumper, plus 3 social cutdowns with platform specs.",
        Final: "Deliver the final polished asset write-up suitable for a client deck: concept, script, key frames, distribution plan, success metrics.",
      };
      const stage = data.stage ?? "Idea";
      user = `# Creative Brief — ${stage}
Persona: ${data.persona ?? "All Personas"}
Product: ${data.product ?? "Brand"}
Brief: ${data.brief ?? "(none)"}

Task: ${stageGuidance[stage] ?? stageGuidance.Idea}`;
      const body = await callClaude(system, user);
      return { body, topics: [] };
    }

    if (data.mode === "thought-leadership") {
      user = `# Thought Leadership
Topic: ${data.topic ?? ""}
Tone: ${data.tone ?? "Authoritative"}

Produce TWO outputs separated by a line containing exactly "---LINKEDIN---":
1) A 700-900 word blog post in Markdown. H1 title, sharp intro hook, 3-4 H2 sections, a takeaways list, and a closing CTA. Voice should be ${data.tone ?? "Authoritative"}.
2) A LinkedIn post (1200-1500 chars) optimized for skim: short lines, line breaks between thoughts, no hashtags spam (max 3 relevant tags at the end), distinct angle from the blog (not a summary).`;
      const body = await callClaude(system, user, 4000);
      return { body, topics: [] };
    }

    // static-social
    user = `# Static & Social — 3 Variations
Asset type: ${data.assetType ?? "Social Post"}
Platform: ${data.platform ?? "LinkedIn"}
Persona: ${data.persona ?? "All Personas"}
Brief: ${data.brief ?? "(none)"}

Produce exactly 3 variations labeled A, B, C. Each variation MUST use this exact format:

### Variation A
Headline: ...
Subhead: ...
Body Copy: ...
CTA: ...
Visual Direction: ...
Persona: ${data.persona ?? "All Personas"}
Platform Note: ...

Repeat for B and C. Make the 3 variations creatively distinct (different angle/insight each), not minor rewrites.`;
    const body = await callClaude(system, user);
    return { body, topics: [] };
  });

export const saveGeneration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({
      mode: z.string(),
      stage: z.string().nullable().optional(),
      persona: z.string().nullable().optional(),
      product: z.string().nullable().optional(),
      brief: z.string().nullable().optional(),
      output: z.string(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("generations").insert({
      mode: data.mode,
      stage: data.stage ?? null,
      persona: data.persona ?? null,
      product: data.product ?? null,
      brief: data.brief ?? null,
      output: data.output,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getGenerations = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({}).parse(input))
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("generations")
      .select("id, mode, stage, persona, product, brief, output, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return { generations: data ?? [] };
  });
