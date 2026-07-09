"use client";

import Link from "next/link";
import {
  Check,
  ChevronRight,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FILTERS, findOffer, filterOffers, type Offer } from "@/lib/offers";
import { BrandLogo } from "./BrandLogo";
import { CartRequestForm } from "./CartRequestForm";
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
  const [cartIds, setCartIds] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

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

  const selectedOffers = useMemo(
    () => cartIds.map((id) => offers.find((offer) => offer.id === id)).filter(Boolean) as Offer[],
    [cartIds, offers],
  );

  const selectedIdSet = useMemo(() => new Set(cartIds), [cartIds]);

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

  function addToCart(offer: Offer) {
    if (offer.id === "general") return;
    setCartIds((current) => {
      if (current.includes(offer.id)) return current;
      return [...current, offer.id];
    });
    track("cart_add", { offerName: offer.fullName }, offer);
  }

  function removeFromCart(offerId: string) {
    setCartIds((current) => current.filter((id) => id !== offerId));
    track("cart_remove", { offerId });
  }

  function toggleCart(offer: Offer) {
    if (selectedIdSet.has(offer.id)) {
      removeFromCart(offer.id);
    } else {
      addToCart(offer);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
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
            className="shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:px-4"
          >
            <span className="hidden sm:inline">Talk to Goflow</span>
            <span className="sm:hidden">Talk</span>
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
        <div className="relative mx-auto max-w-6xl px-4 pb-7 pt-16 sm:px-6">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" />
            Retail &amp; marketplace programs
          </p>
          <h1 className="max-w-[18ch] text-4xl font-extrabold leading-[1.04] tracking-tight text-balance sm:text-[3rem]">
            The Goflow Partner <span className="text-primary">Collective</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Browse partner programs, open details, and add the paths you want to
            your request cart. Goflow will route the full bundle from one profile.
          </p>
        </div>
      </section>

      {/* Grid */}
      <main className="mx-auto grid max-w-6xl gap-5 px-4 pb-24 pt-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
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
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {visibleOffers.map((offer, i) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                index={i}
                inCart={selectedIdSet.has(offer.id)}
                onOpen={() => open(offer)}
                onToggleCart={() => toggleCart(offer)}
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
        </div>

        <CartPanel
          selectedOffers={selectedOffers}
          onOpenCart={() => setCartOpen(true)}
          onRemove={removeFromCart}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">
            Goflow Partner Collective
          </span>
          <Link href="/" className="font-semibold text-primary">
            Registration landing page
          </Link>
        </div>
      </footer>

      {selectedOffers.length > 0 && (
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="fixed bottom-4 left-4 right-4 z-40 flex items-center justify-between rounded-2xl bg-foreground px-4 py-3 text-left text-background shadow-2xl lg:hidden"
        >
          <span className="inline-flex items-center gap-2 text-sm font-bold">
            <ShoppingBag className="size-4" />
            {selectedOffers.length} selected
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em]">
            Review <ChevronRight className="size-4" />
          </span>
        </button>
      )}

      <OfferModal
        offer={selected}
        onClose={close}
        onAddToCart={addToCart}
        inCart={selected ? selectedIdSet.has(selected.id) : false}
      />
      <CartModal
        open={cartOpen}
        selectedOffers={selectedOffers}
        onClose={() => setCartOpen(false)}
        onRemove={removeFromCart}
        onDone={() => setCartIds([])}
      />
    </div>
  );
}

function OfferCard({
  offer,
  index,
  inCart,
  onOpen,
  onToggleCart,
}: {
  offer: Offer;
  index: number;
  inCart: boolean;
  onOpen: () => void;
  onToggleCart: () => void;
}) {
  return (
    <article
      style={
        {
          "--brand": offer.brand,
          animationDelay: `${index * 35}ms`,
        } as React.CSSProperties
      }
      className={`offer-card card-in group relative flex min-h-[300px] flex-col gap-4 overflow-hidden rounded-2xl border bg-card p-5 text-left shadow-sm hover:-translate-y-1 ${
        inCart ? "border-primary/45 ring-4 ring-primary/10" : "border-border"
      }`}
    >
      <span
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ backgroundColor: offer.brand }}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3">
        <BrandLogo offer={offer} size={56} />
        <span className="max-w-[9rem] truncate rounded-md border border-border px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
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
      <div className="grid grid-cols-[1fr_auto] gap-2 pt-1">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Details <ChevronRight className="size-4" />
        </button>
        <button
          type="button"
          onClick={onToggleCart}
          aria-label={inCart ? `Remove ${offer.fullName} from cart` : `Add ${offer.fullName} to cart`}
          className={`inline-flex min-w-11 items-center justify-center rounded-xl px-3 py-2.5 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
            inCart
              ? "bg-success/10 text-success hover:bg-success/15"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {inCart ? <Check className="size-4" /> : <Plus className="size-4" />}
        </button>
      </div>
    </article>
  );
}

function CartPanel({
  selectedOffers,
  onOpenCart,
  onRemove,
}: {
  selectedOffers: Offer[];
  onOpenCart: () => void;
  onRemove: (offerId: string) => void;
}) {
  return (
    <aside className="sticky top-20 hidden h-fit rounded-2xl border border-border bg-card p-4 shadow-sm lg:block">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            Request cart
          </p>
          <h2 className="mt-1 text-lg font-black tracking-tight">
            {selectedOffers.length} selected
          </h2>
        </div>
        <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
          <ShoppingBag className="size-5" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Add multiple programs and send one profile to Goflow for routing.
      </p>
      <div className="mt-4 flex max-h-[320px] flex-col gap-2 overflow-y-auto">
        {selectedOffers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            Your cart is empty. Add programs from the marketplace grid.
          </div>
        ) : (
          selectedOffers.map((offer) => (
            <div key={offer.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-2.5">
              <BrandLogo offer={offer} size={34} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{offer.name}</p>
                <p className="truncate text-xs text-muted-foreground">{offer.type}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(offer.id)}
                aria-label={`Remove ${offer.fullName}`}
                className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          ))
        )}
      </div>
      <button
        type="button"
        onClick={onOpenCart}
        disabled={selectedOffers.length === 0}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        Review request <ChevronRight className="size-4" />
      </button>
    </aside>
  );
}

function CartModal({
  open,
  selectedOffers,
  onClose,
  onRemove,
  onDone,
}: {
  open: boolean;
  selectedOffers: Offer[];
  onClose: () => void;
  onRemove: (offerId: string) => void;
  onDone: () => void;
}) {
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-foreground/50 p-0 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Request cart"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-in flex min-h-full w-full max-w-4xl flex-col overflow-hidden bg-background shadow-2xl sm:min-h-0 sm:max-h-[90vh] sm:rounded-3xl md:grid md:grid-cols-[0.9fr_1.1fr]"
      >
        <div className="flex flex-col gap-4 border-b border-border bg-card p-6 md:border-b-0 md:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                Request cart
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">
                Send your selected programs
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Goflow will use one profile to route the full bundle.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid size-9 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto">
            {selectedOffers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                No programs selected yet.
              </div>
            ) : (
              selectedOffers.map((offer) => (
                <div key={offer.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                  <BrandLogo offer={offer} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{offer.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">{offer.tags.slice(0, 2).join(" · ")}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(offer.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-2 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Minus className="size-3.5" /> Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="overflow-y-auto p-6">
          <CartRequestForm selectedOffers={selectedOffers} onDone={onDone} />
        </div>
      </div>
    </div>
  );
}
