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
