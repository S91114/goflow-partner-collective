"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FILTERS, findOffer, filterOffers, type Offer } from "@/lib/offers";
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
  const [selected, setSelected] = useState<Offer | null>(null);
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>("All");
  const [query, setQuery] = useState("");

  // Open from ?offer= on first load (shareable links).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("offer");
    const match = resolve(id);
    if (match) setSelected(match);
  }, []);

  const track = useCallback(
    (eventType: string, metadata: Record<string, string> = {}, offer?: Offer) => {
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          offerId: offer?.id,
          metadata,
          attribution: {
            landing_path: `${window.location.pathname}${window.location.search}`,
            referrer: document.referrer,
          },
        }),
      }).catch(() => {});
    },
    [],
  );

  const open = useCallback((offer: Offer) => {
    setSelected(offer);
    const url = new URL(window.location.href);
    url.searchParams.set("offer", offer.id);
    window.history.replaceState(null, "", url);
    track("offer_open", {}, offer);
  }, [track]);

  const close = useCallback(() => {
    setSelected(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("offer");
    window.history.replaceState(null, "", url);
  }, []);

  const visibleOffers = useMemo(() => {
    const filtered = filterOffers(offers, activeFilter);
    const q = query.trim().toLowerCase();
    if (!q) return filtered;
    return filtered.filter((offer) =>
      [
        offer.name,
        offer.fullName,
        offer.type,
        offer.description,
        offer.whoItsFor,
        ...offer.tags,
        ...offer.filters,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [activeFilter, offers, query]);

  function updateFilter(filter: (typeof FILTERS)[number]) {
    setActiveFilter(filter);
    track("filter_used", { filter });
  }

  function updateQuery(value: string) {
    setQuery(value);
    if (value.trim().length >= 2) {
      track("search_used", { query: value.trim().slice(0, 80) });
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md">
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
        <div
          className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-primary via-sky to-amber"
          aria-hidden
        />
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="brand-mesh pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 pb-7 pt-16">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" />
            Retail &amp; marketplace programs
          </p>
          <h1 className="max-w-[18ch] text-4xl font-extrabold leading-[1.04] tracking-tight text-balance sm:text-[3rem]">
            The Goflow Partner <span className="text-primary">Collective</span>
          </h1>
        </div>
      </section>

      {/* Grid */}
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-4">
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => updateFilter(filter)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <label className="relative min-w-0 md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              placeholder="Search programs"
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-[3px] focus:ring-primary/20"
            />
          </label>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {visibleOffers.map((offer, i) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              index={i}
              onOpen={() => open(offer)}
            />
          ))}
        </div>
        {visibleOffers.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <h2 className="text-xl font-extrabold">No matching programs yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a broader search or ask Goflow to point you to the right partner.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">
            Goflow Partner Collective
          </span>
          <Link href="/" className="font-semibold text-primary">
            Registration landing page
          </Link>
        </div>
      </footer>

      <OfferModal offer={selected} onClose={close} />
    </div>
  );
}

function OfferCard({
  offer,
  index,
  onOpen,
}: {
  offer: Offer;
  index: number;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={
        {
          "--brand": offer.brand,
          animationDelay: `${index * 35}ms`,
        } as React.CSSProperties
      }
      className="offer-card card-in group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 text-left shadow-sm hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
