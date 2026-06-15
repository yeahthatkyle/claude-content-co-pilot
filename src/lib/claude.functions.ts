import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const GenerateInput = z.object({
  title: z.string().min(1),
  contentType: z.enum(["blog", "social", "email", "ad", "landing"]),
  prompt: z.string().min(1),
  brandVoiceId: z.string().uuid().nullable().optional(),
  assetIds: z.array(z.string().uuid()).default([]),
  researchIds: z.array(z.string().uuid()).default([]),
  save: z.boolean().default(true),
});

const MODEL = "claude-sonnet-4-5-20250929";

export const generateContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => GenerateInput.parse(input))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

    const { supabase, userId } = context;

    // Pull context from DB
    const [voice, assets, research] = await Promise.all([
      data.brandVoiceId
        ? supabase.from("brand_voice").select("*").eq("id", data.brandVoiceId).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      data.assetIds.length
        ? supabase.from("content_assets").select("title,category,body").in("id", data.assetIds)
        : Promise.resolve({ data: [], error: null }),
      data.researchIds.length
        ? supabase.from("research_notes").select("title,topic,summary,insights,source_url").in("id", data.researchIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const systemParts: string[] = [
      "You are an elite content strategist writing for Corpay, a leader in B2B payments, accounts payable automation, fuel/fleet cards, and corporate FX/treasury. Produce sharp, credible, conversion-aware marketing copy. Use concrete numbers and concrete buyer pain. Avoid generic AI fluff, em-dash overuse, and 'unlock' / 'leverage' platitudes.",
    ];

    const v = (voice as { data: { name?: string; tone?: string; audience?: string; do_list?: string; dont_list?: string; example_copy?: string; description?: string } | null }).data;
    if (v) {
      systemParts.push(
        `\n# Brand Voice: ${v.name ?? ""}\n${v.description ?? ""}\n\nTone: ${v.tone ?? ""}\nAudience: ${v.audience ?? ""}\n\nDO:\n${v.do_list ?? ""}\n\nDON'T:\n${v.dont_list ?? ""}\n\nExample copy:\n${v.example_copy ?? ""}`,
      );
    }

    const assetRows = (assets as { data: Array<{ title: string; category: string; body: string }> | null }).data ?? [];
    if (assetRows.length) {
      systemParts.push(
        "\n# Reference assets (use verbatim quotes, product names and positioning where relevant):\n" +
          assetRows.map((a) => `## ${a.title} (${a.category})\n${a.body}`).join("\n\n"),
      );
    }

    const researchRows = (research as { data: Array<{ title: string; topic: string | null; summary: string; insights: string | null; source_url: string | null }> | null }).data ?? [];
    if (researchRows.length) {
      systemParts.push(
        "\n# Research / market intel (cite naturally, do not fabricate):\n" +
          researchRows
            .map(
              (r) =>
                `## ${r.title}${r.topic ? ` — ${r.topic}` : ""}${r.source_url ? ` (${r.source_url})` : ""}\nSummary: ${r.summary}${r.insights ? `\nInsights: ${r.insights}` : ""}`,
            )
            .join("\n\n"),
      );
    }

    const typeGuidance: Record<string, string> = {
      blog: "Write a publish-ready blog post (700-1100 words) in Markdown. Include an H1 title, a strong intro hook (no clichés), 3-5 H2 sections, a takeaways list, and a CTA.",
      social: "Produce 3 distinct social posts: one for LinkedIn (long-form, 1200-1500 chars, line-broken for skim), one for X (under 280 chars, punchy), one for short-form (Reels/TikTok script, 80-120 words).",
      email: "Write a marketing email with: subject line (under 50 chars), preheader (under 90 chars), 150-220 word body, and a primary CTA. Use short paragraphs.",
      ad: "Produce 5 ad headline + body pairs suitable for LinkedIn/Google. Each headline under 50 chars. Bodies under 90 chars. End each with a CTA.",
      landing: "Write landing page copy in sections: Hero (H1 + subhead + CTA), 3 value props with H3s, social proof line, FAQ (4 Q/A), final CTA.",
    };

    const userPrompt = `# Task\nTitle: ${data.title}\nContent type: ${data.contentType}\n\n${typeGuidance[data.contentType]}\n\n# Brief\n${data.prompt}`;

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        system: systemParts.join("\n"),
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Anthropic error", resp.status, errText);
      throw new Error(`Claude API error (${resp.status}): ${errText.slice(0, 300)}`);
    }

    const json = (await resp.json()) as { content: Array<{ type: string; text?: string }> };
    const body = json.content
      .filter((c) => c.type === "text")
      .map((c) => c.text ?? "")
      .join("\n")
      .trim();

    if (data.save) {
      const { data: saved, error } = await supabase
        .from("generated_content")
        .insert({
          title: data.title,
          content_type: data.contentType,
          prompt: data.prompt,
          body,
          status: "draft",
          model: MODEL,
          brand_voice_id: data.brandVoiceId ?? null,
          asset_ids: data.assetIds,
          research_ids: data.researchIds,
          created_by: userId,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { id: saved.id, body };
    }

    return { id: null, body };
  });
