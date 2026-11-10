import type { GlyphKey } from "@/lib/services";

export type Tone = "violet" | "cyan" | "lime" | "amber" | "rose" | "neutral";

/** Hex values mirror the accent tokens declared in app/globals.css. */
export const accents: Record<Exclude<Tone, "neutral">, string> = {
  violet: "#8b7bff",
  cyan: "#3fd8e6",
  lime: "#c3f24f",
  amber: "#ffbf66",
  rose: "#ff7e9d",
};

export const accentToneClass: Record<Tone, string> = {
  violet: "tone-violet",
  cyan: "tone-cyan",
  lime: "tone-lime",
  amber: "tone-amber",
  rose: "tone-rose",
  neutral: "tone-neutral",
};

/** Every service keeps the same accent everywhere it is drawn or labelled. */
export const glyphTone: Record<GlyphKey, Tone> = {
  pentest: "rose",
  security: "cyan",
  cloud: "cyan",
  software: "violet",
  web: "violet",
  ai: "lime",
  consulting: "amber",
};

export const accentHex = (tone: Tone): string =>
  tone === "neutral" ? "#a0a0a0" : accents[tone];

const toneCycle: Tone[] = ["violet", "cyan", "lime", "amber", "rose"];

/** Labels that appear in navigation and tags get a deliberate, fixed accent. */
const labelTones: Record<string, Tone> = {
  design: "lime",
  ai: "amber",
  infrastructure: "cyan",
  cloud: "cyan",
  security: "rose",
  cybersecurity: "rose",
  engineering: "violet",
  development: "violet",
  general: "violet",
  feedback: "lime",
};

/** Stable colour for a free-form label such as a category or resource tag. */
export function toneForSlug(value: string): Tone {
  const known = labelTones[value.trim().toLowerCase().replace(/[_\s]+/g, "-")];
  if (known) return known;

  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return toneCycle[hash % toneCycle.length];
}
