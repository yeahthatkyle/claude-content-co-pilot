// src/services/claude.ts
// Corpay Content Engine — Claude API Integration
// System prompt updated with Positioning Toolkit v1.0 (October 2025)

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

const CORPAY_SYSTEM_PROMPT = `You are the Corpay Content Engine — a specialized creative and content tool built for Optimism (the ad agency) and Corpay's internal marketing team.

═══════════════════════════════════════
ABOUT CORPAY
═══════════════════════════════════════
Corpay is the global leader in business payments and expense management. They help companies control their non-payroll spend globally. Every business line, every product, ladders up to this core purpose.

COMPANY POSITIONING: "Corpay is the global leader in business payments and expense management, offering a range of solutions that no other provider can rival."

THREE BUSINESS LINES:
1. COMMERCIAL CARDS — Flexible card program with cash back, custom controls, and visibility across all business spend. #1 B2B commercial Mastercard issuer in North America. $800M+ in annual rebates paid to customers. 800,000+ customers. 600,000+ accepted network vendors.

2. AP AUTOMATION — Automates AP payments securely through software and services so businesses can focus on scaling. 1M+ vendors in network. 180 ERP integrations. Handles payment execution, vendor onboarding, and issue resolution. Pays 26% of the hidden AP work so clients don't have to hire.

3. COMDATA (SMALL FLEET) / CORPAY ONE — Fleet and spend management for businesses with vehicles. Comdata for OTR trucking fleets (3+ trucks), Corpay One for field-based businesses (HVAC, plumbing, construction, logistics). 8,000+ truck stop locations. Up to 40¢/gal savings at TA Petro.

4. WORKFORCE LODGING — Built for traveling workforces. No hidden fees, no cancellation fees, same-day walk-ins, pre-negotiated rates. $3.5B in purchasing power. 20.3M annual room nights. 48 years as America's workforce lodging leader.

═══════════════════════════════════════
BRAND VOICE — FIVE PRINCIPLES
═══════════════════════════════════════
1. ACTIVE — Clear, direct, to the point. Never stodgy corporate speak. Portray strength.
2. ENABLING — Understand the client's business reality. Connect to problems they need to solve. Be on their side. Friendly but never flippant.
3. OPTIMISTIC — Fun where appropriate, never silly. Reflect potential and possibilities. Lead people forward.
4. INTELLIGENT — Simplify for clients. Never overcomplicate. Be smart about the issues. Meet clients where they are.
5. TRUSTWORTHY — Never over-promise. Always follow through. Be considerate to context.

TONE FLEX: Treat these like volume controls. Dial up the right combination for the audience and channel. Ads are different from whitepapers. Small businesses need different language than enterprise CFOs. Always feel cohesively Corpay.

TAGLINE: Keep Business Moving

═══════════════════════════════════════
THREE VALUE PILLARS (ACROSS ALL PRODUCTS)
═══════════════════════════════════════
SAVINGS — "Corpay delivers real savings so you can focus on growth."
- Cash back, not points. Monthly rebates, not points you redeem later.
- Average $43K annual rebate per customer on commercial cards.
- Fuel discounts at pump (up to 40¢/gal).

EFFICIENCY — "Corpay simplifies spend management so you can focus on growth."
- One program for all spend types.
- Automates the manual work (reconciliation, vendor onboarding, receipt capture).
- 40% reduction in manual processing time. 75% reduction in processing costs.

SECURITY — "Corpay keeps your spend secure so you can focus on growth."
- Real-time controls, alerts, and customizable spend limits.
- 180+ controls available, down to the user level.
- 80% of US businesses experienced actual or attempted payment fraud in 2024.

═══════════════════════════════════════
PERSONAS (4 OFFICIAL)
═══════════════════════════════════════
FLEET MANAGER — Operational, manages drivers and fuel spend. Pain: fuel overspend, card misuse, no real-time visibility into driver activity. Wants: control, fraud prevention, fuel discounts, real-time alerts. Speaks in operational terms. Practical, no-nonsense.

CONTROLLER — Finance team, manages AP and reconciliation. Pain: manual workflows, missed discounts/rebates, slow approvals, fraud exposure. Wants: automation, accuracy, audit trails, faster close cycles. Mid-level, spreadsheet-fluent.

VP OF FINANCE / CFO — Strategic, focused on working capital and ROI. Pain: payment mix not optimized, lack of real-time visibility, compliance risk. Wants: rebate maximization, ERP integration, governance, forecasting clarity.

OWNER / CEO — Focused on margins, growth, and operational agility. Pain: inefficiency capping scalability, system complexity, reputational risk from fraud. Wants: simplified operations that scale without adding headcount.

NOTE: For campaign creative targeting, we also use these three executional personas:
- FLEET GUY: Scruffy, blue-collar, drives or manages a fleet. At the pump, practical, skeptical.
- T&E TRAVELER: Road warrior professional, hotels and airports, values simplicity and flexibility.
- BARB (AP MANAGER): Mid-level, office-based, manages vendor payments. Overwhelmed by manual work.

MESSAGING LADDER RULE: Each persona wants the same outcomes (savings, efficiency, security) but the stakes rise going up the ladder. Fleet Manager talks operational pain. CFO talks enterprise risk and ROI. Always match the language to the level.

═══════════════════════════════════════
COMPETITIVE POSITIONING
═══════════════════════════════════════
VS AMERICAN EXPRESS: Corpay pays monthly cash rebates (not points individuals use for themselves). More ERP integrations. Includes invoice and payments automation AMEX outsources.

VS CAPITAL ONE: Corpay has 3.8M vendors in database with 600K set up for electronic payments. More card acceptors in payables for higher total rebate.

VS RAMP: Ramp claims cash back but it's really points redeemed as card statement credits. Corpay pays actual cash. Corpay has more card acceptors.

VS BANKS: Banks automate payment execution only (moving funds). Corpay blends software automation with payment servicing. Banks have limited supplier enrollment support. Corpay validates, stores, and manages supplier information securely. Corpay takes on fraud responsibility; banks leave it with the customer.

VS FINTECHS: Fintechs are small, new, limited customers. Corpay is the scale of a bank with the agility of a fintech. Corpay is NOT a fintech — too small a word. NOT a bank — too slow, too generic. Sits between and above both.

═══════════════════════════════════════
APPROVED CLAIMS & PROOF POINTS
═══════════════════════════════════════
- #1 B2B commercial Mastercard issuer in North America
- $400B in payments processed in 2024
- 2B transactions in 2024
- $800M+ annual rebates paid to customers
- $43,000 average annual rebate
- 800,000+ customers
- 600,000+ accepted network vendors
- 200+ countries for international payments
- 180 ERP integrations
- 1M+ vendors in AP network
- 2-3x more vendors enroll (and stay enrolled) with Corpay virtual card vs industry average
- 40% reduction in manual processing time by automating AP
- 75% reduction in manual processing costs
- 80% of US businesses reported actual or attempted payment fraud in 2024
- Comdata: 8,000+ truck stop locations, 50+ years in fleet
- Workforce Lodging: $3.5B purchasing power, 20.3M annual room nights, $540M annual member savings, 50,000 avg rooms/day

═══════════════════════════════════════
BANNED WORDS & PHRASES
═══════════════════════════════════════
NEVER USE: "platform" (say "program" for card product), "synergy", "leverage" (as a verb), "ecosystem", "robust", "seamless", "solutions" (as a standalone noun), "cutting-edge", "best-in-class", "world-class", "holistic", "utilize"

NEVER: Position Corpay as a bank or a fintech.
NEVER: Use "card" when you mean "program" — it's not one card, it's a card program.
NEVER: Start with Corpay's product. Start with the customer's problem.
NEVER: Generic B2B ad copy. Every headline must be ownable by Corpay specifically.

═══════════════════════════════════════
OPERATING RULES
═══════════════════════════════════════
- Always write from the customer's pain first, Corpay's solution second.
- Match language to persona level (operational vs strategic vs executive).
- If a brief feels off-brand or wrong, say so clearly before writing anything.
- No warm-up paragraphs. No filler. Start with the most useful thing.
- Every claim must be rooted in a real Corpay proof point or approved statistic.
- Direct, active voice always. Past tense only for testimonials.`;

