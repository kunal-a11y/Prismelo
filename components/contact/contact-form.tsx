"use client";

import { useId, useState } from "react";
import { AlertTriangle, ArrowRight, Check, Loader2 } from "lucide-react";
import { serviceOptions, site } from "@/lib/site";
import { cn } from "@/lib/utils";

type Fields = {
  name: string;
  email: string;
  company: string;
  service: string;
  details: string;
  website: string;
};

type Errors = Partial<Record<keyof Fields, string>>;

type Status = "idle" | "submitting" | "success" | "error" | "unconfigured";

const initialFields: Fields = {
  name: "",
  email: "",
  company: "",
  service: "",
  details: "",
  website: "",
};

const inputClass =
  "h-11 w-full rounded-md border border-line bg-[#050505] px-3.5 text-[14px] text-white outline-none transition-colors placeholder:text-[#565656] focus:border-white/45 aria-[invalid=true]:border-white/70";

function validate(fields: Fields): Errors {
  const errors: Errors = {};

  if (fields.name.trim().length < 2) {
    errors.name = "Enter your name (at least 2 characters).";
  } else if (fields.name.trim().length > 80) {
    errors.name = "Keep your name under 80 characters.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (fields.company.trim().length > 120) {
    errors.company = "Keep the company name under 120 characters.";
  }

  if (fields.details.trim().length < 20) {
    errors.details = "Add at least 20 characters about the project.";
  } else if (fields.details.trim().length > 4000) {
    errors.details = "Keep the project details under 4000 characters.";
  }

  return errors;
}

