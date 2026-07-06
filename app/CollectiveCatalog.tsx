"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FILTERS, filterOffers, findOffer, type Offer } from "@/lib/offers";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./BrandLogo";
import { OfferModal } from "./OfferModal";

const GENERAL_OFFER: Offer = {
  id: "general",
  name: "Goflow",
  fullName: "Talk to Goflow",
  wordmark: "Goflow",
  brand: "#536DFE",
  type: "General inquiry",
  filters: [],
  tags: [],
  description:
    "Not sure which channel fits? Tell us about your brand and we'll point you to the programs that make sense — and open the right doors.",
  whoItsFor: "",
  requirements: [],
  process: [],
  collect: [
    { name: "interest", label: "What are you interested in?", type: "text" },
  ],
};

function resolve(id: string | null): Offer | null {
  if (id === "general") return GENERAL_OFFER;
  return findOffer(id) ?? null;
}

export function CollectiveCatalog({ offers }: { offers: Offer[] }) {
  const [active, setActive] = useState<string>("All");
  const [selected, setSelected] = useState<Offer | null>(null);

  const visible = useMemo(() => filterOffers(offers, active), [offers, active]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: offers.length };
    for (const f of FILTERS) {
      if (f === "All") continue;
      map[f] = offers.filter((o) => o.filters.includes(f)).length;
    }
    return map;
  }, [offers]);

  // Open from ?offer= on first load (shareable links).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("offer");
    const match = resolve(id);
    if (match) setSelected(match);
  }, []);

  const open = useCallback((offer: Offer) => {
    setSelected(offer);
    const url = new URL(window.location.href);
    url.searchParams.set("offer", offer.id);
    window.history.replaceState(null, "", url);
  }, []);

  const close = useCallback(() => {
    setSelected(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("offer");
    window.history.replaceState(null, "", url);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/goflowlogo.svg" alt="Goflow" className="h-4 w-auto" />
            <span className="hidden h-5 w-px bg-border sm:block" />
            <span className="hidden text-sm font-medium text-muted-foreground sm:block">
              Partner Collective
            </span>
          </div>
          <button
            type="button"
            onClick={() => open(GENERAL_OFFER)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Talk to Goflow
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-6 pt-14">
        <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-[2.75rem]">
          The Goflow Partner Collective
        </h1>
      </section>

      {/* Filters */}
      <div className="sticky top-16 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6 py-3.5">
          {FILTERS.map((f) => {
            const isActive = active === f;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActive(f)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                )}
              >
                {f}
                <span className="ml-1.5 text-xs tabular-nums opacity-60">
                  {counts[f]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-8">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {visible.map((offer) => (
            <OfferCard key={offer.id} offer={offer} onOpen={() => open(offer)} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">
            Goflow Partner Collective
          </span>
          <span>Powered by Goflow.</span>
        </div>
      </footer>

      <OfferModal offer={selected} onClose={close} />
    </div>
  );
}

function OfferCard({ offer, onOpen }: { offer: Offer; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <span
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ backgroundColor: offer.brand }}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3">
        <BrandLogo offer={offer} size={56} />
        <span className="rounded-md border border-border px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
          {offer.type}
        </span>
      </div>
      <div>
        <h3 className="text-[19px] font-extrabold leading-tight tracking-tight text-balance">
          {offer.fullName}
        </h3>
        <p className="mt-1.5 text-[14px] leading-snug text-muted-foreground">
          {offer.description}
        </p>
      </div>
      <div className="mt-auto flex flex-wrap gap-1.5">
        {offer.tags.slice(0, 3).map((t) => (
          <span
            key={t}
            className="rounded-md bg-muted px-2 py-0.5 text-[11.5px] font-medium text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>
    </button>
  );
}
