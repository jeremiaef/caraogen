# BIP Carousel Maker — Design Spec

## Overview

A web app for build-in-public creators. User describes what happened in their build journey, optionally uploads their photo, and AI generates a ready-to-post Instagram/Threads carousel with 6 polished slides plus a caption.

## Tech Stack

- **Frontend:** Next.js (App Router) + Tailwind CSS
- **AI:** MiniMax M2.7 API via Next.js API route proxy (`/api/generate`)
- **Slide rendering:** HTML Canvas (browser-side) → exported as PNG
- **Image upload:** Local file input, stored in browser memory (no backend storage)
- **Download:** `jszip` bundles slides + caption into a ZIP
- **Hosting:** Vercel (static + serverless functions)

## Aesthetic & UI

**Dark Figma/Raycast aesthetic.**

- Background: `#0D0D0F`
- Surface cards: `#18181B`
- Border/divider: `#27272A`
- Text primary: `#FAFAFA`
- Text muted: `#A1A1AA`
- Accent: `#F59E0B` (amber) — used sparingly for labels, active states, CTAs

**Typography:**
- UI: `Inter` or `Geist` (geometric sans)
- Slide headlines: bold display font (loaded from Google Fonts or bundled)

**Motion:**
- Staggered entrance animations on page load
- Spring-based hover lifts on interactive elements
- Skeleton placeholders pulse while generating
- Slides snap into place with a subtle scale animation

## Page Flow (Single Page App)

Three visual states:

### 1. Upload State
- Clean, focused, minimal layout
- Photo upload zone (optional) with icon and CTA
- Textarea for build story with placeholder: "What happened in your build today?"
- "Generate" button — disabled until story text is entered
- Accent: subtle glow on focused textarea

### 2. Generating State
- Skeleton slide placeholders pulse while AI works
- Clean progress text: "Crafting your carousel..."
- Non-blocking — user sees work is happening

### 3. Preview State
- Carousel slides render in a vertical scroll layout
- Each slide: 4:3 canvas preview (scaled to fit viewport)
- Caption shown below carousel with one-click copy
- "Download ZIP" button — downloads all 6 slides + caption.txt
- "Start Over" button to reset to Upload State

## Slide Structure

6 slides, fixed order, 1080×810px canvas (4:3):

1. **Hook** — attention-grabbing statement or question. Headline only.
2. **Context** — what they were building and why. Headline + 2-line body.
3. **The Incident** — the raw story. Headline + 3-line body.
4. **The Lesson** — what other builders can learn. Headline + 3-line body.
5. **How To Apply** — actionable takeaway. Headline + bullet-style steps.
6. **CTA** — "Follow for more build stories." Bold headline.

## Slide Visual Design

**With photo uploaded:**
- Full-bleed photo as background
- Bottom gradient scrim: `rgba(0,0,0,0.65)` → transparent
- Text positioned in bottom third

**Without photo:**
- Bold geometric gradient background (amber `#F59E0B` → dark `#0D0D0F`)
- Same text layout

**Typography:**
- Headline: 48–64px bold
- Body: 24–28px regular
- Max 3 lines per text block
- Generous padding, text never touches edges

**Slide label:**
- Top-left corner: "Slide X/6" in small amber `#F59E0B` text

## AI Integration

### API Route: `/api/generate`
- Method: `POST`
- Body: `{ story: string }`
- Server-side call to MiniMax M2.7 (API key kept secret)
- Returns JSON:

```json
{
  "slides": [
    { "slide": 1, "type": "hook", "headline": "", "body": "" },
    { "slide": 2, "type": "context", "headline": "", "body": "" },
    { "slide": 3, "type": "incident", "headline": "", "body": "" },
    { "slide": 4, "type": "lesson", "headline": "", "body": "" },
    { "slide": 5, "type": "how_to_apply", "headline": "", "body": "" },
    { "slide": 6, "type": "cta", "headline": "", "body": "" }
  ],
  "caption": {
    "text": "",
    "hashtags": []
  }
}
```

### Prompt Strategy
- AI instructed to match user's raw, relatable, BIP-native tone
- Headlines: max 6 words, punchy
- Body: 2–4 lines max
- Arc follows 6-slide structure strictly
- Caption: hook-style opener + brief summary + 3–5 hashtags

## Download

- ZIP file containing:
  - `slide-1.png` through `slide-6.png` (1080×810px)
  - `caption.txt` (caption text + hashtags)
- Generated client-side using `jszip`
- One-click "Download ZIP" from Preview State
- Caption copy button with "Copied!" confirmation toast

## Error Handling

- **API failure:** Inline error message + Retry button. Non-blocking.
- **Photo upload failure:** Toast notification if file >10MB or corrupt.
- **Canvas render failure:** Skip failed slide, show warning, render remaining slides.
- Empty states: clear placeholder text, descriptive upload icon and CTA.

## File Structure

```
/app
  /api
    /generate
      route.ts          # MiniMax proxy
  page.tsx              # Main app page
  layout.tsx            # Root layout with fonts
  globals.css           # Tailwind + custom styles
/components
  PhotoUpload.tsx       # Optional photo upload zone
  StoryInput.tsx        # Textarea for build story
  GenerateButton.tsx    # Primary CTA
  SlideCanvas.tsx       # Canvas rendering logic
  SlidePreview.tsx      # Preview display component
  SkeletonSlide.tsx     # Loading placeholder
  DownloadButton.tsx    # ZIP download
  CaptionBlock.tsx      # Caption + copy button
  Toast.tsx              # Error/success notifications
/lib
  generateSlides.ts      # Canvas drawing logic
  promptBuilder.ts       # AI prompt construction
  downloadZip.ts         # jszip bundling logic
  types.ts               # TypeScript interfaces
/public
  /fonts                 # Slide display font
```
