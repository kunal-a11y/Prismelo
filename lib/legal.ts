import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DATA_DIR } from "@/lib/community-store";

/**
 * Policy-change detection.
 *
 * The privacy policy and terms are source files, so a change is a code change
 * rather than an admin action. Each file is hashed, and the hash that was last
 * announced is stored. When they differ, the admin area says so and offers to
 * email subscribers — a person still decides whether the change is material.
 */

export type LegalKey = "privacy" | "terms";

export type LegalPage = {
  key: LegalKey;
  label: string;
  path: string;
  file: string;
};

export const LEGAL_PAGES: LegalPage[] = [
  {
    key: "privacy",
    label: "Privacy Policy",
    path: "/privacy",
    file: path.join(process.cwd(), "app", "privacy", "page.tsx"),
  },
  {
    key: "terms",
    label: "Terms of Service",
    path: "/terms",
    file: path.join(process.cwd(), "app", "terms", "page.tsx"),
  },
];

const STATE_FILE = path.join(DATA_DIR, "legal-state.json");

type LegalState = Partial<Record<LegalKey, { hash: string; notifiedAt: string }>>;

export function fileHash(file: string) {
  try {
    return crypto
      .createHash("sha256")
      .update(fs.readFileSync(file))
      .digest("hex")
      .slice(0, 16);
  } catch {
    return "";
  }
}

export function readLegalState(): LegalState {
  try {
    const parsed = JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) as LegalState;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function recordLegalHash(key: LegalKey) {
  const page = LEGAL_PAGES.find((entry) => entry.key === key);
  if (!page) return null;

  const hash = fileHash(page.file);
  const state = readLegalState();
  state[key] = { hash, notifiedAt: new Date().toISOString() };

  fs.mkdirSync(DATA_DIR, { recursive: true });
  const temporary = `${STATE_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  fs.renameSync(temporary, STATE_FILE);
  return hash;
}

export function legalStatus() {
  const state = readLegalState();
  return LEGAL_PAGES.map((page) => {
    const hash = fileHash(page.file);
    const recorded = state[page.key];
    return {
      ...page,
      hash,
      notifiedAt: recorded?.notifiedAt ?? null,
      // A page that has never been announced is "unrecorded", not "changed":
      // it would be wrong to email people about a policy they have never seen.
      changed: Boolean(recorded) && recorded?.hash !== hash,
      unrecorded: !recorded,
    };
  });
}
