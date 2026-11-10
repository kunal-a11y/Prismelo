"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Star,
} from "lucide-react";
import { Button } from "@/components/button";
import { POST_CATEGORIES } from "@/lib/post-categories";

export type PostFormValues = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  featured: boolean;
  draft: boolean;
  body: string;
};

type Mode = "create" | "edit";

const inputClass =
  "w-full rounded-md border border-line bg-[#050505] px-3.5 text-[14px] text-white outline-none transition-colors placeholder:text-[#565656] focus:border-white/45 aria-[invalid=true]:border-white/70";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

export function PostForm({
  mode,
  initial,
  justSaved = false,
}: {
  mode: Mode;
  initial?: PostFormValues;
  justSaved?: boolean;
}) {
  const router = useRouter();
  const uid = useId();

  const [values, setValues] = useState<PostFormValues>(
    initial ?? {
      slug: "",
      title: "",
      description: "",
      category: "Engineering",
      date: today(),
      featured: false,
      draft: true,
      body: "",
    },
  );
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [errors, setErrors] = useState<Partial<Record<keyof PostFormValues, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(justSaved);

  const slug = slugTouched && values.slug ? values.slug : slugify(values.title);
  const words = useMemo(
    () => values.body.trim().split(/\s+/).filter(Boolean).length,
    [values.body],
  );
  const minutes = Math.max(1, Math.round(words / 220));

  function update<K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);
    setSaved(false);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof PostFormValues, string>> = {};
    if (!values.title.trim()) nextErrors.title = "Add a title.";
    if (!values.description.trim()) nextErrors.description = "Add a one-sentence description.";
    if (!values.body.trim() || values.body.trim().length < 40)
      nextErrors.body = "Write at least a short paragraph before saving.";
    if (!slug) nextErrors.slug = "Add a title or type a URL.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date)) nextErrors.date = "Pick a date.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFormError("Check the highlighted fields.");
      return;
    }

    setPending(true);
    setErrors({});
    setFormError(null);

    try {
      const payload = {
        title: values.title.trim(),
        description: values.description.trim(),
        category: values.category,
        date: values.date,
        featured: values.featured,
        draft: values.draft,
        body: values.body,
        ...(mode === "create" ? { slug } : {}),
      };

      const response = await fetch(
        mode === "create"
          ? "/api/admin/resources"
          : `/api/admin/resources/${encodeURIComponent(initial?.slug ?? values.slug)}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const result = (await response.json()) as {
        error?: string;
        fields?: Partial<Record<keyof PostFormValues, string>>;
        post?: { slug: string };
      };

      if (!response.ok) {
        if (result.fields) setErrors(result.fields);
        setFormError(result.error ?? "Could not save the post.");
        setPending(false);
        return;
      }

      if (mode === "create" && result.post) {
        router.push(`/admin/resources/${result.post.slug}?saved=1`);
        return;
      }

      setSaved(true);
      setPending(false);
      router.refresh();
    } catch {
      setFormError("Could not reach the server. Check the connection and try again.");
      setPending(false);
    }
  }

  const postHref = `/resources/${initial?.slug ?? slug}`;
  const isPublished = !values.draft;

  return (
    <form onSubmit={onSubmit} noValidate className="mt-10 grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-8">
        {saved ? (
          <div className="mb-6 flex items-start gap-2.5 border border-line bg-[#060606] px-4 py-3">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#c3f24f]" aria-hidden="true" />
            <p className="text-[12.5px] leading-relaxed text-white">
              Saved.{" "}
              {isPublished ? (
                <>
                  It is live at{" "}
                  <Link href={postHref} className="underline decoration-[#3a3a3a] underline-offset-4">
                    {postHref}
                  </Link>
                  .
                </>
              ) : (
                "It is still a draft, so it does not appear on the site yet."
              )}
            </p>
          </div>
        ) : null}

        {formError ? (
          <div className="mb-6 flex items-start gap-2.5 border border-[#3a3a3a] bg-[#0a0a0a] px-4 py-3">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" aria-hidden="true" />
            <p className="text-[12.5px] leading-relaxed text-white">{formError}</p>
          </div>
        ) : null}

        <div className="border border-line bg-[#040404] p-6 md:p-8">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <h2 className="text-[15px] text-white">
              {mode === "create" ? "New resource" : "Edit resource"}
            </h2>
            <span className="t-mono text-faint">FIELDS MARKED * REQUIRED</span>
          </div>

          <div className="mt-6 grid gap-5">
            <div>
              <label
                htmlFor={`${uid}-title`}
                className="mb-2 block text-[12px] uppercase tracking-[0.14em] text-muted"
              >
                Title *
              </label>
              <input
                id={`${uid}-title`}
                value={values.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="Why we write runbooks"
                maxLength={160}
                aria-invalid={errors.title ? true : undefined}
                className={`${inputClass} h-12 text-[16px]`}
              />
              {errors.title ? (
                <p className="mt-2 text-[11.5px] text-white">{errors.title}</p>
              ) : null}
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between gap-4">
                <label
                  htmlFor={`${uid}-description`}
                  className="block text-[12px] uppercase tracking-[0.14em] text-muted"
                >
                  Description *
                </label>
                <span className="t-mono text-faint">{values.description.length}/220</span>
              </div>
              <textarea
                id={`${uid}-description`}
                value={values.description}
                onChange={(event) => update("description", event.target.value)}
                rows={2}
                maxLength={220}
                placeholder="One sentence that explains what the article argues."
                aria-invalid={errors.description ? true : undefined}
                className={`${inputClass} resize-y py-3 leading-relaxed`}
              />
              <p className="mt-2 text-[11.5px] text-faint">
                Shown on the article card, in search results and when the link is shared.
              </p>
              {errors.description ? (
                <p className="mt-2 text-[11.5px] text-white">{errors.description}</p>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`${uid}-slug`}
                  className="mb-2 block text-[12px] uppercase tracking-[0.14em] text-muted"
                >
                  URL
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="t-mono shrink-0 text-faint">/resources/</span>
                  <input
                    id={`${uid}-slug`}
                    value={slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      update("slug", slugify(event.target.value));
                    }}
                    disabled={mode === "edit"}
                    placeholder="why-we-write-runbooks"
                    aria-invalid={errors.slug ? true : undefined}
                    className={`${inputClass} h-11 disabled:cursor-not-allowed disabled:text-faint`}
                  />
                </div>
                {errors.slug ? (
                  <p className="mt-2 text-[11.5px] text-white">{errors.slug}</p>
                ) : (
                  <p className="mt-2 text-[11.5px] text-faint">
                    {mode === "edit"
                      ? "Fixed after the first save so existing links keep working."
                      : "Made from the title. Edit it if you want a shorter link."}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`${uid}-date`}
                  className="mb-2 block text-[12px] uppercase tracking-[0.14em] text-muted"
                >
                  Date *
                </label>
                <input
                  id={`${uid}-date`}
                  type="date"
                  value={values.date}
                  onChange={(event) => update("date", event.target.value)}
                  aria-invalid={errors.date ? true : undefined}
                  className={`${inputClass} h-11 appearance-none`}
                />
                {errors.date ? (
                  <p className="mt-2 text-[11.5px] text-white">{errors.date}</p>
                ) : null}
              </div>
            </div>

            <div>
              <label
                htmlFor={`${uid}-category`}
                className="mb-2 block text-[12px] uppercase tracking-[0.14em] text-muted"
              >
                Category
              </label>
              <select
                id={`${uid}-category`}
                value={values.category}
                onChange={(event) => update("category", event.target.value)}
                className={`${inputClass} h-11 appearance-none pr-9`}
              >
                {POST_CATEGORIES.map((category) => (
                  <option key={category} value={category} className="bg-[#0a0a0a]">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between gap-4">
                <label
                  htmlFor={`${uid}-body`}
                  className="block text-[12px] uppercase tracking-[0.14em] text-muted"
                >
                  Article *
                </label>
                <span className="t-mono text-faint">
                  {words} {words === 1 ? "WORD" : "WORDS"} · {minutes} MIN READ
                </span>
              </div>
              <textarea
                id={`${uid}-body`}
                value={values.body}
                onChange={(event) => update("body", event.target.value)}
                rows={22}
                placeholder={"Open with the argument in one paragraph.\n\n## A section heading\n\nThen the detail, lists, code and quotes."}
                aria-invalid={errors.body ? true : undefined}
                className={`${inputClass} resize-y py-4 font-mono text-[13px] leading-relaxed`}
              />
              {errors.body ? (
                <p className="mt-2 text-[11.5px] text-white">{errors.body}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <Link
              href="/admin"
              className="text-[12.5px] text-muted transition-colors hover:text-white"
            >
              Cancel
            </Link>
            <div className="flex items-center gap-3">
              {mode === "edit" && isPublished ? (
                <Link
                  href={postHref}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-[12.5px] text-muted transition-colors hover:text-white"
                >
                  Open post
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              ) : null}
              <Button type="submit" disabled={pending} withArrow={!pending}>
                {pending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    Saving
                  </>
                ) : (
                  "Save post"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <aside className="lg:col-span-4 lg:col-start-9">
        <div className="lg:sticky lg:top-24 space-y-4">
          <div className="border border-line bg-[#040404] p-5">
            <h3 className="text-[13px] text-white">Publishing</h3>

            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <span className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                <input
                  type="checkbox"
                  checked={values.draft}
                  onChange={(event) => update("draft", event.target.checked)}
                  className="peer h-4 w-4 appearance-none rounded-sm border border-[#3a3a3a] bg-[#050505] checked:border-white checked:bg-white"
                />
                <Check
                  className="pointer-events-none absolute h-3 w-3 text-black opacity-0 peer-checked:opacity-100"
                  aria-hidden="true"
                />
              </span>
              <span>
                <span className="flex items-center gap-1.5 text-[13px] text-white">
                  {values.draft ? (
                    <EyeOff className="h-3 w-3 text-faint" aria-hidden="true" />
                  ) : (
                    <Eye className="h-3 w-3 text-[#c3f24f]" aria-hidden="true" />
                  )}
                  Save as draft
                </span>
                <span className="mt-1 block text-[11.5px] leading-relaxed text-faint">
                  Drafts stay out of the site. Uncheck it to publish.
                </span>
              </span>
            </label>

            <label className="mt-4 flex cursor-pointer items-start gap-3 border-t border-line pt-4">
              <span className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                <input
                  type="checkbox"
                  checked={values.featured}
                  onChange={(event) => update("featured", event.target.checked)}
                  className="peer h-4 w-4 appearance-none rounded-sm border border-[#3a3a3a] bg-[#050505] checked:border-white checked:bg-white"
                />
                <Check
                  className="pointer-events-none absolute h-3 w-3 text-black opacity-0 peer-checked:opacity-100"
                  aria-hidden="true"
                />
              </span>
              <span>
                <span className="flex items-center gap-1.5 text-[13px] text-white">
                  <Star className="h-3 w-3 text-faint" aria-hidden="true" />
                  Feature on the index
                </span>
                <span className="mt-1 block text-[11.5px] leading-relaxed text-faint">
                  Takes the large slot at the top of /resources. Use it for one post at a time.
                </span>
              </span>
            </label>
          </div>

          <div className="border border-line bg-[#040404] p-5">
            <h3 className="text-[13px] text-white">Formatting</h3>
            <ul className="mt-3 space-y-2 text-[11.5px] leading-relaxed text-faint">
              <li>
                <code className="text-muted">## Heading</code> for a section
              </li>
              <li>
                <code className="text-muted">**bold**</code> and{" "}
                <code className="text-muted">`code`</code>
              </li>
              <li>
                <code className="text-muted">- item</code> for a list
              </li>
              <li>
                <code className="text-muted">```</code> fences for code blocks
              </li>
              <li>
                Blank line between paragraphs
              </li>
            </ul>
            <p className="mt-3 border-t border-line pt-3 text-[11.5px] leading-relaxed text-faint">
              The first line of the article is the standfirst, so make it the claim, not a
              welcome.
            </p>
          </div>
        </div>
      </aside>
    </form>
  );
}
