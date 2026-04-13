import JSZip from "jszip";
import { Slide, AspectRatio } from "./types";
import { renderSlideToCanvas } from "./slideRenderer";

export async function downloadZip(
  slides: Slide[],
  caption: { text: string; hashtags: string[] },
  aspectRatio: AspectRatio,
  photoDataUrl?: string
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder("bip-carousel")!;

  // Render each slide to canvas → PNG blob
  for (const slide of slides) {
    const canvas = await renderSlideToCanvas(slide, aspectRatio, photoDataUrl);
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/png", 1.0)
    );
    folder.file(`slide-${slide.slide}.png`, blob);
  }

  // caption.txt
  const captionText = `${caption.text}\n\n${caption.hashtags.join(" ")}`;
  folder.file("caption.txt", captionText);

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bip-carousel.zip";
  a.click();
  URL.revokeObjectURL(url);
}
