"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Check, Loader2, Send } from "lucide-react";
import type { Offer } from "@/lib/offers";

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-[3px] focus:ring-primary/20";

export function CartRequestForm({
  selectedOffers,
  onDone,
}: {
  selectedOffers: Offer[];
  onDone: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const selectedProgramNames = selectedOffers.map((offer) => offer.fullName);

    const payload = {
      offerId: "general",
      offerName: "Partner Collective Introduction Bundle",
      requestType: "general",
      selectedPrograms: selectedOffers.map((offer) => ({
        offerId: offer.id,
        offerName: offer.fullName,
      })),
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      company: String(data.get("company") || "").trim(),
      website: String(data.get("website") || "").trim(),
      details: {
        "Selected programs": selectedProgramNames.join("; "),
        "Program count": String(selectedOffers.length),
        Phone: String(data.get("phone") || "").trim(),
        WhatsApp: String(data.get("whatsapp") || "").trim(),
        "Amazon store": String(data.get("amazonStore") || "").trim(),
        "Priority or notes": String(data.get("notes") || "").trim(),
      },
      attribution: {
        landing_path: `${window.location.pathname}${window.location.search}`,
        referrer: document.referrer,
      },
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/program-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "We couldn't submit these requests yet.");
        return;
      }
      setDone(payload.name.split(" ")[0] || "there");
      onDone();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-border bg-muted/50 p-6 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-success/10 text-success">
          <Check className="size-6" />
        </div>
        <h3 className="mt-4 text-xl font-extrabold">
          Introduction requests sent
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Thanks, {done}. Goflow received your selected programs and will route
          the right partner path from here.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col">
      <Field label="Your name" required>
        <input
          name="name"
          required
          autoComplete="name"
          placeholder="Jordan Rivera"
          className={inputCls}
        />
      </Field>
      <Field label="Work email" required>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@brand.com"
          className={inputCls}
        />
      </Field>
      <Field label="Brand / company" required>
        <input
          name="company"
          required
          autoComplete="organization"
          placeholder="Your brand"
          className={inputCls}
        />
      </Field>
      <Field label="Website">
        <input name="website" placeholder="yourbrand.com" className={inputCls} />
      </Field>
      <Field label="Phone number" required>
        <input
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="+1 555 123 4567"
          className={inputCls}
        />
      </Field>
      <Field label="WhatsApp number">
        <input
          name="whatsapp"
          type="tel"
          autoComplete="tel"
          placeholder="If different from phone"
          className={inputCls}
        />
      </Field>
      <Field label="Amazon store">
        <input
          name="amazonStore"
          placeholder="amazon.com/your-store"
          className={inputCls}
        />
      </Field>
      <Field label="Notes or priority">
        <textarea
          name="notes"
          rows={3}
          placeholder="Tell us what you want to prioritize first."
          className={inputCls}
        />
      </Field>

      {error && (
        <p className="mt-3 text-[12.5px] font-medium text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting || selectedOffers.length === 0}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Sending introductions
          </>
        ) : (
          <>
            Send introduction requests <Send className="size-4" />
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
  children: ReactNode;
}) {
  return (
    <label className="mt-3.5 flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">
        {label}
        {required && <span className="text-primary"> *</span>}
      </span>
      {children}
    </label>
  );
}
