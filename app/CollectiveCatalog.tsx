"use client";

import {
  BadgeCheck,
  BadgePercent,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  Minus,
  Search,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  CATALOG_TABS,
  findOffer,
  type CatalogTab,
  type Offer,
} from "@/lib/offers";
import { displayText } from "@/lib/display-text";
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

const MARKETPLACE_ORDER = [
  "target-plus",
  "jcpenney-commission-offer",
  "nordstrom",
  "macys",
  "amazon-nsi",
  "walmart-nss",
  "lowes",
  "newegg",
  "ulta-beauty",
  "best-buy",
  "chewy",
  "zoro",
  "kohls",
  "mathis-home",
  "aliexpress",
  "mercado-libre",
  "shein",
  "temu",
  "nocnoc",
  "walmart-fav",
  "amazon-mcf-tiktok",
  "amazon-mcf",
] as const;

const MARKETPLACE_RANK = new Map<string, number>(
  MARKETPLACE_ORDER.map((offerId, index) => [offerId, index]),
);

const PARTNER_OFFER_IDS = new Set([
  "target-plus",
  "jcpenney-commission-offer",
  "nordstrom",
  "macys",
  "amazon-mcf-tiktok",
  "amazon-mcf",
  "walmart-nss",
  "goflow-core",
]);

const TAB_ICONS = {
  Marketplaces: Store,
  "Partner Offers": BadgePercent,
  Retail: Building2,
  Services: BriefcaseBusiness,
  Events: CalendarDays,
} satisfies Record<CatalogTab, typeof Store>;

function resolve(id: string | null): Offer | null {
  if (id === "general") return GENERAL_OFFER;
  return findOffer(id) ?? null;
}

