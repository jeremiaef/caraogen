import { GenerateRequest, GenerateResponse, RemixSlideRequest, Slide } from "./types";

const MINIMAX_BASE_URL = "https://api.minimax.chat/v1";

function getMinimaxApiKey(): string {
  const key = process.env.MINIMAX_API_KEY;
  if (!key) throw new Error("MINIMAX_API_KEY environment variable is not set");
  return key;
}

interface MiniMaxMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface MiniMaxChoice {
  message: { role: string; content: string };
}

interface MiniMaxResponse {
  choices: MiniMaxChoice[];
  error?: { message: string };
}

async function chatCompletion(messages: MiniMaxMessage[]): Promise<string> {
  const apiKey = getMinimaxApiKey();
  const response = await fetch(`${MINIMAX_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "MiniMax-Text-01",
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`MiniMax API error ${response.status}: ${text}`);
  }

  const data: MiniMaxResponse = await response.json();

  if (data.error) {
    throw new Error(`MiniMax API error: ${data.error.message}`);
  }

  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error("MiniMax returned no content");
  return content;
}

function extractJSON<T>(raw: string): T {
  // Try to extract JSON from markdown code blocks first, then raw string
  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonString = codeBlockMatch ? codeBlockMatch[1].trim() : raw.trim();
  return JSON.parse(jsonString) as T;
}

export async function generateCarousel(req: GenerateRequest): Promise<GenerateResponse> {
  const { buildSystemPrompt, buildCarouselUserPrompt } = await import("./promptBuilder");
  const messages: MiniMaxMessage[] = [
    { role: "system", content: buildSystemPrompt(req.tone) },
    { role: "user", content: buildCarouselUserPrompt(req.story, req.tone, req.aspectRatio) },
  ];
  const raw = await chatCompletion(messages);
  return extractJSON<GenerateResponse>(raw);
}

export async function remixSlide(req: RemixSlideRequest): Promise<Slide> {
  const { buildSystemPrompt, buildRemixSlideUserPrompt } = await import("./promptBuilder");
  const messages: MiniMaxMessage[] = [
    { role: "system", content: buildSystemPrompt(req.tone) },
    { role: "user", content: buildRemixSlideUserPrompt(req.story, req.slideIndex, req.slideType, req.tone, req.aspectRatio) },
  ];
  const raw = await chatCompletion(messages);
  return extractJSON<Slide>(raw);
}
