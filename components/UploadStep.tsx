"use client";

import { useRef, useState } from "react";
import { Tone, AspectRatio } from "@/lib/types";

interface Props {
  story: string;
  tone: Tone;
  aspectRatio: AspectRatio;
  photoDataUrl: string | null;
  error: string | null;
  onGenerate: (story: string, tone: Tone, ratio: AspectRatio, photo: string | null) => void;
  onSaveDraft: () => void;
}

const TONES: { value: Tone; label: string }[] = [
  { value: "visionary",  label: "Visionary" },
  { value: "technical",  label: "Technical" },
  { value: "sarcastic",  label: "Sarcastic" },
  { value: "actionable", label: "Actionable" },
];

const RATIOS: { value: AspectRatio; label: string }[] = [
  { value: "4:3", label: "4:3 Portrait" },
  { value: "1:1", label: "1:1 Square" },
  { value: "9:16", label: "9:16 Reel" },
];

export default function UploadStep({
  story: initialStory,
  tone: initialTone,
  aspectRatio: initialRatio,
  error,
  onGenerate,
  onSaveDraft,
}: Props) {
  const [story, setStory]       = useState(initialStory);
  const [tone, setTone]         = useState<Tone>(initialTone);
  const [aspectRatio, setAspect]= useState<AspectRatio>(initialRatio);
  const [photo, setPhoto]       = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const canGenerate = story.trim().length > 0;

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setPhoto(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-12 md:py-20">
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-primary font-label text-xs font-bold uppercase tracking-[0.2em] mb-4 block">
            New Campaign
          </span>
          <h1 className="text-5xl md:text-7xl font-headline font-extrabold text-[#FAFAFA] tracking-tighter leading-[0.9]">
            Share the <span className="text-primary-container">Process.</span>
          </h1>
        </div>
        {/* Brand presets toggle */}
        <div className="flex items-center gap-3 pb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-outline-variant">Save Draft</span>
          <button
            onClick={onSaveDraft}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container border border-outline-variant/20 text-xs font-bold text-[#F59E0B] hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            Save
          </button>
        </div>
      </header>

      <div className="space-y-8">
        {/* ── Photo upload zone ──────────────────────────────────────── */}
        <div
          className={[
            "relative flex flex-col items-center justify-center w-full aspect-[21/9] rounded-xl cursor-pointer overflow-hidden transition-all",
            "bg-surface-container-lowest border",
            dragging
              ? "border-primary/50 bg-primary/5"
              : "border-outline-variant/15 hover:border-primary/30",
          ].join(" ")}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          {photo ? (
            <>
              <img src={photo} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-bold">Click to replace</span>
              </div>
            </>
          ) : (
            <div className="z-10 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-2xl">add_a_photo</span>
              </div>
              <span className="text-sm font-label text-on-surface-variant font-medium">Add cover photo</span>
            </div>
          )}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none" />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        {/* ── Controls row ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tone */}
          <div className="relative">
            <label className="absolute -top-3 left-4 px-2 bg-surface-dim text-[10px] font-bold uppercase tracking-widest text-outline-variant z-10">
              Editorial Tone
            </label>
            <div className="flex gap-2 p-4 bg-surface-container-lowest border border-outline-variant/15 rounded-xl">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={[
                    "flex-1 py-2 px-2 rounded-lg text-[11px] font-bold transition-all",
                    tone === t.value
                      ? "bg-surface-container text-on-surface border border-primary/30"
                      : "bg-surface-container-low text-on-surface-variant hover:text-on-surface",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect ratio */}
          <div className="relative">
            <label className="absolute -top-3 left-4 px-2 bg-surface-dim text-[10px] font-bold uppercase tracking-widest text-outline-variant z-10">
              Canvas Size
            </label>
            <div className="flex gap-2 p-4 bg-surface-container-lowest border border-outline-variant/15 rounded-xl">
              {RATIOS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setAspect(r.value)}
                  className={[
                    "flex-1 py-2 px-2 rounded-lg text-[11px] font-bold transition-all",
                    aspectRatio === r.value
                      ? "bg-surface-container text-on-surface border border-primary/30"
                      : "bg-surface-container-low text-on-surface-variant hover:text-on-surface",
                  ].join(" ")}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Story textarea ──────────────────────────────────────────── */}
        <div className="relative group">
          <label className="absolute -top-3 left-4 px-2 bg-surface-dim text-[10px] font-bold uppercase tracking-widest text-outline-variant z-10">
            The Build Story
          </label>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="What happened in your build today?"
            className="w-full min-h-[320px] bg-surface-container-lowest border border-outline-variant/15 rounded-xl p-8 text-xl md:text-2xl font-body leading-relaxed text-on-surface placeholder:text-surface-container-highest focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none transition-all resize-none"
          />
          {/* Floating hint */}
          <div className="absolute bottom-4 right-4 flex gap-2 opacity-40 hover:opacity-100 transition-opacity">
            <button className="p-2 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface text-sm">
              <span className="material-symbols-outlined text-sm">format_bold</span>
            </button>
            <button className="p-2 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface text-sm">
              <span className="material-symbols-outlined text-sm">format_italic</span>
            </button>
            <button className="p-2 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface text-sm">
              <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
            </button>
          </div>
        </div>

        {/* ── Error ──────────────────────────────────────────────────── */}
        {error && (
          <div className="bg-error-container border border-error/30 rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-error text-xl">error</span>
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* ── Action bar ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline-variant">AI Strength</span>
              <div className="flex gap-1 mt-1">
                <div className="w-8 h-1 rounded-full bg-primary-container" />
                <div className="w-8 h-1 rounded-full bg-primary-container" />
                <div className="w-8 h-1 rounded-full bg-surface-container-highest" />
              </div>
            </div>
            <div className="h-8 w-px bg-outline-variant/20" />
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant text-lg">settings_sparkle</span>
              <span className="text-xs font-label text-on-surface-variant">Editorial mode active</span>
            </div>
          </div>

          <button
            onClick={() => canGenerate && onGenerate(story, tone, aspectRatio, photo)}
            disabled={!canGenerate}
            className={[
              "w-full md:w-auto px-10 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all group overflow-hidden relative",
              canGenerate
                ? "bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-95 cursor-pointer"
                : "bg-[#2a2a2c] text-[#A1A1AA] cursor-not-allowed",
            ].join(" ")}
          >
            {canGenerate ? (
              <>
                <span className="z-10">Generate Carousel</span>
                <span className="material-symbols-outlined z-10 transition-transform group-hover:translate-x-1">arrow_forward</span>
              </>
            ) : (
              <span className="z-10">Enter your story above</span>
            )}
          </button>
        </div>

        {/* ── Footer decoration ────────────────────────────────────────── */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-outline-variant/10 pt-12">
          {[
            { title: "Semantic Logic", desc: "AI analyzes your text to extract key milestones and Aha! moments automatically." },
            { title: "Visual Cohesion", desc: "Each slide is crafted with asymmetric balance to avoid that generic template look." },
            { title: "Build in Public", desc: "Optimized for LinkedIn, Twitter, and Instagram growth loops." },
          ].map(({ title, desc }) => (
            <div key={title} className="space-y-2">
              <h4 className="text-on-surface font-bold text-sm">{title}</h4>
              <p className="text-xs text-on-surface-variant">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