export function ContactForm() {
  const uid = useId();
  const [fields, setFields] = useState<Fields>(initialFields);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");

  const update = (key: keyof Fields) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFields((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    if (status === "error" || status === "unconfigured") setStatus("idle");
  };

  const mailtoHref = `mailto:${site.contactEmail}?subject=${encodeURIComponent(
    `Website enquiry — ${fields.service || "General"}`,
  )}&body=${encodeURIComponent(
    `Name: ${fields.name}\nEmail: ${fields.email}\nCompany: ${fields.company || "—"}\nService: ${fields.service || "—"}\n\n${fields.details}`,
  )}`;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(fields);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const first = Object.keys(nextErrors)[0];
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });

      if (response.ok) {
        setStatus("success");
        return;
      }

      if (response.status === 501) {
        setStatus("unconfigured");
        return;
      }

      setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="border border-line bg-[#060606] p-6 md:p-8">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line">
          <Check className="h-4 w-4 text-white" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-[20px] tracking-[-0.02em] text-white">
          Message received
        </h2>
        <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-muted">
          Thank you — your enquiry has been delivered. You will get a reply at
          the address you provided.
        </p>
        <button
          type="button"
          onClick={() => {
            setFields(initialFields);
            setStatus("idle");
          }}
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-[12.5px] text-white transition-colors hover:border-white/40"
        >
          Send another message
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="border border-line bg-[#040404] p-6 md:p-8">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <h2 className="text-[15px] text-white">Project enquiry</h2>
        <span className="t-mono text-faint">FIELDS MARKED * REQUIRED</span>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${uid}-name`}
            className="mb-2 block text-[12px] uppercase tracking-[0.14em] text-muted"
          >
            Name *
          </label>
          <input
            id={`${uid}-name`}
            name="name"
            value={fields.name}
            onChange={update("name")}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${uid}-name-error` : undefined}
            className={inputClass}
            placeholder="Your name"
          />
          {errors.name ? (
            <p id={`${uid}-name-error`} className="mt-2 text-[11.5px] text-white">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor={`${uid}-email`}
            className="mb-2 block text-[12px] uppercase tracking-[0.14em] text-muted"
          >
            Email *
          </label>
          <input
            id={`${uid}-email`}
            name="email"
            type="email"
            value={fields.email}
            onChange={update("email")}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${uid}-email-error` : undefined}
            className={inputClass}
            placeholder="you@company.com"
          />
          {errors.email ? (
            <p id={`${uid}-email-error`} className="mt-2 text-[11.5px] text-white">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor={`${uid}-company`}
            className="mb-2 block text-[12px] uppercase tracking-[0.14em] text-muted"
          >
            Company <span className="text-faint">(optional)</span>
          </label>
          <input
            id={`${uid}-company`}
            name="company"
            value={fields.company}
            onChange={update("company")}
            autoComplete="organization"
            aria-invalid={Boolean(errors.company)}
            aria-describedby={errors.company ? `${uid}-company-error` : undefined}
            className={inputClass}
            placeholder="Company name"
          />
          {errors.company ? (
            <p id={`${uid}-company-error`} className="mt-2 text-[11.5px] text-white">
              {errors.company}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor={`${uid}-service`}
            className="mb-2 block text-[12px] uppercase tracking-[0.14em] text-muted"
          >
            Service of interest
          </label>
          <select
            id={`${uid}-service`}
            name="service"
            value={fields.service}
            onChange={update("service")}
            className={cn(inputClass, "appearance-none pr-9")}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.9rem center",
            }}
          >
            <option value="">Not sure yet</option>
            {serviceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5">
        <label
          htmlFor={`${uid}-details`}
          className="mb-2 block text-[12px] uppercase tracking-[0.14em] text-muted"
        >
          Project details *
        </label>
        <textarea
          id={`${uid}-details`}
          name="details"
          value={fields.details}
          onChange={update("details")}
          rows={6}
          aria-invalid={Boolean(errors.details)}
          aria-describedby={
            errors.details ? `${uid}-details-error` : `${uid}-details-hint`
          }
          className="w-full resize-y rounded-md border border-line bg-[#050505] px-3.5 py-3 text-[14px] leading-relaxed text-white outline-none transition-colors placeholder:text-[#565656] focus:border-white/45 aria-[invalid=true]:border-white/70"
          placeholder="What are you building, what exists today, and what is the constraint?"
        />
        <div className="mt-2 flex items-start justify-between gap-4">
          {errors.details ? (
            <p id={`${uid}-details-error`} className="text-[11.5px] text-white">
              {errors.details}
            </p>
          ) : (
            <p id={`${uid}-details-hint`} className="text-[11.5px] text-faint">
              A few sentences is enough. Avoid sharing secrets or credentials.
            </p>
          )}
          <span className="t-mono shrink-0 text-faint">
            {fields.details.length}/4000
          </span>
        </div>
      </div>

      {/* honeypot */}
      <div className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor={`${uid}-website`}>Website</label>
        <input
          id={`${uid}-website`}
          name="website"
          value={fields.website}
          onChange={update("website")}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {status === "unconfigured" ? (
        <div
          role="status"
          className="mt-6 flex items-start gap-3 border border-line border-l-white/70 bg-[#080808] px-4 py-3.5"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-white" aria-hidden="true" />
          <div>
            <p className="text-[13px] text-white">Delivery is not configured</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
              The form validated your message, but this site has no email
              provider configured yet — so nothing was sent. Your text is
              preserved below; send it directly instead.
            </p>
            <a
              href={mailtoHref}
              className="u-link mt-3 inline-block text-[12.5px] text-white"
            >
              Email {site.contactEmail} instead
            </a>
          </div>
        </div>
      ) : null}

      {status === "error" ? (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 border border-line border-l-white/70 bg-[#080808] px-4 py-3.5"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-white" aria-hidden="true" />
          <div>
            <p className="text-[13px] text-white">The message could not be sent</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
              Something failed while submitting. Please try again, or email{" "}
              <a href={`mailto:${site.contactEmail}`} className="text-white underline underline-offset-4">
                {site.contactEmail}
              </a>{" "}
              directly.
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <p className="max-w-[38ch] text-[11px] leading-relaxed text-faint">
          By submitting, you agree that Prismelo may use these details to respond
          to your enquiry. See the{" "}
          <a href="/privacy" className="text-muted underline underline-offset-4 hover:text-white">
            privacy policy
          </a>
          .
        </p>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[13.5px] font-medium text-black transition-colors hover:bg-[#e2e2e2] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Sending
            </>
          ) : (
            <>
              Send message
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
