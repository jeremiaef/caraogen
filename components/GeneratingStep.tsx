"use client";

export default function GeneratingStep() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[716px] px-4">
      {/* Status header */}
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-container-high mb-4">
          <span
            className="material-symbols-outlined text-primary-container animate-spin"
            style={{ animationDuration: "3s", fontVariationSettings: "'wght' 400" }}
          >
            refresh
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-extrabold tracking-tighter text-on-surface">
          Crafting your carousel...
        </h1>
        <p className="text-[#A1A1AA] font-body text-lg max-w-md mx-auto">
          Our AI is organizing your thoughts into visually compelling slides. This usually takes 15–30 seconds.
        </p>
      </div>

      {/* Bento-style skeleton grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl px-4">
        {[
          { title: "w-1/3", lines: ["w-full", "w-5/6"] },
          { title: "w-1/4", lines: ["w-full", "w-full", "w-2/3"] },
          { title: "w-1/2", lines: ["w-16", "center"] },
          { title: "w-1/3", lines: ["w-full", "w-4/5", "w-3/4"] },
        ].map(({ title, lines }, i) => (
          <div
            key={i}
            className="aspect-[4/3] rounded-xl skeleton-pulse border border-outline-variant/15 flex flex-col p-6 gap-4 relative overflow-hidden"
          >
            <div className={`h-4 ${title} bg-surface-container-highest rounded-full`} />
            <div className="space-y-2 mt-4 flex-1 flex flex-col justify-end">
              {lines.map((cls, j) =>
                cls === "center" ? (
                  <div key={j} className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-surface-container-highest/40" />
                    <div className="h-2 w-24 bg-surface-container-highest rounded-full" />
                  </div>
                ) : (
                  <div key={j} className={`h-3 ${cls} bg-surface-container-highest rounded-full`} />
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="w-full max-w-2xl mt-16 bg-surface-container-low h-1 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-container rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"
          style={{ width: "65%" }}
        />
      </div>
      <div className="mt-4 flex justify-between w-full max-w-2xl px-2">
        <span className="text-[10px] uppercase tracking-widest text-[#A1A1AA] font-label">
          Processing logic
        </span>
        <span className="text-[10px] uppercase tracking-widest text-primary font-label">
          65% Complete
        </span>
      </div>

      {/* Background blobs */}
      <div className="fixed top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] bg-tertiary/5 blur-[100px] rounded-full -z-10 pointer-events-none" />
    </div>
  );
}
