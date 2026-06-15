// src/services/claude.ts
// Claude API integration for Corpay Content Engine

const CLAUDE_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content`;
const MODEL = "claude-sonnet-4-6";

const CORPAY_SYSTEM_PROMPT = `You are the Corpay Content Engine — a specialized creative and content tool built for Optimism (the agency) and Corpay's internal marketing team.

ABOUT CORPAY:
Corpay is a global corporate payments company. They help businesses control their non-payroll spend through three lines of business:
1. Commercial Cards — fleet cards, T&E cards, purchasing/virtual cards (the Multi-Card program)
2. Accounts Payable Automation — software to automate how companies pay vendors
3. International Payments — cross-border payments with better speed, controls, and currency management than banks

Their key differentiator: they do what banks do, but faster, smarter, and with more control. They are NOT a fintech (too small a word) and NOT a bank (too slow, too generic). They sit above both and disrupt both.

BRAND VOICE:
- Tagline: Keep Business Moving
- Tone: Confident, not arrogant. Direct, not cold. Modern, not trendy. Human, not corporate.
- They are a disruptor and innovator in corporate payments
- They use AI, stablecoin rails, and blockchain — they are firmly in the new world

BANNED WORDS/PHRASES: "platform" (use "program" for the card product), "synergy", "leverage", "ecosystem", "robust", "seamless", "solutions", "cutting-edge"

THREE CUSTOMER PERSONAS:
1. FLEET GUY — blue collar, manages fleet or fuel spend, values control, savings at the pump, fraud prevention. Scruffy, practical, no-nonsense.
2. T&E TRAVELER — professional road warrior, values flexibility and expense simplicity. Often checking into a hotel, booking flights, entertaining clients.
3. BARB (AP MANAGER) — mid-level, office-based, manages vendor payments and bill pay. Values accuracy, automation, and not having to chase down receipts.

MULTI-CARD POSITIONING:
- It's not about the card, it's about the program behind the card
- One card program with three distinct use cases: Fleet, T&E, Purchasing/Virtual
- Each persona has a different instantiation of the same card
- BASF principle: "We don't make the snowboard, we make the snowboard faster" — Corpay doesn't just issue a card, they power the whole spend program
- Ron's feedback: focus on the users, not the card. "I'm a T&E user" not "I'm a T&E card"

GLOBAL RULES:
- Always write from the customer's problem first, Corpay's solution second
- Never position Corpay as a bank or a fintech
- If the brief feels off-brand, say so before proceeding
- No throat-clearing. No filler. Start with the most useful thing.`;

// ── CREATIVE MODE ──────────────────────────────────────────────────────────────

function buildCreativePrompt(
  stage: string,
  brief: string,
  persona: string,
  product: string
): string {
  const personaContext = persona === "All Personas" ? "all three personas (Fleet Guy, T&E Traveler, Barb the AP Manager)" : persona;
  const context = `BRIEF: ${brief || "No brief provided — use your best judgment based on current Corpay priorities."}\nPERSONA: ${personaContext}\nPRODUCT: ${product}`;

  const stages: Record<string, string> = {
    Idea: `Generate exactly 3 distinct creative directions for a Corpay campaign. 

For each direction provide:
- CONCEPT NAME (2-4 words, memorable)
- ONE-LINE CONCEPT (the idea in a single sentence)
- THE INSIGHT (the human truth underneath the idea)
- SAMPLE HEADLINE (punchy, under 8 words)
- WHY IT WORKS FOR CORPAY (one sentence tying it back to brand)

Rules: Never give safe options. At least one should make someone uncomfortable. No stock-footage-montage-with-VO-over-it ideas unless they have a genuine twist. Push.

${context}`,

    Script: `Write a full :30 video script for a Corpay ad based on the brief.

Format:
CONCEPT: [one-line summary]
PERSONA: [who this is for]

SCRIPT:
[0:00-0:05] VISUAL: [what we see] | VO: [what we hear] | SUPER: [text on screen if any]
[continue per 5-second increment through :30]

MUSIC/TONE NOTES: [describe the sonic world]
EDITING STYLE: [pace, feel, visual approach]
END CARD: [logo lockup, tagline, CTA]

