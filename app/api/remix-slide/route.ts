import { NextRequest, NextResponse } from "next/server";
import { remixSlide } from "@/lib/minimax";
import { RemixSlideRequest, SlideType } from "@/lib/types";

const VALID_SLIDE_TYPES: SlideType[] = [
  "hook", "context", "incident", "lesson", "how_to_apply", "cta",
];

function isValidSlideType(type: string): type is SlideType {
  return VALID_SLIDE_TYPES.includes(type as SlideType);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RemixSlideRequest;

    if (!body.story || typeof body.story !== "string" || body.story.trim().length === 0) {
      return NextResponse.json(
        { error: "story is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (
      typeof body.slideIndex !== "number" ||
      body.slideIndex < 1 ||
      body.slideIndex > 6 ||
      !Number.isInteger(body.slideIndex)
    ) {
      return NextResponse.json(
        { error: "slideIndex must be an integer between 1 and 6" },
        { status: 400 }
      );
    }

    if (!body.slideType || !isValidSlideType(body.slideType)) {
      return NextResponse.json(
        { error: `slideType must be one of: ${VALID_SLIDE_TYPES.join(", ")}` },
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

    const result = await remixSlide({
      story: body.story.trim(),
      slideIndex: body.slideIndex,
      slideType: body.slideType,
      tone: body.tone,
      aspectRatio: body.aspectRatio,
    });

    if (
      typeof result.slide !== "number" ||
      result.slide !== body.slideIndex ||
      !isValidSlideType(result.type) ||
      typeof result.headline !== "string"
    ) {
      throw new Error("MiniMax returned malformed slide data");
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("[/api/remix-slide]", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
