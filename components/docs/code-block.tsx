"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { ReactNode } from "react";

const KEYWORDS = [
  "const", "let", "var", "function", "return", "import", "from", "export",
  "default", "async", "await", "if", "else", "for", "while", "new", "class",
  "extends", "type", "interface", "enum", "true", "false", "null", "undefined",
  "throw", "try", "catch", "finally", "public", "private", "readonly", "as",
  "in", "of", "curl", "echo", "npm", "npx", "git",
  "CREATE", "TABLE", "SELECT", "INSERT", "UPDATE", "DELETE", "WHERE", "NOT",
  "PRIMARY", "KEY", "REFERENCES", "DEFAULT", "UNIQUE", "NULL", "AND", "FROM",
];

const TOKEN = new RegExp(
  [
    "(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*|#[^\\n]*|--[^\\n]*)", // 1 comments
    "(\"(?:[^\"\\\\]|\\\\.)*\"|'(?:[^'\\\\]|\\\\.)*'|`(?:[^`\\\\]|\\\\.)*`)", // 2 strings
    `\\b(${KEYWORDS.join("|")})\\b`, // 3 keywords
    "(\\b\\d+(?:\\.\\d+)?\\b)", // 4 numbers
    "([A-Za-z_$][\\w$]*)(?=\\()", // 5 calls
  ].join("|"),
  "g",
);

function highlight(code: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  const push = (text: string, className?: string) => {
    if (!text) return;
    nodes.push(
      className ? (
        <span key={key++} className={className}>
          {text}
        </span>
      ) : (
        text
      ),
    );
  };

  while ((match = TOKEN.exec(code)) !== null) {
    push(code.slice(cursor, match.index));
    if (match[1]) push(match[1], "text-[#5c5c5c] italic");
    else if (match[2]) push(match[2], "text-[#dcdcdc]");
    else if (match[3]) push(match[3], "text-white font-medium");
    else if (match[4]) push(match[4], "text-[#b8b8b8]");
    else if (match[5]) push(match[5], "text-[#f0f0f0]");
    else push(match[0]);
    cursor = match.index + match[0].length;
  }
  push(code.slice(cursor));

  return nodes;
}

export function CodeBlock({
  code,
  language = "text",
  filename,
}: {
  code: string;
  language?: string;
  filename?: string;
}) {
  const [copied, setCopied] = useState(false);
  const cleaned = code.replace(/\n$/, "");
  const highlighted = useMemo(() => highlight(cleaned), [cleaned]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleaned);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <figure className="group/code my-6 overflow-hidden border border-line bg-[#050505]">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <figcaption className="t-mono truncate text-faint">
          {filename ?? language.toUpperCase()}
        </figcaption>
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? "Copied" : "Copy code"}
          className="inline-flex items-center gap-1.5 rounded border border-transparent px-1.5 py-1 text-[10px] uppercase tracking-[0.14em] text-faint transition-colors hover:border-line hover:text-white"
        >
          {copied ? (
            <Check className="h-3 w-3" aria-hidden="true" />
          ) : (
            <Copy className="h-3 w-3" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className="p-4 font-mono text-[12.5px] leading-[1.75] text-[#c2c2c2]">
          <code>{highlighted}</code>
        </pre>
      </div>
      <span aria-live="polite" className="sr-only">
        {copied ? "Code copied to clipboard" : ""}
      </span>
    </figure>
  );
}
