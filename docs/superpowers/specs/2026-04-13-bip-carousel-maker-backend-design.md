# BIP Carousel Maker — Backend Design Spec

**Date:** 2026-04-13
**Scope:** Backend API only (frontend is complete)

---

## Overview

Next.js App Router API routes as serverless functions. No database — client-side localStorage handles draft persistence (v1).

## Tech Stack

- **Runtime:** Next.js (App Router)
- **AI:** MiniMax Text-01 via OpenAI-compatible chat completions (`POST /v1/chat/completions`)
- **Config:** `MINIMAX_API_KEY` environment variable
- **No database** for v1

## File Structure

```
/app/api
  /generate/route.ts      # POST — full 6-slide carousel + caption
  /remix-slide/route.ts   # POST — regenerate single slide
/lib
  /minimax.ts             # MiniMax API client
  /promptBuilder.ts       # Build system prompt per slide type
  /types.ts               # Shared TypeScript interfaces
/.env.local               # MINIMAX_API_KEY=...
```

---

## API: `POST /api/generate`

### Request

```json
{
  "story": "string",
  "tone": "visionary" | "technical" | "sarcastic" | "actionable" | undefined",
  "aspectRatio": "4:3" | "1:1" | "9:16" | undefined"
}
```

### Response `200`

```json
{
  "slides": [
    { "slide": 1, "type": "hook",       "headline": "string", "body": "" },
    { "slide": 2, "type": "context",   "headline": "string", "body": "string" },
    { "slide": 3, "type": "incident",  "headline": "string", "body": "string" },
    { "slide": 4, "type": "lesson",    "headline": "string", "body": "string" },
    { "slide": 5, "type": "how_to_apply", "headline": "string", "body": "string" },
    { "slide": 6, "type": "cta",        "headline": "string", "body": "" }
  ],
  "caption": {
    "text": "string",
    "hashtags": ["string"]
  }
}
```

### Error `500`

```json
{ "error": "string" }
```

---

## API: `POST /api/remix-slide`

### Request

```json
{
  "story": "string",
  "slideIndex": 1-6,
  "slideType": "hook" | "context" | "incident" | "lesson" | "how_to_apply" | "cta",
  "tone": "visionary" | "technical" | "sarcastic" | "actionable" | undefined",
  "aspectRatio": "4:3" | "1:1" | "9:16" | undefined"
}
```

### Response `200`

```json
{ "slide": 3, "type": "incident", "headline": "string", "body": "string" }
```

### Error `400` — invalid slide index or type
### Error `500` — AI failure

---

## MiniMax Integration

- **Endpoint:** `https://api.minimax.chat/v1/chat/completions`
- **Model:** `MiniMax-Text-01`
- **Auth:** `Bearer` token from `MINIMAX_API_KEY`
- **Strategy:** One call per request (carousel content generated in a single structured prompt, parsed client-side)
- No streaming

---

## Prompt Strategy

System prompt instructs MiniMax to output valid JSON matching the response schema. User message carries the story + tone framing.

Each slide type has distinct instructions:
- `hook`: headline only, max 6 words, attention-grabbing question or statement
- `context`: headline + 2-line body — what was being built and why
- `incident`: headline + 3-line body — the raw story moment
- `lesson`: headline + 3-line body — what other builders can learn
- `how_to_apply`: headline + bullet-style steps
- `cta`: headline only, call to action

Headlines: max 6 words. Body: 2–4 lines. Tone injected via user message prefix.

---

## Aspect Ratio & Tone

Passed through from frontend; included in prompt for contextual framing but do not change slide structure (6 slides always). Future: different layouts per ratio.

**Tone profiles:**
- `visionary` (default): aspirational, forward-looking
- `technical`: precise, code-adjacent, detail-oriented
- `sarcastic`: self-aware, witty edge
- `actionable`: direct, no-fluff, step-focused
