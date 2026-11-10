"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/section";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="relative">
      <Container className="flex min-h-[78vh] flex-col justify-center py-32">
        <p className="t-mono text-faint">ERROR / UNEXPECTED</p>
        <h1 className="t-h1 mt-8 max-w-[20ch] text-white">
          Something failed to load.
        </h1>
        <p className="t-lead mt-6 max-w-md">
          This page hit an error while rendering. You can try again, or continue
          from another part of the site.
        </p>
        {error.digest ? (
          <p className="t-mono mt-5 text-faint">REFERENCE — {error.digest}</p>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center rounded-full bg-white px-5 text-[13.5px] font-medium text-black transition-colors hover:bg-[#e2e2e2]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-full border border-line px-5 text-[13.5px] text-white transition-colors hover:border-white/40"
          >
            Back to home
          </Link>
          <a
            href="mailto:hello@prismelo.tech"
            className="inline-flex h-11 items-center rounded-full border border-line px-5 text-[13.5px] text-white transition-colors hover:border-white/40"
          >
            Report the problem
          </a>
        </div>
      </Container>
    </section>
  );
}
