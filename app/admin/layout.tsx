import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/section";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { isAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin",
  description: "Private publishing area.",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const authed = await isAdmin();

  return (
    <div className="min-h-[70vh] pt-16 md:pt-[72px]">
      <div className="border-b border-line bg-[#040404]">
        <Container className="flex h-12 items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="h-[5px] w-[5px] rounded-full bg-[#8b7bff]"
              style={{ boxShadow: "0 0 10px #8b7bff" }}
            />
            <span className="t-mono text-faint">PRISMELO / ADMIN</span>
          </div>

          <div className="flex items-center gap-5">
            {authed ? (
              <>
                <Link
                  href="/admin"
                  className="text-[12px] text-muted transition-colors hover:text-white"
                >
                  Posts
                </Link>
                <Link
                  href="/admin/new"
                  className="text-[12px] text-muted transition-colors hover:text-white"
                >
                  New post
                </Link>
                <Link
                  href="/admin/community"
                  className="text-[12px] text-muted transition-colors hover:text-white"
                >
                  Community
                </Link>
                <Link
                  href="/admin/notifications"
                  className="text-[12px] text-muted transition-colors hover:text-white"
                >
                  Updates
                </Link>
                <Link
                  href="/resources"
                  className="text-[12px] text-muted transition-colors hover:text-white"
                >
                  View site
                </Link>
                <SignOutButton />
              </>
            ) : (
              <span className="t-mono text-faint">RESTRICTED</span>
            )}
          </div>
        </Container>
      </div>

      {children}
    </div>
  );
}
