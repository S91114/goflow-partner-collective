"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Check, Loader2, Send } from "lucide-react";

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-[3px] focus:ring-primary/20";

const gmvBands = [
  "Under $1M",
  "$1M - $5M",
  "$5M - $20M",
  "$20M+",
];

const categories = [
  "Apparel",
  "Beauty",
  "Electronics",
  "Home",
  "Food & Grocery",
  "Health & Wellness",
  "Toys & Baby",
  "Other",
];

export function RegistrationForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attribution, setAttribution] = useState<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAttribution({
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_term: params.get("utm_term") || "",
      utm_content: params.get("utm_content") || "",
      referrer: document.referrer,
      landing_path: `${window.location.pathname}${window.location.search}`,
    });
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const data = new FormData(e.currentTarget);
    const payload = {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      company: String(data.get("company") || ""),
      website: String(data.get("website") || ""),
      category: String(data.get("category") || ""),
      gmvBand: String(data.get("gmvBand") || ""),
      currentChannels: String(data.get("currentChannels") || ""),
      notes: String(data.get("notes") || ""),
      attribution,
    };

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "We couldn't save your profile yet.");
        return;
      }
      setDone(payload.email.trim().toLowerCase());
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-border bg-muted/50 p-6 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-success/10 text-success">
          <Check className="size-6" />
        </div>
        <h3 className="mt-4 text-xl font-extrabold">Access request saved</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          We saved your profile for <b>{done}</b>. Goflow will review your
          brand, help identify the relevant programs, and follow up before
          making any partner introductions.
        </p>
        <Link
          href="/collective"
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Preview the catalog <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3.5">
      <Field label="Full name" required>
        <input name="name" required autoComplete="name" placeholder="Jordan Rivera" className={inputCls} />
      </Field>
      <Field label="Work email" required>
        <input name="email" type="email" required autoComplete="email" placeholder="you@brand.com" className={inputCls} />
      </Field>
      <Field label="Brand / company" required>
        <input name="company" required autoComplete="organization" placeholder="Your brand" className={inputCls} />
      </Field>
      <Field label="Website" required>
        <input name="website" required placeholder="yourbrand.com" className={inputCls} />
      </Field>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Primary category" required>
          <select name="category" required defaultValue="" className={inputCls}>
            <option value="" disabled>Select category</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </Field>
        <Field label="Annual GMV" required>
          <select name="gmvBand" required defaultValue="" className={inputCls}>
            <option value="" disabled>Select range</option>
            {gmvBands.map((band) => (
              <option key={band} value={band}>{band}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Current channels">
        <input
          name="currentChannels"
          placeholder="Amazon, Shopify, Walmart..."
          className={inputCls}
        />
      </Field>
      <Field label="What are you hoping to unlock?">
        <textarea name="notes" rows={3} className={inputCls} />
      </Field>

      {error && <p className="text-[12.5px] font-medium text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Saving request
          </>
        ) : (
          <>
            Apply for access <Send className="size-4" />
          </>
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">
        {label}
        {required && <span className="text-primary"> *</span>}
      </span>
      {children}
    </label>
  );
}
