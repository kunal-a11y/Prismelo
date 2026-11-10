import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container, Eyebrow } from "@/components/section";
import { LoginForm } from "@/components/admin/login-form";
import { adminConfigured, isAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  const configured = adminConfigured();

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16 md:py-20">
      <div className="w-full max-w-md text-center">
        <Eyebrow tone="violet" className="justify-center">
          Publishing
        </Eyebrow>
        <h1 className="t-h2 mt-5 text-white">Admin sign in</h1>
        <p className="mx-auto mt-4 max-w-sm text-[14px] leading-relaxed text-muted">
          This area is for the people who publish articles. Everything behind it is
          private — no search engine sees these pages.
        </p>

        {configured ? (
          <LoginForm />
        ) : (
          <div className="mt-8 border border-dashed border-[#3a3a3a] p-6 text-left">
            <h2 className="text-[15px] text-white">Admin access is not set up yet</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-muted">
              This server has no admin password configured, so sign-in is disabled.
              That is deliberate — there is no default password to guess.
            </p>
            <ol className="mt-4 space-y-2 text-[12.5px] leading-relaxed text-faint">
              <li>
                1. Open <code className="text-muted">.env.local</code> in the project
                root (create it from <code className="text-muted">.env.example</code> if
                it is missing).
              </li>
              <li>
                2. Add a line:{" "}
                <code className="text-muted">ADMIN_PASSWORD=your-own-long-password</code>
              </li>
              <li>3. Restart the server, then reload this page.</li>
            </ol>
            <p className="mt-4 border-t border-line pt-4 text-[11.5px] leading-relaxed text-faint">
              Optionally set <code className="text-muted">ADMIN_SESSION_SECRET</code> to
              keep existing sessions valid when the password changes.
            </p>
          </div>
        )}
      </div>
    </Container>
  );
}
