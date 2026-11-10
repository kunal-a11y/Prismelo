import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader } from "@/components/section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Prismelo handles information submitted through this website, and what it does not collect.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  { id: "scope", title: "Scope of this policy" },
  { id: "data", title: "Information this site processes" },
  { id: "why", title: "Why it is processed" },
  { id: "sharing", title: "Sharing and providers" },
  { id: "retention", title: "Retention" },
  { id: "rights", title: "Your choices and rights" },
  { id: "security", title: "Security" },
  { id: "community", title: "Community and accounts" },
  { id: "changes", title: "Changes to this policy" },
  { id: "contact", title: "Contact" },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        lead="What this website processes, why it processes it, and what it deliberately does not do."
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
            <h2 id="scope">Scope of this policy</h2>
            <p>
              This policy covers the website at prismelo.tech. It does not cover
              client engagements, which are governed by the written agreement for
              that work, or products operated by other companies in the group,
              which publish their own policies.
            </p>

            <h2 id="data">Information this site processes</h2>
            <p>
              <strong>Contact form.</strong> If you submit the enquiry form, the
              site processes the name, email address, optional company name,
              selected service and project details you provide.
            </p>
            <p>
              <strong>Technical data.</strong> The server records standard
              request information — IP address, timestamp, requested path and
              user agent — in order to serve the site, apply rate limits to the
              contact form and detect abuse.
            </p>
            <p>
              <strong>Community account.</strong> If you register for the
              community, the site stores your display name, public handle, email
              address and a salted password hash. Your email address is never
              shown publicly. Your threads, replies and the time you posted them
              are stored and visible to anyone reading the community.
            </p>
            <p>
              <strong>Email notifications.</strong> If you subscribe to new
              articles, or create a community account, the site stores your email
              address so it can send article notifications and replies to
              discussions you started or joined. Every article email contains an
              unsubscribe link, and the site keeps a short delivery log (recipient,
              subject, timestamp and whether the message was accepted by the email
              provider). Addresses are only collected when you type one in — the
              site cannot and does not obtain them from visitors in any other way.
            </p>
            <p>
              <strong>What this site does not do.</strong> It sets no analytics or
              advertising cookies, builds no visitor profiles, embeds no
              third-party tracking scripts, and does not fingerprint browsers.
            </p>

            <h2 id="why">Why it is processed</h2>
            <ul>
              <li>
                To respond to your enquiry and, if work follows, to manage that
                correspondence.
              </li>
              <li>
                To protect the site against spam, automated abuse and denial of
                service.
              </li>
              <li>
                To meet obligations that apply to the operation of the website.
              </li>
            </ul>
            <p>
              Enquiry data is not used for marketing unrelated to your message,
              and it is not sold.
            </p>

            <h2 id="sharing">Sharing and providers</h2>
            <p>
              Information is shared only with service providers necessary to
              operate the site:
            </p>
            <ul>
              <li>
                <strong>Hosting and infrastructure</strong> — the platform serving
                this website stores request logs as part of normal operation.
              </li>
              <li>
                <strong>Email delivery</strong> — where configured, contact form
                submissions and community notification emails are transmitted
                through a transactional email relay (Brevo). The provider
                receives the recipient address and message content for delivery.
              </li>
            </ul>
            <p>
              These providers process data on Prismelo&apos;s behalf. No data is
              sold, rented or shared for advertising.
            </p>

            <h2 id="retention">Retention</h2>
            <p>
              Enquiry correspondence is kept only as long as needed to handle the
              conversation and any resulting engagement, after which it is
              deleted or archived according to ordinary business record practice.
              Server logs are retained for a short operational period.
            </p>
            <p>
              Community accounts, threads, replies and email subscriptions are
              kept until you ask for them to be removed. Unsubscribing stops
              article emails immediately; asking for account deletion removes the
              account, its public posts and the associated email address. The
              delivery log is capped and holds only the most recent entries.
            </p>

            <h2 id="rights">Your choices and rights</h2>
            <p>
              You may ask what information Prismelo holds about you, request a
              correction, or ask for it to be deleted. Write to{" "}
              <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> with
              enough detail to identify your enquiry. Requests are answered
              within a reasonable period, subject to any legal obligation to
              retain specific records.
            </p>
            <p>
              You can also simply choose not to submit the form — the rest of the
              website is readable without providing any personal information, and
              no account is needed to read the community.
            </p>
            <p>
              To unsubscribe from article emails, use the link in any article
              email or open <Link href="/unsubscribe">the unsubscribe page</Link>.
              Reply notifications stop when the account is deleted.
            </p>

            <h2 id="security">Security</h2>
            <p>
              The site is served over TLS. Form submissions are validated on the
              server, rate limited, and never rendered as raw HTML. Credentials
              and API keys used by the site are held server-side and are not
              exposed to the browser.
            </p>
            <p>
              No system is perfectly secure. If you believe you have found a
              vulnerability, please use the{" "}
              <Link href="/docs/services/security-disclosure">
                responsible disclosure
              </Link>{" "}
              process rather than the contact form.
            </p>

            <h2 id="community">Community and accounts</h2>
            <p>
              The community is a working forum. Reading is open to everyone;
              posting requires an account. Registration stores the details listed
              above, and anything you post is public and attributed to your
              display name and handle. Passwords are stored only as salted scrypt
              hashes and cannot be read back, by Prismelo or anyone else.
            </p>
            <p>
              Do not post personal data about other people, live vulnerability
              details or confidential material. Content can be removed by a
              moderator, and accounts that abuse the forum can be closed.
            </p>

            <h2 id="changes">Changes to this policy</h2>
            <p>
              If the way this site processes information changes, this page is
              updated before the change takes effect and the date at the top
              changes. Subscribers and community members are emailed a short
              notice with a link to the revised page when the change is material.
              Each notice is sent deliberately, by a person, after the page has
              been reviewed — never automatically on every edit.
            </p>

            <h2 id="contact">Contact</h2>
            <p>
              Questions about this policy can be sent to{" "}
              <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
            </p>
            <p>
              See also the <Link href="/terms">Terms of Service</Link>.
            </p>
          </article>
        </div>
      </Container>
    </>
  );
}