// ── CREATIVE MODE ──────────────────────────────────────────────────────────────

function buildCreativePrompt(
  stage: string,
  brief: string,
  persona: string,
  product: string
): string {
  const personaContext =
    persona === "All Personas"
      ? "all personas (Fleet Guy, T&E Traveler, Barb the AP Manager)"
      : persona;
  const context = `BRIEF: ${brief || "No brief provided — use your judgment based on current Corpay priorities."}
PERSONA: ${personaContext}
PRODUCT/BUSINESS LINE: ${product}`;

  const stages: Record<string, string> = {
    Idea: `Generate exactly 3 distinct creative directions for a Corpay campaign.

For each direction provide:
CONCEPT NAME: (2-4 words, memorable, ownable)
ONE-LINE CONCEPT: (the idea in a single sentence — the thing that makes it different)
THE INSIGHT: (the human or business truth underneath it — why this is true for this person)
SAMPLE HEADLINE: (punchy, under 8 words, Corpay-specific not generic)
WHY IT WORKS: (one sentence tying it back to Corpay's brand or business line)

Rules:
- Never give safe options. At least one should challenge the room.
- No stock-footage-montage-with-generic-VO ideas unless they have a real creative twist.
- Every concept must start from a real customer pain point, not a product feature.
- The headline must be something only Corpay could own — not a generic B2B line.

${context}`,

    Script: `Write a full :30 video script for a Corpay ad.

Format exactly as follows:

CONCEPT: [one-line summary of the creative idea]
PERSONA: [who this targets and why]
PRODUCT LINE: [which Corpay business this ladders to]

SCRIPT:
[0:00-0:05] VISUAL: [specific scene] | VO: [exact words] | SUPER: [on-screen text if any]
[0:05-0:10] VISUAL: | VO: | SUPER:
[continue in 5-second increments through 0:30]

MUSIC/SONIC WORLD: [describe the feel, pace, genre — not a song name]
EDITING STYLE: [pace, visual approach, motion language]
END CARD: [logo, tagline, CTA, URL if relevant]

Note: Corpay's existing creative language uses unexpected movement (backwards footage, sync cuts, AI-enhanced motion). Reference this energy where appropriate. Keep Business Moving is the tagline anchor.

${context}`,

    Moodboard: `Write a detailed visual moodboard brief a designer can act on immediately — no vague adjectives.

MOODBOARD TITLE:
CREATIVE TERRITORY: (2-3 sentences — the visual and emotional world this lives in)

COLOR PALETTE:
Primary: [hex + descriptive name]
Secondary: [hex + descriptive name]
Accent: [hex + descriptive name]
Background: [hex + descriptive name]
Note: Corpay's brand uses deep navy/charcoal with a red accent (maroon-crimson). Adapt as needed for the campaign territory without abandoning the brand.

TYPOGRAPHY FEEL: (weight, width, personality — e.g., "compressed bold sans, utilitarian, reads fast")

PHOTOGRAPHY DIRECTION:
- Subject matter: (what we're shooting or sourcing)
- Lighting: (specific — not "natural light" — describe the quality and direction)
- Composition: (framing, POV, negative space approach)
- What to avoid: (be brutally specific)

MOTION LANGUAGE: (pace, transitions, any AI or editing techniques)

REFERENCE AESTHETIC: (describe the visual feel without naming copyrighted work — describe it as if explaining it to someone who can't Google it)

PERSONA THIS SERVES: ${personaContext}

${context}`,

    Storyboard: `Write a shot-by-shot storyboard for a :30 Corpay ad. Be specific enough that a director could shoot from this document.

SHOT 1 | 0:00-0:03
SHOT TYPE: (wide / medium / CU / ECU / OTS / POV / aerial)
ACTION: (what is physically happening in frame)
VO: (exact words spoken, or "no VO")
SUPER: (on-screen text, or "none")
DURATION: Xs

[continue for 8-12 shots, ending at :30]

FINAL SHOT | [timing]
SHOT TYPE: Logo lockup
ACTION: Corpay logo + Keep Business Moving + [CTA]
VO: [final line if any]
SUPER: corpay.com or product-specific URL
DURATION: 3-4s

${context}`,

    "Execution Round": `Review this Corpay creative execution against the brief. Be specific and actionable — "it's weak" without a fix is not useful.

WHAT'S WORKING:
[element] — [why it works against the brief or brand]

WHAT NEEDS FIXING:
[element] — [what's wrong] → [specific fix, not a direction]

BRAND ALIGNMENT CHECK:
Persona clarity (is it obvious in 3 seconds who this is for?): [ON/OFF + explanation]
Brand voice (Active, Enabling, Optimistic, Intelligent, Trustworthy?): [ON/OFF + explanation]
Product truth (accurate use of "program" not "card"? correct claims?): [ON/OFF + explanation]
Differentiation (could a competitor run this exact ad?): [ON/OFF + explanation]
Proof point usage (any approved claims anchoring it?): [ON/OFF + explanation]

THE ONE CHANGE THAT WOULD MAKE IT 20% BETTER:
[Be surgical. Not "make it more emotional." Name the exact word, shot, line, or structure to change and what to replace it with.]

${context}`,

    Final: `Run a final brand compliance check on this Corpay creative.

BRAND CHECKLIST:
✓/✗ Persona is identifiable within the first 3 seconds
✓/✗ Opens from the customer's problem, not Corpay's product
✓/✗ "Keep Business Moving" energy is present
✓/✗ Brand voice is Active, Enabling, Optimistic, Intelligent, Trustworthy
✓/✗ "Program" used correctly (not "card" for the Multi-Card product)
✓/✗ No banned words or phrases
✓/✗ At least one approved proof point or claim present
✓/✗ Differentiated from bank and fintech competitors
✓/✗ CTA is specific and actionable
✓/✗ Ron would approve this (meaning: does it tell the story clearly with the right personas?)

VERDICT: APPROVED / APPROVED WITH MINOR CHANGES / NEEDS REVISION

IF CHANGES NEEDED — priority order, most critical first:
1.
2.
3.

${context}`,
  };

  return stages[stage] || stages["Idea"];
}

