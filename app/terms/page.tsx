import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader } from "@/components/section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms governing use of the Prismelo.tech website, its content and the community section.",
  alternates: { canonical: "/terms" },
};

const sections = [
  { id: "acceptance", title: "Acceptance" },
  { id: "use", title: "Permitted use" },
  { id: "security-testing", title: "Security testing" },
  { id: "content", title: "Content and intellectual property" },
  { id: "community", title: "Community content" },
  { id: "third-party", title: "Third-party links" },
  { id: "no-warranty", title: "No warranty" },
  { id: "liability", title: "Limitation of liability" },
  { id: "engagements", title: "Client engagements" },
  { id: "changes", title: "Changes" },
  { id: "contact", title: "Contact" },
];

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        lead="The terms that apply to using this website. Commercial work is governed by a separate written agreement."
      >
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line pt-6">
          <p className="t-mono text-faint">LAST UPDATED — NOVEMBER 2026</p>
          <p className="t-mono text-faint">APPLIES TO — PRISMELO TECHNOLOGY</p>
        </div>
      </PageHeader>

      <Container>
        <div className="grid gap-12 py-12 md:py-16 lg:grid-cols-12 lg:gap-12">
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <p className="t-label mb-4 text-faint">Contents</p>
              <ul className="border-l border-line">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="-ml-px block border-l border-transparent py-1.5 pl-3.5 text-[12.5px] leading-snug text-muted transition-colors hover:border-[#4a4a4a] hover:text-white"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <article className="prose-prismelo max-w-[70ch] lg:col-span-8">
            <h2 id="acceptance">Acceptance</h2>
            <p>
              By using prismelo.tech you agree to these terms. If you do not agree,
              please stop using the site. These terms apply to the website only;
              they are not a service agreement.
            </p>

            <h2 id="use">Permitted use</h2>
            <p>
              You may read, link to and quote this site for legitimate purposes,
              with attribution. You may not:
            </p>
            <ul>
              <li>
                use the site unlawfully, or in a way that interferes with its
                availability for others;
              </li>
              <li>
                scrape it at a volume that degrades service, or bypass rate limits;
              </li>
              <li>
                misrepresent Prismelo, its services or its relationship to other
                companies;
              </li>
              <li>
                use the Prismelo name or symbol in a way that implies endorsement
                without written permission.
              </li>
            </ul>

            <h2 id="security-testing">Security testing</h2>
            <p>
              You may not perform security testing against this site without
              written authorization. Authorized research is welcome through the{" "}
              <Link href="/docs/services/security-disclosure">
                responsible disclosure
              </Link>{" "}
              process, which sets out scope and safe harbour.
            </p>

            <h2 id="content">Content and intellectual property</h2>
            <p>
              The text, design, code and graphics on this site are owned by
              Prismelo.tech unless stated otherwise. Brand usage rules are
              documented on the{" "}
              <Link href="/docs/company/brand">brand page</Link>.
            </p>
            <p>
              Articles under <Link href="/resources">Resources</Link> are sample
              material published for demonstration and may be changed or removed
              at any time. Community threads and replies are written by members:
              the author keeps ownership of their words and grants Prismelo a
              non-exclusive licence to display and moderate them on this site.
            </p>

            <h2 id="community">Community content</h2>
            <p>
              The community is a working forum. Accounts are required to post.
              You are responsible for what you publish and must not post unlawful
              content, other people&apos;s personal data, live vulnerability details,
              spam or advertising. Keep discussion technical and on topic.
            </p>
            <p>
              Prismelo may lock or remove threads, remove replies and close
              accounts that break these rules. Moderation is deliberately manual;
              there is no guarantee that any particular post stays online. Posts
              are public and may be indexed by search engines.
            </p>

            <h2 id="third-party">Third-party links</h2>
            <p>
              This site links to other websites, including companies in the group
              such as HirenextAI. Those sites are not controlled by Prismelo, and
              their own terms and privacy policies apply. A link is not an
              endorsement of every claim made on the destination site.
            </p>

            <h2 id="no-warranty">No warranty</h2>
            <p>
              The website is provided &quot;as is&quot;. While care is taken to keep
              information accurate, Prismelo does not warrant that the site will be
              uninterrupted, error free, or that every statement is complete.
              Documentation describes current practice and may change.
            </p>

            <h2 id="liability">Limitation of liability</h2>
            <p>
              To the extent permitted by applicable law, Prismelo is not liable for
              indirect or consequential loss arising from use of this website or
              reliance on its content. Nothing in these terms excludes liability
              that cannot lawfully be excluded.
            </p>

            <h2 id="engagements">Client engagements</h2>
            <p>
              Services are delivered under a separate written engagement
              agreement, which governs scope, deliverables, fees, confidentiality
              and intellectual property for that work. Where that agreement
              conflicts with these terms, the engagement agreement prevails.
            </p>

            <h2 id="changes">Changes</h2>
            <p>
              These terms may be updated as the site changes. The date at the top
              of this page reflects the current version. Where a change is
              material, subscribers and community members are emailed a short
              notice linking to the revised page before it takes effect.
              Continued use after a change constitutes acceptance of the revised
              terms.
            </p>

            <h2 id="contact">Contact</h2>
            <p>
              Questions about these terms can be sent to{" "}
              <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>. See
              also the <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </article>
        </div>
      </Container>
    </>
  );
}