${context}`,

    Moodboard: `Write a detailed visual moodboard brief that a designer can act on immediately.

Format:
MOODBOARD TITLE: 
OVERALL AESTHETIC: (2-3 sentences describing the visual world)

COLOR PALETTE:
- Primary: [hex + name]
- Secondary: [hex + name]  
- Accent: [hex + name]
- Background: [hex + name]

TYPOGRAPHY FEEL: (describe weight, personality, not specific font names)

PHOTOGRAPHY STYLE: (lighting, composition, subject matter, what to avoid)

MOTION/EDITING LANGUAGE: (if video — pace, transitions, effects)

REFERENCE AESTHETIC: (describe the look without naming copyrighted brands or campaigns)

WHAT TO AVOID: (be specific)

PERSONA THIS SERVES: ${personaContext}

${context}`,

    Storyboard: `Write a shot-by-shot storyboard breakdown for a :30 Corpay ad.

For each shot provide:
SHOT [#] | [TIMING]
- SHOT TYPE: (wide, medium, close-up, OTS, etc.)
- ACTION: (what's happening visually)
- VO: (voiceover line if any)
- SUPER: (text on screen if any)
- DURATION: (seconds)

Include 8-12 shots total. End with logo/tagline lockup shot.

${context}`,

    "Execution Round": `You are reviewing a piece of Corpay creative against the brief. Provide specific, actionable feedback.

Structure your review:
WHAT'S WORKING:
- [specific element] — [why it works]

WHAT NEEDS FIXING:
- [specific element] — [what's wrong] → [specific fix]

BRAND ALIGNMENT CHECK:
- Persona clarity: [on/off — explain]
- Brand voice: [on/off — explain]  
- Product truth: [on/off — explain]
- Differentiation: [on/off — explain]

ONE THING THAT WOULD MAKE IT 20% BETTER:
[Be specific. Not "make it more emotional." Say exactly what to change.]

${context}`,

    Final: `Run a final brand check on this Corpay creative execution.

FINAL CHECKLIST:
✓/✗ Persona is crystal clear within first 3 seconds
✓/✗ Brand voice is consistent throughout  
✓/✗ Product truth is accurate (especially Multi-Card program vs card language)
✓/✗ "Keep Business Moving" energy is present
✓/✗ Differentiation from banks/fintechs is clear
✓/✗ CTA is specific and actionable
✓/✗ No banned words or phrases used
✓/✗ Ron would approve this

VERDICT: [APPROVED / APPROVED WITH MINOR CHANGES / NEEDS REVISION]

IF CHANGES NEEDED: List them in priority order, most critical first.

${context}`,
  };

  return stages[stage] || stages["Idea"];
}

// ── THOUGHT LEADERSHIP MODE ────────────────────────────────────────────────────

function buildThoughtLeadershipPrompt(
  topic: string,
  tone: string
): string {
  const toneGuide: Record<string, string> = {
    Authoritative: "Write with confidence and expertise. Corpay is the authority here. Use data and specifics where possible. No hedging.",
    Conversational: "Write like a smart friend in finance, not a corporate communications team. Approachable, direct, occasional dry wit.",
    Provocative: "Challenge the status quo. Start with a counterintuitive claim. Make the reader feel slightly uncomfortable with their current approach.",
  };

  return `Write two pieces of content for Corpay on this topic: "${topic}"

TONE: ${toneGuide[tone] || toneGuide["Authoritative"]}

─────────────────────────────
BLOG POST (500-600 words)
─────────────────────────────
Structure:
- HEADLINE: (compelling, specific, not generic)
- HOOK: (1 paragraph — earn the read in the first 3 sentences)
- INSIGHT SECTION: (2-3 paragraphs — the meat. Real insight, not obvious stuff.)
- CORPAY POV: (1 paragraph — tie it back to how Corpay solves this without being a sales pitch)
- CTA: (1 sentence — what should the reader do next?)

─────────────────────────────
LINKEDIN POST (150-250 words)
─────────────────────────────
Rules:
- First line must earn the scroll-stop. No "I'm excited to share" openers.
- Short punchy paragraphs. No bullet walls.
- End with a question or provocation, not a sales pitch.
- Max 3 hashtags, only if genuinely relevant.
- Written from Corpay's company voice, not an individual's.

Both pieces should feel like they came from the same author with a strong POV. Tie the topic to one of Corpay's three business lines where natural — don't force it.`;
}

function buildTopicSuggestionsPrompt(): string {
  return `Generate exactly 5 thought leadership topic ideas for Corpay, a global corporate payments company.

Each topic should:
- Be timely and tied to something happening in finance, business, or the economy right now
- Connect naturally to one of Corpay's three business lines: commercial cards, AP automation, or international payments
- Have a provocative or counterintuitive angle — not just "here's what's happening"
- Be specific enough to write a real 500-word piece, not a generic overview

Format: Return only the 5 topic titles, one per line, no numbers or bullets. Just the titles.`;
}

// ── STATIC & SOCIAL MODE ───────────────────────────────────────────────────────

function buildStaticSocialPrompt(
  assetType: string,
  platform: string,
  persona: string,
  brief: string
): string {
  const platformNotes: Record<string, string> = {
    LinkedIn: "Professional tone, B2B audience, slightly longer copy acceptable, thought-provoking angle",
    Meta: "Hook in the first word, casual but smart, scroll-stopping visual direction",
    Display: "Ultra short copy, 5 words max headline, single clear message",
    Print: "Can breathe more, typography-driven, premium feel",
  };

  const personaContext = persona === "All Personas" ? "write one variation per persona (Fleet Guy, T&E Traveler, Barb)" : `targeting: ${persona}`;

  return `Generate 3 copy variations (A, B, C) for a Corpay ${assetType} on ${platform}.

PERSONA: ${personaContext}
PLATFORM GUIDANCE: ${platformNotes[platform] || "Professional B2B tone"}
BRIEF/ANGLE: ${brief || "Focus on the Multi-Card program — one card program, three use cases"}

For EACH variation (A, B, C) provide:

VARIATION [A/B/C]:
HEADLINE: (under 8 words, punchy, ownable)
SUBHEAD: (1 sentence, expands the headline)
BODY COPY: (2-3 sentences max — skip if it's OOH or display)
CTA: (2-4 words)
VISUAL DIRECTION: (describe the image or scene — specific enough for a designer to brief a photographer or find stock)
PERSONA: (which of the three this targets)
PLATFORM NOTE: (any specific consideration for ${platform})

Rules:
- Each variation should take a genuinely different angle, not just swap a word
- No stock-photo clichés (no handshakes, no generic "busy office" scenes)
- Visual direction should be specific — "fleet truck pulling into a Love's truck stop at 5am, dashboard POV shot" not "fleet vehicle"
- Headline must be ownable by Corpay specifically, not generic B2B copy`;
}

// ── MAIN API CALL ──────────────────────────────────────────────────────────────

export interface GenerateOptions {
  mode: "creative" | "thought-leadership" | "static-social";
  // Creative
  stage?: string;
  brief?: string;
  persona?: string;
  product?: string;
  // Thought Leadership
  topic?: string;
  tone?: string;
  suggestTopics?: boolean;
  // Static & Social
  assetType?: string;
  platform?: string;
}

export async function generateContent(options: GenerateOptions): Promise<string> {
  let userPrompt = "";

  if (options.mode === "creative") {
    userPrompt = buildCreativePrompt(
      options.stage || "Idea",
      options.brief || "",
      options.persona || "All Personas",
      options.product || "Multi-Card"
    );
  } else if (options.mode === "thought-leadership") {
    if (options.suggestTopics) {
      userPrompt = buildTopicSuggestionsPrompt();
    } else {
      userPrompt = buildThoughtLeadershipPrompt(
        options.topic || "",
        options.tone || "Authoritative"
      );
    }
  } else if (options.mode === "static-social") {
    userPrompt = buildStaticSocialPrompt(
      options.assetType || "Social Post",
      options.platform || "LinkedIn",
      options.persona || "All Personas",
      options.brief || ""
    );
  }

  const response = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system: CORPAY_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Claude API call failed");
  }

  const data = await response.json();
  const textContent = data.content?.find((block: { type: string }) => block.type === "text");
  
  if (!textContent) {
    throw new Error("No text content in response");
  }

  return (textContent as { type: string; text: string }).text;
}
