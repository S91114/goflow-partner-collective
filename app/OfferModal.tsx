"use client";

import { useEffect, type ReactNode } from "react";
import { ArrowUpRight, Check, ShoppingBag, X } from "lucide-react";
import type { Offer } from "@/lib/offers";
import { BrandLogo } from "./BrandLogo";

export function OfferModal({
  offer,
  onClose,
  onAddToCart,
  inCart,
}: {
  offer: Offer | null;
  onClose: () => void;
  onAddToCart?: (offer: Offer) => void;
  inCart?: boolean;
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
  const currentOffer = offer;

  function trackVisitSite() {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "visit_site_click",
        offerId: currentOffer.id,
        metadata: { website: currentOffer.website ?? "" },
        attribution: {
          landing_path: `${window.location.pathname}${window.location.search}`,
          referrer: document.referrer,
        },
      }),
    }).catch(() => {});
  }

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
                onClick={trackVisitSite}
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

        {/* Right: add-only request action */}
        <div className="flex flex-col border-t border-border bg-muted/30 p-7 sm:p-9 md:border-l md:border-t-0">
          <h3 className="text-lg font-bold tracking-tight">
            Add to introduction requests
          </h3>
          <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
            You are one form away from getting a bundle of introductions. Add
            this program, then submit one profile for Goflow to route.
          </p>
          {offer.id !== "general" && onAddToCart && (
            <button
              type="button"
              onClick={() => onAddToCart(offer)}
              className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
                inCart
                  ? "border-success/25 bg-success/10 text-success"
                  : "border-primary/20 bg-primary/10 text-primary hover:bg-primary/15"
              }`}
            >
              {inCart ? (
                <>
                  <Check className="size-4" /> Added to introduction requests
                </>
              ) : (
                <>
                  <ShoppingBag className="size-4" /> Add to introduction requests
                </>
              )}
            </button>
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
