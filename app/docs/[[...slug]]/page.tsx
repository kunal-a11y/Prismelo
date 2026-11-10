import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container, Eyebrow } from "@/components/section";
import { mdxComponents } from "@/components/docs/mdx-components";
import { DocsNavTree, DocsMobileBar } from "@/components/docs/docs-nav";
import { DocsSearch } from "@/components/docs/docs-search";
import { TableOfContents } from "@/components/docs/toc";
import {
  DOC_NAV,
  extractHeadings,
  getDoc,
  getDocNavigation,
  getDocSlugs,
  getSearchIndex,
} from "@/lib/docs";

type Params = { slug?: string[] };

export function generateStaticParams(): Params[] {
  return [{ slug: [] }, ...getDocSlugs().map((slug) => ({ slug: slug.split("/") }))];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) return { title: "Documentation" };
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: doc.href },
    openGraph: {
      title: `${doc.title} — Prismelo docs`,
      description: doc.description,
    },
  };
}

export default async function DocsPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();

  const headings = extractHeadings(doc.content);
  const { previous, next } = getDocNavigation(doc.href);
  const searchIndex = getSearchIndex();
  const groups = DOC_NAV.map((group) => ({
    title: group.title,
    items: group.items.map((item) => ({
      title: item.title,
      href: item.slug ? `/docs/${item.slug}` : "/docs",
    })),
  }));

  return (
    <>
      <header className="relative border-b border-line">
        <div className="page-shell pt-28 pb-8 md:pt-32">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-faint">
            <Link href="/docs" className="transition-colors hover:text-white">
              Documentation
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-muted">{doc.group}</span>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-8">
              <h1 className="t-h2 max-w-3xl text-white">{doc.title}</h1>
              <p className="t-lead mt-4 max-w-xl text-[15px] md:text-base">
                {doc.description}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-2 border border-line px-2.5 py-1">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${doc.status === "Published" ? "bg-white" : "border border-white"}`}
                  />
                  <span className="t-mono text-faint">{doc.status}</span>
                </span>
                <span className="t-mono text-faint">
                  {headings.length} SECTION{headings.length === 1 ? "" : "S"}
                </span>
              </div>
            </div>

            <div className="hidden lg:col-span-4 lg:col-start-9 lg:block">
              <Eyebrow className="mb-4">Documentation</Eyebrow>
              <p className="text-[12.5px] leading-relaxed text-faint">
                Operational reference for Prismelo services, products and the
                systems behind this website.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 lg:hidden">
            <DocsMobileBar groups={groups} />
            <DocsSearch index={searchIndex} />
          </div>
        </div>
      </header>

      <Container>
        <div className="grid gap-12 py-10 md:py-14 lg:grid-cols-[236px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[236px_minmax(0,1fr)_200px]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pb-10 pr-1">
              <DocsSearch index={searchIndex} />
              <div className="mt-7">
                <DocsNavTree groups={groups} />
              </div>
            </div>
          </aside>

          <article className="min-w-0">
            <div className="prose-prismelo">
              <MDXRemote
                source={doc.content}
                components={mdxComponents}
                options={{
                  // Docs are authored in this repository and therefore trusted.
                  // Component props (e.g. <Steps items={[...]} />) are required,
                  // while dangerous globals stay blocked.
                  blockJS: false,
                  blockDangerousJS: true,
                  mdxOptions: {
                    rehypePlugins: [rehypeSlug],
                  },
                }}
              />
            </div>

            <div className="mt-14 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
              {previous ? (
                <Link
                  href={previous.href}
                  className="group flex flex-col gap-2 border border-line p-4 transition-colors hover:border-[#3a3a3a] hover:bg-white/[0.02]"
                >
                  <span className="t-mono inline-flex items-center gap-1.5 text-faint">
                    <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                    Previous
                  </span>
                  <span className="text-[13.5px] text-white">
                    {previous.title}
                  </span>
                </Link>
              ) : (
                <div className="hidden sm:block" />
              )}

              {next ? (
                <Link
                  href={next.href}
                  className="group flex flex-col items-end gap-2 border border-line p-4 text-right transition-colors hover:border-[#3a3a3a] hover:bg-white/[0.02]"
                >
                  <span className="t-mono inline-flex items-center gap-1.5 text-faint">
                    Next
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </span>
                  <span className="text-[13.5px] text-white">{next.title}</span>
                </Link>
              ) : null}
            </div>

            <p className="mt-8 text-[12px] leading-relaxed text-faint">
              Something unclear or out of date? Email{" "}
              <a
                href="mailto:hello@prismelo.tech"
                className="text-muted underline decoration-[#3a3a3a] underline-offset-4 transition-colors hover:text-white hover:decoration-white"
              >
                hello@prismelo.tech
              </a>{" "}
              with the article title.
            </p>
          </article>

          <TableOfContents headings={headings} />
        </div>
      </Container>
    </>
  );
}
