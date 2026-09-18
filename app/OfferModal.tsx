"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ArrowUpRight, Check, ShoppingBag, X } from "lucide-react";
import type { Offer } from "@/lib/offers";
import { displayText } from "@/lib/display-text";
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const applicationPaneRef = useRef<HTMLDivElement>(null);

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
  const embedsApplication = offer.apply?.embed !== false;

  function resetApplicationScroll() {
    const reset = () => {
      dialogRef.current?.scrollTo({ top: 0 });
      applicationPaneRef.current?.scrollTo({ top: 0 });
    };

    reset();
    window.setTimeout(reset, 250);
    window.setTimeout(reset, 750);
    window.setTimeout(reset, 1500);
  }

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

  function trackPartnerApply() {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "partner_apply_click",
        offerId: currentOffer.id,
        metadata: { application: currentOffer.apply?.url ?? "" },
        attribution: {
          landing_path: `${window.location.pathname}${window.location.search}`,
          referrer: document.referrer,
        },
      }),
    }).catch(() => {});
  }

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={displayText(offer.fullName)}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        aria-label="Close"
        className="fixed right-4 top-4 z-20 grid size-9 place-items-center rounded-lg border border-border bg-background/90 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground sm:hidden"
      >
        <X className="size-4" />
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-in relative flex min-h-full w-full max-w-5xl flex-col overflow-clip bg-background shadow-2xl sm:h-[min(52rem,90vh)] sm:min-h-0 sm:rounded-3xl md:grid md:grid-cols-2"
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
          className="absolute right-4 top-4 z-20 hidden size-9 place-items-center rounded-lg border border-border bg-background/90 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground sm:grid"
        >
          <X className="size-4" />
        </button>

        <div
          className={`flex flex-col gap-6 overflow-y-auto p-7 sm:p-9 ${
            offer.apply ? "order-last md:order-none" : ""
          }`}
          style={{
            backgroundColor: `color-mix(in srgb, ${offer.brand} 5%, hsl(var(--background)))`,
          }}
        >
          <div>
            <BrandLogo offer={offer} size={68} />
            <h2 className="mt-3 text-3xl font-extrabold leading-[1.1] tracking-tight text-balance">
              {displayText(offer.fullName)}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {displayText(offer.description)}
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
              <p className="text-sm text-muted-foreground">{displayText(offer.whoItsFor)}</p>
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
                    {displayText(t)}
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
                    {displayText(r)}
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
                    {displayText(step)}
                  </li>
                ))}
              </ol>
            </Section>
          )}
        </div>

        <div
          ref={applicationPaneRef}
          className={`flex min-h-[38rem] flex-col overflow-clip border-t border-border bg-muted/30 p-5 sm:p-7 md:min-h-0 md:border-l md:border-t-0 ${
            offer.apply ? "order-first md:order-none" : ""
          }`}
        >
          {offer.apply ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 pr-10">
                <div>
                  <h3 className="text-lg font-bold tracking-tight">Apply here</h3>
                  <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">
                    Apply directly below. Goflow will be in touch after you submit.
                  </p>
                </div>
                {embedsApplication && (
                  <a
                    href={offer.apply.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={trackPartnerApply}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-bold text-foreground transition-colors hover:bg-muted"
                  >
                    Open in new tab <ArrowUpRight className="size-3.5" />
                  </a>
                )}
              </div>
              {embedsApplication ? (
                <iframe
                  src={offer.apply.url}
                  title={`${displayText(offer.fullName)} application`}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  onLoad={resetApplicationScroll}
                  className="mt-4 min-h-[32rem] w-full flex-1 rounded-xl border border-border bg-background md:min-h-0"
                />
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
                  <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                    <ArrowUpRight className="size-5" />
                  </div>
                  <h4 className="mt-4 text-xl font-extrabold tracking-tight">
                    Continue to the application
                  </h4>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                    This application opens on a secure external site. Goflow will be in touch after you submit.
                  </p>
                  <a
                    href={offer.apply.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={trackPartnerApply}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Open application <ArrowUpRight className="size-4" />
                  </a>
                </div>
              )}
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold tracking-tight">Request an introduction</h3>
              <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                You are one form away from getting a bundle of introductions. Add this program, then submit one profile for Goflow to route.
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
