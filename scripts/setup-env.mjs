#!/usr/bin/env node
/**
 * Writes the environment file the site needs, from values you paste in.
 *
 * Nothing secret is ever committed: the file this script creates is already in
 * .gitignore. Run it once on each machine or server:
 *
 *   npm run setup:env              # writes .env.production (for npm start)
 *   npm run setup:env -- --local   # writes .env.local (for npm run dev)
 *
 * Existing values are offered back as defaults and never echoed in full.
 * In CI (no terminal) every field is read from the environment instead.
 */

import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { chmod, writeFile } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline/promises";

const FIELDS = [
  {
    key: "SMTP_HOST",
    label: "SMTP host",
    fallback: "smtp-relay.brevo.com",
    hint: "Brevo relay, or your own mail server",
  },
  {
    key: "SMTP_PORT",
    label: "SMTP port",
    fallback: "587",
    hint: "587 STARTTLS · 465 TLS · 2525 alternative",
    validate: (value) => {
      const port = Number(value);
      return Number.isInteger(port) && port > 0 && port < 65536
        ? null
        : "Port must be a number between 1 and 65535.";
    },
  },
  {
    key: "SMTP_USER",
    label: "SMTP login",
    hint: "Brevo: the Login field under SMTP & API, not your account email",
  },
  { key: "SMTP_PASS", label: "SMTP key", secret: true },
  {
    key: "CONTACT_FROM_EMAIL",
    label: "From address",
    fallback: "Prismelo <hello@prismelo.tech>",
    hint: "must be a verified sender at the relay",
    validate: looksLikeAddress,
  },
  {
    key: "CONTACT_TO_EMAIL",
    label: "Enquiry destination",
    fallback: "hello@prismelo.tech",
    hint: "where contact-form messages arrive",
    validate: looksLikeAddress,
  },
  {
    key: "EMAIL_FROM",
    label: "Notification from address",
    fallback: "Prismelo <hello@prismelo.tech>",
    hint: "community and policy emails; blank reuses the from address",
    allowBlank: true,
    validate: looksLikeAddress,
  },
  {
    key: "ADMIN_PASSWORD",
    label: "Admin password",
    secret: true,
    hint: "/admin publishing; blank disables sign-in",
    allowBlank: true,
  },
  {
    key: "ADMIN_SESSION_SECRET",
    label: "Admin session secret",
    hint: "blank generates a random one",
    allowBlank: true,
    generate: () => randomBytes(32).toString("hex"),
  },
  {
    key: "COMMUNITY_SESSION_SECRET",
    label: "Community session secret",
    hint: "blank generates a random one",
    allowBlank: true,
    generate: () => randomBytes(32).toString("hex"),
  },
];

function looksLikeAddress(value) {
  const address = value.match(/<([^>]+)>/)?.[1] ?? value;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(address.trim())
    ? null
    : "That does not look like an email address.";
}

function parseArgs(argv) {
  const target = argv.includes("--local") ? ".env.local" : ".env.production";
  const explicit = argv.find((arg) => arg.startsWith("--target="));
  return { target: explicit ? explicit.slice("--target=".length) : target };
}

