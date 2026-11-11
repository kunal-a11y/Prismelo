import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { Container, PageHeader, Section } from "@/components/section";
import { DiscussionList } from "@/components/community/discussion-list";
import { CategoryNav } from "@/components/community/ui";
import { getCategory } from "@/lib/community";
import { discussionsByCategory } from "@/lib/community-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const found = getCategory(category);
  if (!found) return { title: "Category not found" };
  return {
    title: `${found.name} — Community`,
    description: found.description,
    alternates: { canonical: `/community/c/${found.slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const found = getCategory(category);
  if (!found) notFound();

  const items = await discussionsByCategory(found.slug);

  return (
    <>
      <PageHeader
        eyebrow={`Community / ${found.name}`}
        title={found.name}
        lead={found.description}
        aside={
          <div className="flex flex-col items-start gap-4 lg:pt-2">
            <Link
              href={`/community/new?category=${found.slug}`}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[13.5px] font-medium text-black transition-colors hover:bg-[#e2e2e2]"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Start a discussion
            </Link>
            <Link
              href="/community"
              className="inline-flex items-center gap-2 text-[13px] text-muted transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              All discussions
            </Link>
          </div>
        }
      />

      <Section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              {items.length === 0 ? (
                <div className="border border-dashed border-[#242424] px-6 py-16 text-center">
                  <p className="text-[14px] text-white">No discussions in this category yet</p>
                  <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
                    This category is empty. Start the first thread and it will appear here.
                  </p>
                  <Link
                    href={`/community/new?category=${found.slug}`}
                    className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-medium text-black transition-colors hover:bg-[#e2e2e2]"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    Start a discussion
                  </Link>
                </div>
              ) : (
                <DiscussionList items={items} showCategory={false} />
              )}
            </div>

            <aside className="lg:col-span-3 lg:col-start-10">
              <div className="lg:sticky lg:top-24">
                <CategoryNav active={found.slug} />
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
