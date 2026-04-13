"use client";

import { useState } from "react";
import { Slide, Tone, AspectRatio, Caption } from "@/lib/types";
import { downloadZip } from "@/lib/downloadZip";

interface Props {
  slides: Slide[];
  caption: Caption;
  aspectRatio: AspectRatio;
  photoDataUrl: string | null;
  tone: Tone;
  onRemix: (slideIndex: number, slideType: Slide["type"]) => Promise<void>;
  onStartOver: () => void;
}


// Slide visual variants (alternating surface-container tones for depth)
const SLIDE_VARIANTS = [
  "bg-surface-container-high",
  "bg-surface-container-high",
  "bg-surface-container-low",
  "bg-surface-container-high",
  "bg-surface-container-low",
  "bg-gradient-to-br from-surface-container-high to-surface-container-lowest border-2 border-primary/20",
];

export default function PreviewStep({
  slides,
  caption,
  aspectRatio,
  photoDataUrl,
  tone,
  onRemix,
  onStartOver,
}: Props) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied]           = useState(false);
  const [remixing, setRemixing]       = useState<number | null>(null);
  const [remixError, setRemixError]   = useState<string | null>(null);

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadZip(slides, caption, aspectRatio, photoDataUrl ?? undefined);
    } catch (e) {
      console.error("Download failed:", e);
    } finally {
      setDownloading(false);
    }
  }

  async function handleCopyCaption() {
    const full = `${caption.text}\n\n${caption.hashtags.join(" ")}`;
    await navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRemix(slide: Slide) {
    setRemixing(slide.slide);
    setRemixError(null);
    try {
      await onRemix(slide.slide, slide.type);
    } catch (e: unknown) {
      setRemixError(e instanceof Error ? e.message : "Remix failed");
    } finally {
      setRemixing(null);
    }
  }

  const captionText = caption.text;
  const captionTags  = caption.hashtags;

  return (
    <div className="max-w-6xl mx-auto px-8 pb-32">
      {/* Header */}
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 border border-primary-container/20 text-primary-container text-xs font-bold uppercase tracking-widest mb-4">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          Generation Complete
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tighter text-on-surface">
          Your Carousel is Ready.
        </h1>
        <p className="text-on-surface-variant mt-2 max-w-2xl">
          Review your slides below. Each card is optimized for high-engagement Build In Public storytelling.
        </p>
        {remixError && (
          <p className="mt-2 text-sm text-red-400">{remixError}</p>
        )}
      </header>

      {/* Slide grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {slides.map((slide) => (
          <SlideCard
            key={slide.slide}
            slide={slide}
            aspectRatio={aspectRatio}
            variant={SLIDE_VARIANTS[(slide.slide - 1) % SLIDE_VARIANTS.length]}
            isRemixing={remixing === slide.slide}
            onRemix={() => handleRemix(slide)}
          />
        ))}
      </div>

      {/* Caption block */}
      <section className="mb-20">
        <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline font-bold text-lg">Post Caption</h3>
            <button
              onClick={handleCopyCaption}
              className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
            >
              <span className="material-symbols-outlined text-sm">
                {copied ? "check" : "content_copy"}
              </span>
              {copied ? "Copied!" : "Copy Caption"}
            </button>
          </div>
          <div className="bg-surface-container-lowest rounded-lg p-6 font-body text-sm text-on-surface-variant leading-relaxed">
            {captionTags.length > 0 ? (
              <>
                <p className="mb-4 whitespace-pre-wrap">{captionText}</p>
                <p className="text-primary">
                  {captionTags.join(" ")}
                </p>
              </>
            ) : (
              <p className="text-on-surface-variant italic">Caption will appear here after generation.</p>
            )}
          </div>
        </div>
      </section>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 glass-panel p-6 border-t border-outline-variant/10 z-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">analytics</span>
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">Carousel Summary</p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                {slides.length} Slides &bull; {aspectRatio} &bull; {tone}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={onStartOver}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-outline-variant text-on-surface text-sm font-bold hover:bg-surface-bright transition-all active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              Start Over
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary text-sm font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              {downloading ? "Preparing..." : "Download ZIP"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Individual slide card ────────────────────────────────────────────────────

interface SlideCardProps {
  slide: Slide;
  aspectRatio: AspectRatio;
  variant: string;
  isRemixing: boolean;
  onRemix: () => void;
}

function SlideCard({ slide, variant, isRemixing, onRemix }: SlideCardProps) {
  return (
    <div className="relative group">
      {/* Top bar: label + remix */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
        <span className="text-[10px] font-bold text-primary-container uppercase tracking-widest bg-surface-container-lowest/80 backdrop-blur-md px-2 py-1 rounded-lg">
          Slide {slide.slide}/6
        </span>
        <button
          onClick={onRemix}
          disabled={isRemixing}
          title="Remix this slide"
          className="w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-bright shadow-lg disabled:opacity-50"
        >
          {isRemixing ? (
            <span className="material-symbols-outlined text-sm animate-spin" style={{ fontVariationSettings: "'wght' 400" }}>
              refresh
            </span>
          ) : (
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'wght' 600" }}>
              refresh
            </span>
          )}
        </button>
      </div>

      {/* Slide canvas preview */}
      <div
        className={`${variant} rounded-xl p-8 flex flex-col justify-center relative overflow-hidden border border-outline-variant/15 transition-all hover:border-primary-container/30 aspect-[4/3]`}
      >
        {/* Decorative gradient for hook slide */}
        {slide.slide === 1 && (
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />
        )}
        {slide.slide === 6 && (
          <div className="absolute top-0 right-0 p-4">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              rocket_launch
            </span>
          </div>
        )}

        <h2 className="text-2xl md:text-3xl font-headline font-extrabold leading-tight mb-3 relative z-10">
          {slide.headline}
        </h2>
        {slide.body && (
          <p className="text-on-surface-variant text-sm leading-relaxed relative z-10">
            {slide.body}
          </p>
        )}

        {/* CTA progress bar for slide 6 */}
        {slide.slide === 6 && slide.body && (
          <div className="w-full h-1 bg-primary/20 rounded-full mt-4 relative z-10">
            <div className="w-1/3 h-full bg-primary rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
