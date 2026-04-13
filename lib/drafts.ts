import { AspectRatio, Tone } from "./types";

export interface Draft {
  id: string;
  story: string;
  tone: Tone;
  aspectRatio: AspectRatio;
  updatedAt: number; // Date.now()
}

const KEY = "bip-drafts";

export function getDrafts(): Draft[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveDraft(draft: Draft): void {
  const drafts = getDrafts().filter((d) => d.id !== draft.id);
  drafts.unshift(draft);
  localStorage.setItem(KEY, JSON.stringify(drafts.slice(0, 10)));
}

export function deleteDraft(id: string): void {
  const drafts = getDrafts().filter((d) => d.id !== id);
  localStorage.setItem(KEY, JSON.stringify(drafts));
}