function readExisting(file) {
  const values = {};
  if (!existsSync(file)) return values;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    values[match[1]] = match[2].replace(/^["']|["']$/g, "").trim();
  }
  return values;
}

function mask(value) {
  if (!value) return "";
  if (value.length <= 4) return "••••";
  return `${value.slice(0, 2)}••••${value.slice(-2)}`;
}

function sameAsGenerated(value) {
  return /^[a-f0-9]{64}$/.test(value);
}

function quote(value) {
  return /[\s#"'<>]/.test(value) ? `"${value.replace(/"/g, '\\"')}"` : value;
}

async function main() {
  const { target } = parseArgs(process.argv.slice(2));
  const file = path.resolve(process.cwd(), target);
  const existing = readExisting(file);
  const interactive = Boolean(process.stdin.isTTY);

  if (existsSync(file) && !interactive) {
    // Re-running in CI should be a deliberate act, not an accident.
    if (process.env.SETUP_ENV_OVERWRITE !== "1") {
      console.error(
        `${target} already exists. Set SETUP_ENV_OVERWRITE=1 to replace it.`,
      );
      process.exitCode = 1;
      return;
    }
  }

  const answers = {};
  const rl = interactive
    ? createInterface({ input: process.stdin, output: process.stdout })
    : null;

  try {
    if (rl) {
      console.log(`\nWriting ${target}. Press Enter to accept a default.\n`);
    }

    for (const field of FIELDS) {
      const previous = existing[field.key] ?? "";
      const fallback = previous || field.fallback || "";
      let value = "";

      if (rl) {
        const shown = field.secret
          ? previous
            ? ` (saved: ${mask(previous)}, Enter keeps it)`
            : ""
          : fallback
            ? ` (${fallback})`
            : "";
        const prompt = `${field.label}${shown}${field.hint ? `\n  ${field.hint}` : ""}\n> `;

        for (;;) {
          const answer = (await rl.question(prompt)).trim();
          if (answer) value = answer;
          else if (field.generate && !fallback) value = field.generate();
          else value = fallback;

          const problem = value && field.validate ? field.validate(value) : null;
          if (problem) {
            console.log(`  ${problem}\n`);
            continue;
          }
          if (!value && !field.allowBlank) {
            console.log("  This one is needed, or email stays disabled.\n");
            break;
          }
          break;
        }
      } else {
        const fromEnvironment = process.env[field.key]?.trim() ?? "";
        value =
          fromEnvironment ||
          fallback ||
          (field.generate ? field.generate() : "");
      }

      answers[field.key] = value;
    }
  } finally {
    rl?.close();
  }

  const lines = [
    "# Written by `npm run setup:env` — never commit this file.",
    `# ${new Date().toISOString()}`,
    "",
    "# SMTP relay: contact form and community notifications",
    `SMTP_HOST=${quote(answers.SMTP_HOST)}`,
    `SMTP_PORT=${quote(answers.SMTP_PORT)}`,
    `SMTP_USER=${quote(answers.SMTP_USER)}`,
    `SMTP_PASS=${quote(answers.SMTP_PASS)}`,
    "",
    `CONTACT_FROM_EMAIL=${quote(answers.CONTACT_FROM_EMAIL)}`,
    `CONTACT_TO_EMAIL=${quote(answers.CONTACT_TO_EMAIL)}`,
    `EMAIL_FROM=${quote(answers.EMAIL_FROM)}`,
    "",
    "# /admin publishing",
    `ADMIN_PASSWORD=${quote(answers.ADMIN_PASSWORD)}`,
    `ADMIN_SESSION_SECRET=${quote(answers.ADMIN_SESSION_SECRET)}`,
    "",
    "# Community accounts and sessions",
    `COMMUNITY_SESSION_SECRET=${quote(answers.COMMUNITY_SESSION_SECRET)}`,
    "",
  ];

  await writeFile(file, lines.join("\n"), { encoding: "utf8", flag: "w" });
  await chmod(file, 0o600).catch(() => {});

  console.log(`\nWrote ${target}\n`);
  for (const field of FIELDS) {
    const value = answers[field.key];
    const shown = !value
      ? "(blank)"
      : sameAsGenerated(value)
        ? "(generated)"
        : field.secret
          ? mask(value)
          : value;
    console.log(`  ${field.key.padEnd(24)} ${shown}`);
  }

  const emailReady = Boolean(
    answers.SMTP_HOST && answers.SMTP_USER && answers.SMTP_PASS,
  );
  console.log(
    emailReady
      ? "\nEmail delivery is configured. Restart the server, then send one test enquiry."
      : "\nNo SMTP credentials: the contact form will answer 501 until they are set.",
  );
  console.log(
    `Next: ${target === ".env.local" ? "npm run dev" : "npm run build && npm start"}\n`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
