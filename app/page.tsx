"use client";

import { useState, useCallback } from "react";
import UploadStep from "@/components/UploadStep";
import GeneratingStep from "@/components/GeneratingStep";
import PreviewStep from "@/components/PreviewStep";
import { Slide, Caption, Tone, AspectRatio } from "@/lib/types";
import { getDrafts, saveDraft, deleteDraft } from "@/lib/drafts";

// ─── Types ───────────────────────────────────────────────────────────────────

type AppState = "upload" | "generating" | "preview";

interface Draft {
  id: string;
  story: string;
  tone: Tone;
  aspectRatio: AspectRatio;
  updatedAt: number;
}

// ─── Sidebar nav item ────────────────────────────────────────────────────────

const STEPS = [
  { id: "upload",      label: "Upload",      icon: "cloud_upload" },
  { id: "generating",  label: "Generating",  icon: "auto_awesome" },
  { id: "preview",     label: "Preview",      icon: "visibility" },
] as const;

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BIPCarouselMaker() {
  const [appState, setAppState]   = useState<AppState>("upload");
  const [story, setStory]         = useState("");
  const [tone, setTone]           = useState<Tone>("visionary");
  const [aspectRatio, setAspect]  = useState<AspectRatio>("4:3");
  const [photoDataUrl, setPhoto]  = useState<string | null>(null);
  const [slides, setSlides]       = useState<Slide[]>([]);
  const [caption, setCaption]     = useState<Caption>({ text: "", hashtags: [] });
  const [error, setError]         = useState<string | null>(null);
  const [drafts, setDrafts]       = useState<Draft[]>(getDrafts());

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleGenerate = useCallback(
    async (storyVal: string, toneVal: Tone, ratioVal: AspectRatio, photo: string | null) => {
      setStory(storyVal);
      setTone(toneVal);
      setAspect(ratioVal);
      setPhoto(photo);
      setError(null);
      setAppState("generating");

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ story: storyVal, tone: toneVal, aspectRatio: ratioVal }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Generation failed");
        setSlides(data.slides);
        setCaption(data.caption);
        setAppState("preview");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setAppState("upload");
      }
    },
    []
  );

  const handleRemix = useCallback(
    async (slideIndex: number, slideType: Slide["type"]) => {
      const res = await fetch("/api/remix-slide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story, slideIndex, slideType, tone, aspectRatio }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Remix failed");
      setSlides((prev) => prev.map((s) => (s.slide === slideIndex ? data : s)));
    },
    [story, tone, aspectRatio]
  );

  const handleSaveDraft = useCallback(() => {
    const draft: Draft = {
      id: Date.now().toString(),
      story,
      tone,
      aspectRatio,
      updatedAt: Date.now(),
    };
    saveDraft(draft);
    setDrafts(getDrafts());
  }, [story, tone, aspectRatio]);

  const handleLoadDraft = useCallback((draft: Draft) => {
    setStory(draft.story);
    setTone(draft.tone);
    setAspect(draft.aspectRatio);
  }, []);

  const handleDeleteDraft = useCallback((id: string) => {
    deleteDraft(id);
    setDrafts(getDrafts());
  }, []);

  const handleStartOver = useCallback(() => {
    setAppState("upload");
    setSlides([]);
    setCaption({ text: "", hashtags: [] });
    setError(null);
    setPhoto(null);
  }, []);

  // ─── Active step index for sidebar highlight ───────────────────────────────

  const activeIdx = STEPS.findIndex((s) => s.id === appState);

  return (
    <div className="flex min-h-screen bg-surface-dim text-on-background font-body">
      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col h-screen w-64 sticky top-0 bg-[#0e0e10] p-4 gap-1">
        <div className="mb-6 px-2">
          <h2 className="text-lg font-black text-[#FAFAFA] font-headline">Workflow</h2>
          <p className="text-xs text-[#A1A1AA]">Carousel Engine</p>
        </div>

        {STEPS.map((step, idx) => {
          const isActive   = appState === step.id;
          const isComplete = idx < activeIdx;
          return (
            <button
              key={step.id}
              onClick={() => isComplete && handleStartOver()}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
                isActive
                  ? "bg-[#2a2a2c] text-[#F59E0B] font-semibold"
                  : isComplete
                  ? "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#2a2a2c] cursor-pointer"
                  : "text-[#A1A1AA]",
              ].join(" ")}
            >
              <span className="material-symbols-outlined text-xl">
                {isActive || isComplete ? step.icon : step.icon}
              </span>
              {step.label}
            </button>
          );
        })}

        {/* Drafts section */}
        <div className="mt-8 px-2">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline-variant mb-3">
            My Drafts
          </h3>
          <div className="space-y-2">
            {drafts.length === 0 && (
              <p className="text-[11px] text-[#A1A1AA]">No drafts yet</p>
            )}
            {drafts.map((d) => (
              <button
                key={d.id}
                onClick={() => handleLoadDraft(d)}
                className="w-full text-left p-2 rounded-lg bg-surface-container-low border border-outline-variant/15 hover:bg-surface-container transition-colors group"
              >
                <p className="text-[11px] font-medium text-on-surface truncate">
                  {d.story.slice(0, 40) || "(empty)"}
                </p>
                <p className="text-[9px] text-on-surface-variant">
                  {new Date(d.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteDraft(d.id); }}
                  className="mt-1 text-[9px] text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Delete
                </button>
              </button>
            ))}
          </div>
        </div>

        {/* Pro tip */}
        <div className="mt-auto p-4 rounded-xl bg-surface-container-low border border-outline-variant/15">
          <p className="text-[10px] uppercase tracking-widest text-outline-variant font-bold mb-1">Pro Tip</p>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Tell a story, not just a fact. The engine works best with narrative build logs.
          </p>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {appState === "upload" && (
          <UploadStep
            story={story}
            tone={tone}
            aspectRatio={aspectRatio}
            photoDataUrl={photoDataUrl}
            error={error}
            onGenerate={handleGenerate}
            onSaveDraft={handleSaveDraft}
          />
        )}
        {appState === "generating" && <GeneratingStep />}
        {appState === "preview" && slides.length > 0 && (
          <PreviewStep
            slides={slides}
            caption={caption}
            aspectRatio={aspectRatio}
            photoDataUrl={photoDataUrl}
            tone={tone}
            onRemix={handleRemix}
            onStartOver={handleStartOver}
          />
        )}
      </main>
    </div>
  );
}
