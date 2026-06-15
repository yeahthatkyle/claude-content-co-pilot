// Client-side wrapper for Claude generation.
//
// The actual fetch to https://api.anthropic.com/v1/messages happens in
// src/lib/generate.functions.ts (server function) so the ANTHROPIC_API_KEY
// stays on the server. Calling Anthropic directly from the browser would
// expose the key to every visitor. This module is the single entry point
// the UI uses for any Claude call.

import { runGeneration } from "@/lib/generate.functions";

export type GenerateInput = {
  mode: "creative" | "thought-leadership" | "static-social";
  stage?: string;
  persona?: string;
  product?: string;
  brief?: string;
  topic?: string;
  tone?: string;
  assetType?: string;
  platform?: string;
  action?: "generate" | "suggest-topics";
};

export type GenerateResult = {
  body: string;
  topics: string[];
};

/**
 * Generate content via Claude (model: claude-sonnet-4-5-20250929).
 * Throws on network / API errors — callers should catch and surface in the UI.
 */
export async function generateContent(input: GenerateInput): Promise<GenerateResult> {
  const res = await runGeneration({
    data: { action: "generate", ...input },
  });
  return { body: res.body ?? "", topics: res.topics ?? [] };
}