export function CollectiveCatalog({ offers }: { offers: Offer[] }) {
  const [selected, setSelected] = useState<Offer | null>(null);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<CatalogTab>("Marketplaces");
  const [cartIds, setCartIds] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [requestsWidgetOpen, setRequestsWidgetOpen] = useState(false);

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

  const openApplication = useCallback(
    (offer: Offer) => {
      open(offer);
      track(
        "partner_apply_click",
        { application: offer.apply?.url ?? "", surface: "catalog_card" },
        offer,
      );
    },
    [open, track],
  );

  const visibleOffers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sourceRank = new Map(offers.map((offer, index) => [offer.id, index]));

    return [...offers]
      .filter((offer) =>
        activeTab === "Partner Offers"
          ? PARTNER_OFFER_IDS.has(offer.id)
          : offer.filters.includes(activeTab),
      )
      .filter((offer) => {
        if (!q) return true;
        return [
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
          .includes(q);
      })
      .sort((a, b) => {
        if (activeTab === "Marketplaces" || activeTab === "Partner Offers") {
          const rankDifference =
            (MARKETPLACE_RANK.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
            (MARKETPLACE_RANK.get(b.id) ?? Number.MAX_SAFE_INTEGER);
          if (rankDifference !== 0) return rankDifference;
        }
        return (sourceRank.get(a.id) ?? 0) - (sourceRank.get(b.id) ?? 0);
      });
  }, [activeTab, offers, query]);

  const selectedOffers = useMemo(
    () => cartIds.map((id) => offers.find((offer) => offer.id === id)).filter(Boolean) as Offer[],
    [cartIds, offers],
  );

  const selectedIdSet = useMemo(() => new Set(cartIds), [cartIds]);
  useEffect(() => {
    if (selectedOffers.length === 0) setRequestsWidgetOpen(false);
  }, [selectedOffers.length]);

  function updateQuery(value: string) {
    setQuery(value);
    if (value.trim().length >= 2) {
      track("search_used", { query: value.trim().slice(0, 80) });
    }
  }

  function updateTab(tab: CatalogTab) {
    setActiveTab(tab);
    track("filter_used", { filter: tab });
  }

  function addToCart(offer: Offer) {
    if (offer.id === "general") return;
    setCartIds((current) => {
      if (current.includes(offer.id)) return current;
      return [...current, offer.id];
    });
    setRequestsWidgetOpen(true);
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

  function closeCart() {
    setCartOpen(false);
    setRequestSubmitted(false);
  }

  function completeRequest() {
    setCartIds([]);
    setRequestsWidgetOpen(false);
    setRequestSubmitted(true);
  }

  return (
    <div className="catalog-shell min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6">
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/goflowlogo.svg" alt="Goflow" className="h-5 w-auto" />
          </div>
        </div>
      </header>

      <section className="catalog-hero border-b border-border/80">
        <div className="mx-auto grid max-w-6xl gap-7 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(32rem,0.95fr)] lg:items-center lg:gap-12">
          <div>
            <h1 className="text-4xl font-extrabold leading-none tracking-tight sm:text-5xl">
              Goflow
            </h1>
            <p className="mt-3 text-lg font-semibold leading-7 text-foreground/85 sm:text-xl">
              Removing friction so sellers can grow.
            </p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
              Explore every opportunity, apply directly, or bundle the introductions you want.
            </p>
          </div>
          <ol className="grid grid-cols-3 content-start gap-1.5 sm:gap-2">
            {[
              ["01", "Explore", "Find the right channel."],
              ["02", "Apply", "Apply directly or request an introduction."],
              ["03", "Connect", "Goflow follows up after you submit."],
            ].map(([number, title, description]) => (
              <li key={number} className="rounded-lg border border-white/80 bg-white/65 px-2.5 py-2.5 shadow-sm backdrop-blur-sm sm:px-4 sm:py-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <p className="text-[10px] font-black tracking-[0.14em] text-primary">{number}</p>
                  <h2 className="text-xs font-extrabold sm:text-sm">{title}</h2>
                </div>
                <p className="mt-1 text-[11px] leading-4 text-muted-foreground sm:text-xs sm:leading-5">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <nav className="catalog-tabbar sticky top-14 z-30 border-b border-border/80" aria-label="Catalog sections">
        <div
          className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-4 sm:px-6"
          role="tablist"
          aria-label="Browse programs"
        >
          {CATALOG_TABS.map((tab) => {
            const active = activeTab === tab;
            const Icon = TAB_ICONS[tab];
            return (
              <button
                key={tab}
                id={`catalog-tab-${tab.toLowerCase().replace(/\s+/g, "-")}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="catalog-panel"
                onClick={() => updateTab(tab)}
                className={`relative inline-flex shrink-0 items-center gap-2 border-b-2 px-0 py-4 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring ${
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {tab}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
        <div className="min-w-0">
          <div className="mb-6 flex justify-end">
            <label className="relative block w-full max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => updateQuery(e.target.value)}
                placeholder="Search programs or partners"
                aria-label="Search programs"
                className="w-full rounded-lg border border-input bg-card px-11 py-3.5 text-base shadow-sm outline-none transition placeholder:text-muted-foreground/80 focus:border-primary focus:ring-[4px] focus:ring-primary/15"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => updateQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </label>
          </div>
          <div
            id="catalog-panel"
            role="tabpanel"
            aria-labelledby={`catalog-tab-${activeTab.toLowerCase().replace(/\s+/g, "-")}`}
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {visibleOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                inCart={selectedIdSet.has(offer.id)}
                onOpen={() => open(offer)}
                onApply={() => openApplication(offer)}
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
          {requestsWidgetOpen && selectedOffers.length > 0 && (
            <RequestsWidget
              selectedOffers={selectedOffers}
              onOpenCart={() => setCartOpen(true)}
              onRemove={removeFromCart}
              onClose={() => setRequestsWidgetOpen(false)}
            />
          )}
        </div>
      </main>

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
        onAddToCart={(offer) => {
          addToCart(offer);
          setRequestsWidgetOpen(true);
        }}
        inCart={selected ? selectedIdSet.has(selected.id) : false}
      />
      <CartModal
        open={cartOpen}
        selectedOffers={selectedOffers}
        submitted={requestSubmitted}
        onClose={closeCart}
        onRemove={removeFromCart}
        onDone={completeRequest}
      />
    </div>
  );
}

function OfferCard({
  offer,
  inCart,
  onOpen,
  onApply,
  onToggleCart,
}: {
  offer: Offer;
  inCart: boolean;
  onOpen: () => void;
  onApply: () => void;
  onToggleCart: () => void;
}) {
  const hasDirectApplication = Boolean(offer.apply);

  return (
    <article
      style={
        {
          "--brand": offer.brand,
        } as CSSProperties
      }
      className={`offer-card group relative flex min-h-[326px] flex-col gap-4 overflow-hidden rounded-xl border bg-card p-5 pt-6 text-left shadow-sm hover:-translate-y-1 ${
        inCart ? "border-primary/45 ring-4 ring-primary/10" : "border-border"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: offer.brand }} aria-hidden />
      <div className="flex min-h-[52px] items-start justify-between gap-2">
        <BrandLogo
          offer={offer}
          size={hasDirectApplication && offer.logoLayout === "ultraWide" ? 44 : 52}
        />
        {hasDirectApplication && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-success/20 bg-success/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-success">
            <BadgeCheck className="size-3.5" /> Direct Apply
          </span>
        )}
      </div>
      <div>
        <h3 className="text-[19px] font-extrabold leading-tight tracking-tight text-balance text-foreground">
          {displayText(offer.fullName)}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {displayText(offer.description)}
        </p>
      </div>
      <div className="mt-auto flex flex-wrap gap-1.5">
        {offer.tags.slice(0, 3).map((t) => (
          <span
            key={t}
            className="rounded-md bg-muted px-2 py-0.5 text-[11.5px] font-medium text-muted-foreground"
          >
            {displayText(t)}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Details <ChevronRight className="size-4" />
        </button>
        <button
          type="button"
          onClick={hasDirectApplication ? onApply : onToggleCart}
          aria-label={
            hasDirectApplication
              ? `Apply for ${displayText(offer.fullName)}`
              : inCart
              ? `Remove ${displayText(offer.fullName)} from introduction requests`
              : `Add ${displayText(offer.fullName)} to introduction requests`
          }
          className={`inline-flex min-w-11 items-center justify-center rounded-lg px-3 py-2.5 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
            !hasDirectApplication && inCart
              ? "bg-success/10 text-success hover:bg-success/15"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {hasDirectApplication ? (
            "Apply here"
          ) : inCart ? (
            <>
              <Check className="size-4" /> Added
            </>
          ) : (
            "Request introduction"
          )}
        </button>
      </div>
    </article>
  );
}

function RequestsWidget({
  selectedOffers,
  onOpenCart,
  onRemove,
  onClose,
}: {
  selectedOffers: Offer[];
  onOpenCart: () => void;
  onRemove: (offerId: string) => void;
  onClose: () => void;
}) {
  const visibleOffers = selectedOffers.slice(0, 3);

  return (
    <aside className="fixed right-6 top-20 z-30 hidden w-80 rounded-2xl border border-border bg-card p-4 shadow-xl shadow-primary/10 lg:block">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            Introduction requests
          </p>
          <h2 className="mt-1 text-lg font-black tracking-tight">
            {selectedOffers.length} selected
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Hide introduction requests"
          className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Review selected programs and send one profile to Goflow for routing.
      </p>
      <div className="mt-4 grid gap-2">
        {visibleOffers.map((offer) => (
          <div
            key={offer.id}
            className="grid min-h-[76px] grid-cols-[34px_minmax(0,1fr)_32px] grid-rows-[auto_auto_auto] items-center gap-x-3 rounded-xl border border-border bg-background p-2.5 shadow-sm"
          >
            <div className="row-span-3">
              <BrandLogo offer={offer} size={34} />
            </div>
            <p className="truncate text-sm font-bold leading-tight">{displayText(offer.name)}</p>
            <button
              type="button"
              onClick={() => onRemove(offer.id)}
              aria-label={`Remove ${displayText(offer.fullName)}`}
              className="row-span-3 grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
            <p className="truncate text-[11px] font-semibold text-primary">
              Introduction request
            </p>
          </div>
        ))}
        {selectedOffers.length > 3 && (
          <p className="rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary">
            +{selectedOffers.length - 3} more selected
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onOpenCart}
        disabled={selectedOffers.length === 0}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        Review introduction requests <ChevronRight className="size-4" />
      </button>
    </aside>
  );
}

function CartModal({
  open,
  selectedOffers,
  submitted,
  onClose,
  onRemove,
  onDone,
}: {
  open: boolean;
  selectedOffers: Offer[];
  submitted: boolean;
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
      aria-label="Introduction requests"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-in flex min-h-full w-full max-w-4xl flex-col overflow-hidden bg-background shadow-2xl sm:min-h-0 sm:max-h-[90vh] sm:rounded-3xl md:grid md:grid-cols-[0.9fr_1.1fr]"
      >
        {submitted ? (
          <div className="flex min-h-[26rem] w-full flex-col items-center justify-center p-8 text-center md:col-span-2 sm:p-12">
            <div className="grid size-14 place-items-center rounded-full bg-success/10 text-success">
              <Check className="size-7" strokeWidth={2.5} />
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-tight">Thank you.</h2>
            <p className="mt-3 max-w-sm text-[15px] leading-7 text-muted-foreground">
              Someone will be in touch with you shortly.
            </p>
            <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
              Want to connect sooner? Book time with the Goflow team.
            </p>
            <a
              href="https://goflow.us/book"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Book a time with Goflow <CalendarDays className="size-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Keep exploring
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 border-b border-border bg-card p-6 md:border-b-0 md:border-r">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                    Introduction requests
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight">
                    Send your introduction requests
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    You are one form away from getting a bundle of introductions.
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
                {selectedOffers.map((offer) => (
                  <div key={offer.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                    <BrandLogo offer={offer} size={38} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{displayText(offer.fullName)}</p>
                      <p className="truncate text-xs text-muted-foreground">{offer.tags.slice(0, 2).map(displayText).join(" · ")}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(offer.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-2 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Minus className="size-3.5" /> Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="overflow-y-auto p-6">
              <CartRequestForm selectedOffers={selectedOffers} onDone={onDone} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
