import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import { ArrowLeft, ArrowUpRight, Info } from "lucide-react";
import { Container, CtaSection, Eyebrow } from "@/components/section";
import { mdxComponents } from "@/components/docs/mdx-components";
import { ResourceArt } from "@/components/resources/resources-index";
import {
  getRelatedResources,
  getResource,
  getResourceSlugs,
} from "@/lib/resources";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return getResourceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resource = getResource(slug);
  if (!resource) return { title: "Article not found" };
  return {
    title: resource.meta.title,
    description: resource.meta.description,
    alternates: { canonical: `/resources/${slug}` },
    openGraph: {
      type: "article",
      title: resource.meta.title,
      description: resource.meta.description,
      publishedTime: resource.meta.date,
    },
  };
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = getResource(slug);
  if (!resource) notFound();

  const { meta, content } = resource;
  const related = getRelatedResources(meta.slug);

  return (
    <>
      <header className="border-b border-line">
        <Container className="pt-28 pb-12 md:pt-32 md:pb-16">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-faint transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" aria-hidden="true" />
            Resources
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="t-mono border border-line px-2.5 py-1 text-white">
                  {meta.category.toUpperCase()}
                </span>
                <span className="t-mono text-faint">
                  {formatDate(meta.date)}
                </span>
                <span className="t-mono text-faint">
                  {meta.readingTime} MIN READ
                </span>
              </div>

              <h1 className="t-h1 mt-6 max-w-[22ch] text-white">
                {meta.title}
              </h1>
              <p className="t-lead mt-6 max-w-xl">{meta.description}</p>

              <div className="mt-7 inline-flex items-start gap-2.5 border border-dashed border-[#2a2a2a] px-3.5 py-2.5">
                <Info className="mt-0.5 h-3 w-3 shrink-0 text-faint" aria-hidden="true" />
                <p className="text-[11.5px] leading-relaxed text-faint">
                  Sample article — published to demonstrate the format, not as
                  company news.
                </p>
              </div>
            </div>

            <div className="lg:col-span-3 lg:col-start-10">
              <ResourceArt category={meta.category} className="aspect-square" />
            </div>
          </div>
        </Container>
      </header>

      <Container>
        <div className="grid gap-12 py-12 md:py-16 lg:grid-cols-12 lg:gap-12">
          <article className="min-w-0 lg:col-span-8">
            <div className="prose-prismelo max-w-[68ch]">
              <MDXRemote
                source={content}
                components={mdxComponents}
                options={{
                  blockJS: false,
                  blockDangerousJS: true,
                  mdxOptions: { rehypePlugins: [rehypeSlug] },
                }}
              />
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
              <p className="text-[12px] text-faint">
                Written by Prismelo. Corrections to{" "}
                <a
                  href="mailto:hello@prismelo.tech"
                  className="text-muted underline decoration-[#3a3a3a] underline-offset-4 hover:text-white"
                >
                  hello@prismelo.tech
                </a>
                .
              </p>
              <Link
                href="/resources"
                className="inline-flex items-center gap-1.5 text-[12px] text-muted transition-colors hover:text-white"
              >
                All articles
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </article>

          <aside className="lg:col-span-3 lg:col-start-10">
            <div className="lg:sticky lg:top-24">
              <Eyebrow className="mb-4">Related reading</Eyebrow>
              <ul className="border-t border-line">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/resources/${item.slug}`}
                      className="group block border-b border-line py-4"
                    >
                      <span className="t-mono text-faint">
                        {item.category.toUpperCase()}
                      </span>
                      <span className="mt-1.5 block text-[13px] leading-snug text-white group-hover:text-muted">
                        {item.title}
                      </span>
                      <span className="t-mono mt-2 block text-faint">
                        {item.readingTime} MIN
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Container>

      <CtaSection
        title="Working through something similar?"
        text="Describe the system and the constraint. We will tell you what we would look at first."
      />
    </>
  );
}
