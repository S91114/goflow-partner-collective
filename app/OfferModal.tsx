"use client";

import { useEffect, type ReactNode } from "react";
import { ArrowUpRight, Check, X } from "lucide-react";
import type { Offer } from "@/lib/offers";
import { BrandLogo } from "./BrandLogo";
import { InterestForm } from "./InterestForm";

export function OfferModal({
  offer,
  onClose,
}: {
  offer: Offer | null;
  onClose: () => void;
}) {
  const open = Boolean(offer);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!offer) return null;

  const submitLabel =
    offer.cta ??
    (offer.id === "general"
      ? "Send to Goflow"
      : `Request intro to ${offer.name}`);

  const panelTitle = offer.apply
    ? "Apply now"
    : offer.link
      ? "Join the group"
      : offer.id === "general"
        ? "Get in touch"
        : offer.cta
          ? "Request an invite"
          : "Request a warm intro";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-foreground/50 p-0 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={offer.fullName}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-in relative flex min-h-full w-full max-w-5xl flex-col overflow-hidden bg-background shadow-2xl sm:min-h-0 sm:max-h-[90vh] sm:rounded-3xl md:grid md:grid-cols-2"
      >
        <div
          className="absolute inset-x-0 top-0 z-10 h-1"
          style={{ backgroundColor: offer.brand }}
          aria-hidden
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-lg border border-border bg-background/80 text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        {/* Left: offer detail */}
        <div
          className="flex flex-col gap-6 overflow-y-auto p-7 sm:p-9"
          style={{
            background: `linear-gradient(180deg, color-mix(in srgb, ${offer.brand} 8%, transparent), transparent 220px)`,
          }}
        >
          <div>
            <BrandLogo offer={offer} size={68} />
            <span className="mt-4 inline-block w-fit rounded-md border border-border px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              {offer.type}
            </span>
            <h2 className="mt-3 text-3xl font-extrabold leading-[1.1] tracking-tight text-balance">
              {offer.fullName}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {offer.description}
            </p>
            {offer.website && (
              <a
                href={offer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex w-fit items-center gap-1 text-[13px] font-semibold text-primary hover:underline"
              >
                Visit site <ArrowUpRight className="size-3.5" />
              </a>
            )}
          </div>

          {offer.whoItsFor && (
            <Section label="Who it's for">
              <p className="text-sm text-muted-foreground">{offer.whoItsFor}</p>
            </Section>
          )}

          {offer.tags.length > 0 && (
            <Section label="Categories">
              <div className="flex flex-wrap gap-1.5">
                {offer.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-muted px-2 py-0.5 text-[11.5px] font-medium text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {offer.requirements.length > 0 && (
            <Section label="What you'll need">
              <ul className="flex flex-col gap-2">
                {offer.requirements.map((r) => (
                  <li key={r} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 flex-none text-success" />
                    {r}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {offer.process.length > 0 && (
            <Section label="How it works">
              <ol className="flex flex-col gap-2.5">
                {offer.process.map((step, i) => (
                  <li key={step} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="grid size-6 flex-none place-items-center rounded-md bg-primary/10 text-xs font-bold text-primary tabular-nums">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </Section>
          )}
        </div>

        {/* Right: apply (embedded form / link-out), join link, or interest form */}
        <div className="flex flex-col border-t border-border bg-muted/30 p-7 sm:p-9 md:border-l md:border-t-0">
          {offer.apply?.embed ? (
            <div className="flex h-full min-h-[520px] flex-col">
              <h3 className="text-lg font-bold tracking-tight">{panelTitle}</h3>
              <p className="mb-3 mt-0.5 text-[13px] text-muted-foreground">
                Complete the short application — it goes straight to the Goflow
                team.
              </p>
              <iframe
                src={offer.apply.url}
                title={`${offer.name} application`}
                loading="lazy"
                className="min-h-[520px] w-full flex-1 rounded-xl border border-border bg-white"
              />
              <a
                href={offer.apply.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Open the form in a new tab <ArrowUpRight className="size-3" />
              </a>
            </div>
          ) : offer.apply ? (
            <div className="flex h-full flex-col justify-center">
              <h3 className="text-lg font-bold tracking-tight">{panelTitle}</h3>
              <p className="mb-5 mt-1 text-[13px] text-muted-foreground">
                You&apos;ll continue to the official application in a new tab.
              </p>
              <a
                href={offer.apply.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                {offer.apply.label ?? "Apply now"}
                <ArrowUpRight className="size-4" />
              </a>
            </div>
          ) : offer.link ? (
            <div className="flex h-full flex-col justify-center">
              <h3 className="text-lg font-bold tracking-tight">{panelTitle}</h3>
              <p className="mb-5 mt-1 text-[13px] text-muted-foreground">
                Free to join — you&apos;ll open WhatsApp to accept the invite.
              </p>
              <a
                href={offer.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: offer.brand }}
              >
                {submitLabel}
                <ArrowUpRight className="size-4" />
              </a>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-bold tracking-tight">{panelTitle}</h3>
              <p className="mb-2 text-[13px] text-muted-foreground">
                Tell us about your brand — this goes straight to the Goflow team.
              </p>
              <InterestForm
                offerId={offer.id}
                offerName={offer.fullName}
                fields={offer.collect}
                submitLabel={submitLabel}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}
