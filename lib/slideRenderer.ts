import { Slide, AspectRatio } from "./types";

export const CANVAS_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  "4:3":  { width: 1080, height: 810 },
  "1:1":  { width: 1080, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
};

const FONT_EPILOGUE = "bold 64px 'Epilogue', sans-serif";
const FONT_BODY    = "500 28px 'Inter', sans-serif";
const FONT_LABEL   = "bold 20px 'Inter', sans-serif";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function renderSlideToCanvas(
  slide: Slide,
  aspectRatio: AspectRatio,
  photoDataUrl?: string
): Promise<HTMLCanvasElement> {
  const { width, height } = CANVAS_DIMENSIONS[aspectRatio];
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // ── Background ──────────────────────────────────────────────
  if (photoDataUrl) {
    try {
      const img = await loadImage(photoDataUrl);
      // Cover fill
      const scale = Math.max(width / img.width, height / img.height);
      const sw = img.width * scale, sh = img.height * scale;
      const sx = (sw - width) / 2, sy = (sh - height) / 2;
      ctx.drawImage(img, -sx, -sy, sw, sh);
      // Gradient scrim at bottom
      const grad = ctx.createLinearGradient(0, height * 0.45, 0, height);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.75)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } catch {
      drawGradientBg(ctx, width, height);
    }
  } else {
    drawGradientBg(ctx, width, height);
  }

  // ── Text ────────────────────────────────────────────────────
  const headline = slide.headline;
  const body     = slide.body;
  const label    = `Slide ${slide.slide}/6`;

  const pad = Math.round(width * 0.07);
  const bottomZone = Math.round(height * 0.6); // bottom 60% where text lives

  ctx.save();

  // Slide label top-left
  ctx.font      = FONT_LABEL;
  ctx.fillStyle = "#f59e0b";
  ctx.fillText(label, pad, pad + 24);

  // Headline — positioned in bottom third
  const headlineY = bottomZone;
  wrapText(ctx, headline, pad, headlineY, width - pad * 2, 72);

  // Body
  if (body) {
    const bodyY = headlineY + 90;
    ctx.font      = FONT_BODY;
    ctx.fillStyle = "rgba(229,231,235,0.85)";
    wrapText(ctx, body, pad, bodyY, width - pad * 2, 36);
  }

  ctx.restore();
  return canvas;
}

function drawGradientBg(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#ffc174");
  grad.addColorStop(0.5, "#f59e0b");
  grad.addColorStop(1, "#0e0e10");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let ty = y;

  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + " ";
    if (ctx.measureText(test).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, ty);
      line = words[i] + " ";
      ty += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, ty);
}
