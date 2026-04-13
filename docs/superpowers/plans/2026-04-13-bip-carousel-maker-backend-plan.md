# BIP Carousel Maker — Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Next.js API layer for BIP Carousel Maker — two endpoints (`/api/generate`, `/api/remix-slide`) wired to MiniMax Text-01, plus shared lib utilities. No database; no frontend changes.

**Architecture:** Next.js App Router with TypeScript. API routes as serverless functions. MiniMax called via OpenAI-compatible `/v1/chat/completions` endpoint. Prompt builder produces structured JSON from a single model call per request.

**Tech Stack:** Next.js, TypeScript, `MINIMAX_API_KEY` env var. No extra runtime dependencies beyond what Next.js ships with.

---

## File Map

```
app/
  api/
    generate/route.ts      # POST /api/generate
    remix-slide/route.ts   # POST /api/remix-slide
  layout.tsx               # Root layout (scaffolded)
  page.tsx                 # Root page (scaffolded)
lib/
  minimax.ts               # MiniMax API client
  promptBuilder.ts         # System + user prompt construction
  types.ts                # Shared TypeScript interfaces
.env.local.example        # MINIMAX_API_KEY=...
package.json              # (scaffolded by create-next-app)
tsconfig.json             # (scaffolded by create-next-app)
next.config.ts            # (scaffolded by create-next-app)
```

---

## Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.gitignore`

- [ ] **Step 1: Run create-next-app scaffold**

Run: `cd /workspaces/caraogen && npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --no-git --yes`
Expected: Next.js project scaffolded into workspace root. Files created: `package.json`, `tsconfig.json`, `next.config.ts`, `app/`, etc.

---

## Task 2: Create `lib/types.ts`

**Files:**
- Create: `lib/types.ts`

```typescript
export type SlideType =
  | "hook"
  | "context"
  | "incident"
  | "lesson"
  | "how_to_apply"
  | "cta";

export type Tone = "visionary" | "technical" | "sarcastic" | "actionable";

export type AspectRatio = "4:3" | "1:1" | "9:16";

export interface Slide {
  slide: number;       // 1-6
  type: SlideType;
  headline: string;
  body: string;        // empty string for hook and cta types
}

export interface Caption {
  text: string;
  hashtags: string[];
}

export interface GenerateResponse {
  slides: Slide[];
  caption: Caption;
}

export interface GenerateRequest {
  story: string;
  tone?: Tone;
  aspectRatio?: AspectRatio;
}

export interface RemixSlideRequest {
  story: string;
  slideIndex: number;   // 1-6
  slideType: SlideType;
  tone?: Tone;
  aspectRatio?: AspectRatio;
}
```

- [ ] **Step 1: Write `lib/types.ts`**

Create `lib/types.ts` with the interfaces above.

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts && git commit -m "feat: add shared TypeScript types"
```

---

## Task 3: Create `lib/minimax.ts`

**Files:**
- Create: `lib/minimax.ts`

```typescript
import { GenerateRequest, GenerateResponse, RemixSlideRequest, Slide } from "./types";

const MINIMAX_BASE_URL = "https://api.minimax.chat/v1";

function getMinimaxApiKey(): string {
  const key = process.env.MINIMAX_API_KEY;
  if (!key) throw new Error("MINIMAX_API_KEY environment variable is not set");
  return key;
}

interface MiniMaxMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface MiniMaxChoice {
  message: { role: string; content: string };
}

interface MiniMaxResponse {
  choices: MiniMaxChoice[];
  error?: { message: string };
}

