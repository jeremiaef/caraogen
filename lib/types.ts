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