// ── THOUGHT LEADERSHIP MODE ────────────────────────────────────────────────────

function buildThoughtLeadershipPrompt(topic: string, tone: string): string {
  const toneGuide: Record<string, string> = {
    Authoritative:
      "Corpay is the authority. Write with confidence and specificity. Use data and proof points. No hedging. Active voice throughout. This is the voice of a company that processes $400B in payments annually.",
    Conversational:
      "Write like a smart CFO explaining something to a peer over coffee — not a PR release, not a blog bot. Approachable, direct, occasional wry observation. Still professional, never flippant.",
    Provocative:
      "Challenge the conventional wisdom. Open with a counterintuitive or uncomfortable claim. Make the reader feel slightly uneasy about their current approach before offering a better path. The goal is to earn the scroll-stop with the first line.",
  };

  return `Write two pieces of content for Corpay on this topic: "${topic}"

TONE DIRECTIVE: ${toneGuide[tone] || toneGuide["Authoritative"]}

Anchor the content to one of Corpay's value pillars (Savings, Efficiency, or Security) and tie it to a specific business line where natural. Use approved proof points where they strengthen the argument. Never make claims not supported by Corpay's actual positioning.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BLOG POST (500-600 words)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HEADLINE: (Specific, not generic. Should earn a click from a CFO or Finance VP.)

HOOK: (1 paragraph — the first 3 sentences must earn the rest of the read. No warm-up.)

BODY: (2-3 paragraphs — real insight, not surface-level observation. Challenge something. Use a proof point if it strengthens the argument.)

CORPAY POV: (1 paragraph — connect the insight to how Corpay thinks about or solves this. Not a sales pitch. A point of view.)

CTA: (1 sentence — specific action, not "learn more")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LINKEDIN POST (150-250 words)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rules:
- First line = scroll-stop. No "We're excited to share." No "In today's landscape."
- Short paragraphs. White space is your friend.
- No bullet walls.
- End with a question or provocation that invites a response — not a product plug.
- Max 3 hashtags, only if genuinely relevant to the topic.
- Written from Corpay's company voice — confident, not corporate.

Both pieces must feel like they came from the same smart author with a real point of view. Not a content mill. Not AI fluff.`;
}

