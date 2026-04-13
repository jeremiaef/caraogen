import { AspectRatio, SlideType, Tone } from "./types";

const SLIDE_INSTRUCTIONS: Record<SlideType, string> = {
  hook: "Slide 1 (HOOK): Headline only. Max 6 words. Write an attention-grabbing question or bold statement that stops the scroll. No body text.",
  context: "Slide 2 (CONTEXT): Headline (max 6 words) + body (2 lines). Explain what was being built and why it mattered. Relatable and specific.",
  incident: "Slide 3 (THE INCIDENT): Headline (max 6 words) + body (3 lines). Tell the raw, real story moment — the bug, pivot, failure, or breakthrough. Make it visceral.",
  lesson: "Slide 4 (THE LESSON): Headline (max 6 words) + body (3 lines). State the key insight other builders can take away. Actionable wisdom.",
  how_to_apply: "Slide 5 (HOW TO APPLY): Headline (max 6 words) + body written as 2-3 short bullet-style steps. Practical and direct.",
  cta: "Slide 6 (CTA): Headline only. Max 6 words. Call to action to follow for more build stories. Inspiring, not salesy.",
};

const TONE_FRAMES: Record<Tone, string> = {
  visionary: "Write with an aspirational, forward-looking energy. Inspire the reader to see what's possible.",
  technical: "Write with precision and a code-adjacent sensibility. Assume a technical audience. Be specific and detailed.",
  sarcastic: "Write with self-aware wit and a sharp edge. Lean into irony and humor, but stay authentic.",
  actionable: "Write with directness and urgency. No fluff. Every word earns its place. Focus on steps and results.",
};

function buildCaptionPrompt(): string {
  return `After generating the slides, write a post caption with:
- A hook-style opener (1 sentence) that draws the reader in
- A brief 2-3 sentence summary of the build journey
- A closing line encouraging engagement
- 3-5 relevant hashtags formatted as a single line starting with #

Format the caption as:
{
  "text": "Full caption text here",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3"]
}`;
}

export function buildSystemPrompt(tone?: Tone): string {
  const toneInstruction = tone ? TONE_FRAMES[tone] : TONE_FRAMES.visionary;
  return (
    `You are an expert Build-in-Public content strategist for a tool called BIP Carousel Maker.\n` +
    `Your job is to transform a creator's raw build story into a viral-ready 6-slide carousel with a matching caption.\n\n` +
    `RULES:\n` +
    `- Output valid JSON only — no markdown, no explanation, no preamble\n` +
    `- All headlines: max 6 words, punchy, scroll-stopping\n` +
    `- Body text: 2-4 lines max, conversational, BIP-native tone (raw, relatable, honest)\n` +
    `- Never use generic advice — be specific to the story provided\n` +
    `- ${toneInstruction}\n\n` +
    `SLIDE STRUCTURE:\n` +
    Object.values(SLIDE_INSTRUCTIONS).join("\n\n") +
    `\n\n` +
    `RESPONSE FORMAT:\n` +
    `{\n` +
    `  "slides": [\n` +
    `    { "slide": 1, "type": "hook",        "headline": "...", "body": "" },\n` +
    `    { "slide": 2, "type": "context",    "headline": "...", "body": "..." },\n` +
    `    { "slide": 3, "type": "incident",   "headline": "...", "body": "..." },\n` +
    `    { "slide": 4, "type": "lesson",     "headline": "...", "body": "..." },\n` +
    `    { "slide": 5, "type": "how_to_apply", "headline": "...", "body": "..." },\n` +
    `    { "slide": 6, "type": "cta",        "headline": "...", "body": "" }\n` +
    `  ],\n` +
    `  "caption": {\n` +
    `    "text": "...",\n` +
    `    "hashtags": ["#..."]\n` +
    `  }\n` +
    `}\n\n` +
    buildCaptionPrompt()
  );
}

export function buildCarouselUserPrompt(
  story: string,
  tone?: Tone,
  aspectRatio?: AspectRatio
): string {
  const toneFraming = tone ? `Tone: ${tone}. ` : "";
  const ratioFraming = aspectRatio ? `Canvas: ${aspectRatio} (4:3 portrait, 1:1 square, or 9:16 vertical). ` : "";
  return `${toneFraming}${ratioFraming}Here is the creator's build story:\n\n${story}`;
}

export function buildRemixSlideUserPrompt(
  story: string,
  slideIndex: number,
  slideType: SlideType,
  tone?: Tone,
  aspectRatio?: AspectRatio
): string {
  const toneFraming = tone ? `Tone: ${tone}. ` : "";
  const ratioFraming = aspectRatio ? `Canvas: ${aspectRatio}. ` : "";
  const slideInstruction = SLIDE_INSTRUCTIONS[slideType];
  return (
    `${toneFraming}${ratioFraming}Regenerate Slide ${slideIndex} from the story below.\n\n` +
    `SLIDE TO REGENERATE: ${slideInstruction}\n\n` +
    `ORIGINAL STORY:\n${story}\n\n` +
    `Output valid JSON only:\n` +
    `{ "slide": ${slideIndex}, "type": "${slideType}", "headline": "...", "body": "..." }`
  );
}
