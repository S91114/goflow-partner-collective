"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowUpRight, Check, Loader2, Send } from "lucide-react";
import type { CollectField } from "@/lib/offers";

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-[3px] focus:ring-primary/20";

export function InterestForm({
  offerId,
  offerName,
  fields,
  submitLabel,
  requestType,
  outboundUrl,
  outboundLabel,
}: {
  offerId: string;
  offerName: string;
  fields: CollectField[];
  submitLabel: string;
  requestType: string;
  outboundUrl?: string | null;
  outboundLabel?: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);

    const details: Record<string, string> = {};
    for (const f of fields) {
      const v = String(data.get(`f_${f.name}`) || "").trim();
      if (v) details[f.label] = v;
    }

    const payload = {
      offerId,
      offerName,
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      company: String(data.get("company") || "").trim(),
      website: String(data.get("website") || "").trim(),
      details,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/program-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          requestType,
          attribution: {
            landing_path: `${window.location.pathname}${window.location.search}`,
            referrer: document.referrer,
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        return;
      }
      setDone(payload.name.split(" ")[0] || "there");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    const eventType = requestType === "join" ? "join_click" : "partner_apply_click";
    const onContinue = () => {
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          offerId,
          metadata: { outboundUrl: outboundUrl ?? "" },
          attribution: {
            landing_path: `${window.location.pathname}${window.location.search}`,
            referrer: document.referrer,
          },
        }),
      }).catch(() => {});
    };

    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-border bg-muted/50 p-8 text-center">
        <div className="grid size-14 place-items-center rounded-full bg-success/10 text-success">
          <Check className="size-7" strokeWidth={2.5} />
        </div>
        <h4 className="mt-4 text-xl font-extrabold tracking-tight">
          Request sent
        </h4>
        <p className="mx-auto mt-2 max-w-[34ch] text-sm text-muted-foreground">
          Thanks, {done}. Your interest in <b>{offerName}</b> just landed with
          the Goflow team, who&apos;ll reach out to kick off the intro.
        </p>
        {outboundUrl && (
          <a
            href={outboundUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onContinue}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {outboundLabel ?? "Continue"}
            <ArrowUpRight className="size-4" />
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col">
      <Field label="Your name" required>
        <input name="name" required autoComplete="name" placeholder="Jordan Rivera" className={inputCls} />
      </Field>
      <Field label="Work email" required>
        <input name="email" type="email" required autoComplete="email" placeholder="you@brand.com" className={inputCls} />
      </Field>
      <Field label="Brand / company" required>
        <input name="company" required placeholder="Your brand" className={inputCls} />
      </Field>
      <Field label="Website">
        <input name="website" placeholder="yourbrand.com" className={inputCls} />
      </Field>

      {fields.map((f) => (
        <Field key={f.name} label={f.label} required={f.required}>
          {f.type === "select" ? (
            <select name={`f_${f.name}`} required={f.required} defaultValue="" className={inputCls}>
              <option value="" disabled>
                Select…
              </option>
              {f.options?.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <input name={`f_${f.name}`} required={f.required} placeholder="" className={inputCls} />
          )}
        </Field>
      ))}

      {error && (
        <p className="mt-3 text-[12.5px] font-medium text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            {submitLabel} <Send className="size-4" />
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