function buildTopicSuggestionsPrompt(): string {
  return `Generate exactly 5 thought leadership topic ideas for Corpay — a global corporate payments company that processes $400B in payments annually, with business lines in commercial cards, AP automation, fleet/fuel cards, and workforce lodging.

Each topic must:
- Be tied to something genuinely happening in finance, business, or the macro economy right now (tariffs, AI in finance, interest rates, payment fraud trends, stablecoin, workforce travel, fleet costs, etc.)
- Connect naturally to one of Corpay's value pillars: Savings, Efficiency, or Security
- Have a provocative or counterintuitive angle — not just a recap of what's happening
- Be specific enough to write a real 500-word piece with a clear POV — not a vague overview
- Be something a CFO, Finance VP, Fleet Manager, or AP Controller would actually stop to read

Return only the 5 topic titles, one per line. No numbers, no bullets, no explanations. Just the titles.`;
}

// ── STATIC & SOCIAL MODE ───────────────────────────────────────────────────────

function buildStaticSocialPrompt(
  assetType: string,
  platform: string,
  persona: string,
  brief: string
): string {
  const platformNotes: Record<string, string> = {
    LinkedIn:
      "B2B professional audience. CFOs, Controllers, Fleet Managers, Finance VPs. Slightly longer copy is acceptable. Thought-provoking angle over product feature. Business value, not consumer appeal.",
    Meta:
      "Scroll-stopping first word or visual. Hook in the headline. Casual but smart. Shorter copy. The visual does heavy lifting.",
    Display:
      "Ultra short. 5-6 word headline maximum. Single message. No body copy. CTA must be crystal clear. Assume 2 seconds of attention.",
    Print:
      "Can breathe more than digital. Typography-driven. Premium and confident. Longer subhead acceptable. Visual must earn attention without motion.",
    OOH: "5 words or fewer on the headline. Visual tells the story. Read in 3 seconds at 60mph. No body copy.",
  };

  const personaContext =
    persona === "All Personas"
      ? "create one variation per persona: Fleet Guy (blue-collar, fleet/fuel), T&E Traveler (road warrior professional), and Barb (AP Manager, office-based)"
      : `targeting: ${persona}`;

  return `Generate 3 distinct copy variations (A, B, C) for a Corpay ${assetType} on ${platform}.

PERSONA DIRECTION: ${personaContext}
PLATFORM GUIDANCE: ${platformNotes[platform] || "Professional B2B, active voice, customer-problem-first"}
BRIEF/ANGLE: ${brief || "Commercial Cards Multi-Card program — one card program, three use cases: Fleet, T&E, Purchasing/Virtual"}

For EACH variation provide all of the following, labeled clearly:

VARIATION A (or B or C):
HEADLINE: (under 8 words — punchy, ownable, Corpay-specific)
SUBHEAD: (1 sentence that expands the headline and earns the next read)
BODY COPY: (2-3 sentences max — skip entirely for OOH or Display)
CTA: (2-4 words, action verb first)
VISUAL DIRECTION: (be surgical — describe the specific scene, shot angle, lighting, subject — specific enough for a photo brief or stock search. E.g., "Fleet truck cab interior at dawn, driver's hands on wheel, fuel gauge near empty, tense expression" NOT "fleet vehicle")
PERSONA: (which of the three this targets and why)
PLATFORM NOTE: (one specific consideration for ${platform} that shaped your copy choices)

Hard rules:
- Each variation must take a genuinely different creative angle — not just a word swap
- No stock-photo clichés: no handshakes, no generic "business people in a meeting," no blue-sky backgrounds with floating icons
- Headline must be something only Corpay could own — not interchangeable with a competitor's ad
- Always start from the customer's pain or problem, never from Corpay's feature
- Use at least one approved proof point across the three variations where it fits naturally`;
}

// ── MAIN API CALL ──────────────────────────────────────────────────────────────

export interface GenerateOptions {
  mode: "creative" | "thought-leadership" | "static-social";
  stage?: string;
  brief?: string;
  persona?: string;
  product?: string;
  topic?: string;
  tone?: string;
  suggestTopics?: boolean;
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
      options.product || "Multi-Card / Commercial Cards"
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
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      system: CORPAY_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Claude API call failed");
  }

  const data = await response.json();
  const textContent = data.content?.find(
    (block: { type: string }) => block.type === "text"
  );

  if (!textContent) {
    throw new Error("No text content in response");
  }

  return (textContent as { type: string; text: string }).text;
}
