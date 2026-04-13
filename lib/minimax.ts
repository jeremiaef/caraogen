import { GenerateRequest, GenerateResponse, RemixSlideRequest, Slide } from "./types";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

function getApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY environment variable is not set");
  return key;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatResponse {
  choices: Array<{ message: { role: string; content: string } }>;
  error?: { message: string };
}

async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  const apiKey = getApiKey();
  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq API error ${response.status}: ${text}`);
  }

  const data: ChatResponse = await response.json();

  if (data.error) {
    throw new Error(`Groq API error: ${data.error.message}`);
  }

  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error("Groq returned no content");
  return content;
}

function extractJSON<T>(raw: string): T {
  let jsonString = raw.trim();

  // Extract from code block if present
  const codeBlockMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) jsonString = codeBlockMatch[1].trim();

  // Find JSON boundaries (first { to last })
  const firstBrace = jsonString.indexOf("{");
  const lastBrace  = jsonString.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    jsonString = jsonString.slice(firstBrace, lastBrace + 1);
  }

  // Remove all control characters except newlines/tabs
  jsonString = jsonString.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  try {
    return JSON.parse(jsonString) as T;
  } catch {
    // Last resort: try stripping any non-printable unicode
    // Remove characters that are not valid JSON tokens
    throw new Error(`Failed to parse JSON. Preview (first 200 chars): ${jsonString.slice(0, 200)}`);
  }
}

export async function generateCarousel(req: GenerateRequest): Promise<GenerateResponse> {
  const { buildSystemPrompt, buildCarouselUserPrompt } = await import("./promptBuilder");
  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt(req.tone) },
    { role: "user", content: buildCarouselUserPrompt(req.story, req.tone, req.aspectRatio) },
  ];
  const raw = await chatCompletion(messages);
  return extractJSON<GenerateResponse>(raw);
}

export async function remixSlide(req: RemixSlideRequest): Promise<Slide> {
  const { buildSystemPrompt, buildRemixSlideUserPrompt } = await import("./promptBuilder");
  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt(req.tone) },
    { role: "user", content: buildRemixSlideUserPrompt(req.story, req.slideIndex, req.slideType, req.tone, req.aspectRatio) },
  ];
  const raw = await chatCompletion(messages);
  return extractJSON<Slide>(raw);
}