async function chatCompletion(messages: MiniMaxMessage[]): Promise<string> {
  const apiKey = getMinimaxApiKey();
  const response = await fetch(`${MINIMAX_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "MiniMax-Text-01",
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`MiniMax API error ${response.status}: ${text}`);
  }

  const data: MiniMaxResponse = await response.json();

  if (data.error) {
    throw new Error(`MiniMax API error: ${data.error.message}`);
  }

  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error("MiniMax returned no content");
  return content;
}

function extractJSON<T>(raw: string): T {
  // Try to extract JSON from markdown code blocks first, then raw string
  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonString = codeBlockMatch ? codeBlockMatch[1].trim() : raw.trim();
  return JSON.parse(jsonString) as T;
}

export async function generateCarousel(req: GenerateRequest): Promise<GenerateResponse> {
  const { buildSystemPrompt, buildCarouselUserPrompt } = await import("./promptBuilder");
  const messages: MiniMaxMessage[] = [
    { role: "system", content: buildSystemPrompt(req.tone) },
    { role: "user", content: buildCarouselUserPrompt(req.story, req.tone, req.aspectRatio) },
  ];
  const raw = await chatCompletion(messages);
  return extractJSON<GenerateResponse>(raw);
}

export async function remixSlide(req: RemixSlideRequest): Promise<Slide> {
  const { buildSystemPrompt, buildRemixSlideUserPrompt } = await import("./promptBuilder");
  const messages: MiniMaxMessage[] = [
    { role: "system", content: buildSystemPrompt(req.tone) },
    { role: "user", content: buildRemixSlideUserPrompt(req.story, req.slideIndex, req.slideType, req.tone, req.aspectRatio) },
  ];
  const raw = await chatCompletion(messages);
  return extractJSON<Slide>(raw);
}
```

- [ ] **Step 1: Write `lib/minimax.ts`**

Create `lib/minimax.ts` with the code above.

- [ ] **Step 2: Commit**

```bash
git add lib/minimax.ts && git commit -m "feat: add MiniMax API client"
```

---

## Task 4: Create `lib/promptBuilder.ts`

**Files:**
- Create: `lib/promptBuilder.ts`

```typescript
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
```

- [ ] **Step 1: Write `lib/promptBuilder.ts`**

Create `lib/promptBuilder.ts` with the code above.

- [ ] **Step 2: Commit**

```bash
git add lib/promptBuilder.ts && git commit -m "feat: add prompt builder for carousel and remix"
```

---

## Task 5: Create `POST /api/generate`

**Files:**
- Create: `app/api/generate/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { generateCarousel } from "@/lib/minimax";
import { GenerateRequest, SlideType } from "@/lib/types";

const VALID_SLIDE_TYPES: SlideType[] = [
  "hook", "context", "incident", "lesson", "how_to_apply", "cta",
];

function isValidSlideType(type: string): type is SlideType {
  return VALID_SLIDE_TYPES.includes(type as SlideType);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateRequest;

    if (!body.story || typeof body.story !== "string" || body.story.trim().length === 0) {
      return NextResponse.json(
        { error: "story is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (body.tone !== undefined) {
      const validTones = ["visionary", "technical", "sarcastic", "actionable"];
      if (!validTones.includes(body.tone)) {
        return NextResponse.json(
          { error: `tone must be one of: ${validTones.join(", ")}` },
          { status: 400 }
        );
      }
    }

    if (body.aspectRatio !== undefined) {
      const validRatios = ["4:3", "1:1", "9:16"];
      if (!validRatios.includes(body.aspectRatio)) {
        return NextResponse.json(
          { error: `aspectRatio must be one of: ${validRatios.join(", ")}` },
          { status: 400 }
        );
      }
    }

    const result = await generateCarousel({
      story: body.story.trim(),
      tone: body.tone,
      aspectRatio: body.aspectRatio,
    });

    // Basic structural validation
    if (
      !result.slides ||
      !Array.isArray(result.slides) ||
      result.slides.length !== 6
    ) {
      throw new Error("MiniMax returned unexpected slide structure");
    }

    for (const slide of result.slides) {
      if (
        typeof slide.slide !== "number" ||
        !isValidSlideType(slide.type) ||
        typeof slide.headline !== "string"
      ) {
        throw new Error("MiniMax returned malformed slide data");
      }
    }

    if (!result.caption || typeof result.caption.text !== "string") {
      throw new Error("MiniMax returned malformed caption data");
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("[/api/generate]", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 1: Write `app/api/generate/route.ts`**

Create `app/api/generate/route.ts` with the code above.

- [ ] **Step 2: Commit**

```bash
git add app/api/generate/route.ts && git commit -m "feat: add POST /api/generate endpoint"
```

---

## Task 6: Create `POST /api/remix-slide`

**Files:**
- Create: `app/api/remix-slide/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { remixSlide } from "@/lib/minimax";
import { RemixSlideRequest, SlideType } from "@/lib/types";

const VALID_SLIDE_TYPES: SlideType[] = [
  "hook", "context", "incident", "lesson", "how_to_apply", "cta",
];

function isValidSlideType(type: string): type is SlideType {
  return VALID_SLIDE_TYPES.includes(type as SlideType);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RemixSlideRequest;

    if (!body.story || typeof body.story !== "string" || body.story.trim().length === 0) {
      return NextResponse.json(
        { error: "story is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (
      typeof body.slideIndex !== "number" ||
      body.slideIndex < 1 ||
      body.slideIndex > 6 ||
      !Number.isInteger(body.slideIndex)
    ) {
      return NextResponse.json(
        { error: "slideIndex must be an integer between 1 and 6" },
        { status: 400 }
      );
    }

    if (!body.slideType || !isValidSlideType(body.slideType)) {
      return NextResponse.json(
        { error: `slideType must be one of: ${VALID_SLIDE_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (body.tone !== undefined) {
      const validTones = ["visionary", "technical", "sarcastic", "actionable"];
      if (!validTones.includes(body.tone)) {
        return NextResponse.json(
          { error: `tone must be one of: ${validTones.join(", ")}` },
          { status: 400 }
        );
      }
    }

    if (body.aspectRatio !== undefined) {
      const validRatios = ["4:3", "1:1", "9:16"];
      if (!validRatios.includes(body.aspectRatio)) {
        return NextResponse.json(
          { error: `aspectRatio must be one of: ${validRatios.join(", ")}` },
          { status: 400 }
        );
      }
    }

    const result = await remixSlide({
      story: body.story.trim(),
      slideIndex: body.slideIndex,
      slideType: body.slideType,
      tone: body.tone,
      aspectRatio: body.aspectRatio,
    });

    if (
      typeof result.slide !== "number" ||
      result.slide !== body.slideIndex ||
      !isValidSlideType(result.type) ||
      typeof result.headline !== "string"
    ) {
      throw new Error("MiniMax returned malformed slide data");
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("[/api/remix-slide]", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 1: Write `app/api/remix-slide/route.ts`**

Create `app/api/remix-slide/route.ts` with the code above.

- [ ] **Step 2: Commit**

```bash
git add app/api/remix-slide/route.ts && git commit -m "feat: add POST /api/remix-slide endpoint"
```

---

## Task 7: Create `.env.local.example` and validate TypeScript

**Files:**
- Create: `.env.local.example`
- Modify: `.gitignore` (ensure `.env.local` is ignored)

- [ ] **Step 1: Create `.env.local.example`**

```
# MiniMax API Key — get yours at https://platform.minimax.chat
MINIMAX_API_KEY=your_api_key_here
```

- [ ] **Step 2: Verify `.gitignore` excludes `.env.local`**

Run: `grep -q "\.env\.local" /workspaces/caraogen/.gitignore && echo "already ignored" || echo ".env.local NOT ignored — add it"`
Expected: `already ignored` (create-next-app adds this by default)

- [ ] **Step 3: TypeScript type-check**

Run: `cd /workspaces/caraogen && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add .env.local.example && git commit -m "chore: add .env.local.example"
```

---

## Task 8: Write Route Handler Tests

**Files:**
- Create: `app/api/generate/route.test.ts`
- Create: `app/api/remix-slide/route.test.ts`

**Prerequisites:** Install Vitest for lightweight testing: `npm install -D vitest @vitejs/plugin-react`

- [ ] **Step 1: Install Vitest**

Run: `cd /workspaces/caraogen && npm install -D vitest @vitejs/plugin-react`
Expected: Vitest installed

- [ ] **Step 2: Configure `vitest.config.ts`**

```typescript
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
  },
});
```

Run: Write `vitest.config.ts` in project root.

- [ ] **Step 3: Write test for `/api/generate` — invalid request**

```typescript
import { describe, it, expect } from "vitest";

describe("POST /api/generate", () => {
  it("returns 400 when story is missing", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("story");
  });

  it("returns 400 when tone is invalid", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ story: "Hello world", tone: "not-a-tone" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("tone");
  });

  it("returns 400 when aspectRatio is invalid", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ story: "Hello", aspectRatio: "16:9" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("aspectRatio");
  });
});
```

- [ ] **Step 4: Write test for `/api/remix-slide` — invalid request**

```typescript
import { describe, it, expect } from "vitest";

describe("POST /api/remix-slide", () => {
  it("returns 400 when slideIndex is out of range", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/remix-slide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        story: "Hello world",
        slideIndex: 7,
        slideType: "hook",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("slideIndex");
  });

  it("returns 400 when slideType is invalid", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/remix-slide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        story: "Hello world",
        slideIndex: 1,
        slideType: "not-a-type",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("slideType");
  });

  it("returns 400 when story is missing", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/remix-slide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slideIndex: 1, slideType: "hook" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("story");
  });
});
```

- [ ] **Step 5: Run tests**

Run: `cd /workspaces/caraogen && npx vitest run`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts app/api/generate/route.test.ts app/api/remix-slide/route.test.ts && git commit -m "test: add route handler unit tests"
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|---|---|
| `POST /api/generate` endpoint | Task 5 |
| `POST /api/remix-slide` endpoint | Task 6 |
| MiniMax Text-01 via OpenAI-compatible endpoint | Task 3 |
| Prompt builder with 6 slide types | Task 4 |
| TypeScript types | Task 2 |
| `.env.local.example` | Task 7 |
| Request validation (story required, tone, aspectRatio) | Tasks 5, 6 |
| Error responses `400`/`500` | Tasks 5, 6 |
| Unit tests | Task 8 |

All spec requirements covered. No gaps.
