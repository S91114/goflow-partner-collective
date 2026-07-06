"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Loader2, Send, X } from "lucide-react";
import { FILTERS, filterOffers, type Offer } from "@/lib/offers";
import { cn } from "@/lib/utils";

const VOLUME_OPTIONS = ["Under 10K", "10K – 50K", "50K – 100K", "100K+"];

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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/goflowlogo.svg" alt="Goflow" className="h-4 w-auto" />
            <span className="hidden h-5 w-px bg-border sm:block" />
            <span className="hidden text-sm font-medium text-muted-foreground sm:block">
              Partner Collective
            </span>
          </div>
          <a
            href="mailto:sadya@goflow.com"
            className="rounded-lg border px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            Talk to Goflow
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-8 pt-14">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          <span className="h-px w-6 bg-primary" />
          Retail &amp; Marketplace Expansion
        </p>
        <h1 className="mt-4 max-w-[16ch] text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl">
          Every channel your brand could grow into — in one place.
        </h1>
        <p className="mt-5 max-w-[56ch] text-base text-muted-foreground sm:text-lg">
          Browse the marketplace and retail programs Goflow can open for you.
          Find the ones that fit your categories and scale, then request a warm
          intro — it routes straight to your Goflow team.
        </p>
        <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground">
          <span>
            <b className="font-bold text-foreground tabular-nums">
              {offers.length}
            </b>{" "}
            live programs
          </span>
          <span>
            <b className="font-bold text-foreground tabular-nums">6</b> retail
            partners
          </span>
          <span>
            <b className="font-bold text-foreground tabular-nums">4</b>{" "}
            international channels
          </span>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-16 z-30 border-b bg-background/90 backdrop-blur">
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
                    : "bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground",
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
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {visible.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onOpen={() => setSelected(offer)}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">
            Goflow Partner Collective
          </span>
          <span>
            Brand marks shown as styled placeholders; official logos drop in
            next. Internal rep contacts are intentionally hidden.
          </span>
        </div>
      </footer>

      <OfferDrawer offer={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function LogoMark({ offer, size = 52 }: { offer: Offer; size?: number }) {
  return (
    <div
      className="grid flex-none place-items-center rounded-2xl font-extrabold tracking-tight shadow-sm"
      style={{
        backgroundColor: offer.brand,
        color: offer.fg,
        width: size,
        height: size,
        fontSize: size * 0.44,
      }}
      aria-hidden
    >
      {offer.mono}
    </div>
  );
}

function OfferCard({ offer, onOpen }: { offer: Offer; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative flex flex-col gap-3.5 overflow-hidden rounded-2xl border bg-card p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <span
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ backgroundColor: offer.brand }}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3">
        <LogoMark offer={offer} />
        <span className="rounded-md border px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
          {offer.type}
        </span>
      </div>
      <h3 className="text-[17px] font-bold tracking-tight">{offer.name}</h3>
      <p className="-mt-1 text-[13.5px] leading-snug text-muted-foreground">
        {offer.headline}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {offer.tags.slice(0, 4).map((t) => (
          <span
            key={t}
            className="rounded-md bg-muted px-2 py-0.5 text-[11.5px] font-medium text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-center gap-1.5 pt-1 text-[12.5px] text-muted-foreground">
        <span className="font-semibold">For:</span> {offer.who}
      </div>
      <span className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-primary opacity-0 transition-opacity group-hover:opacity-100">
        View &amp; request intro <ArrowRight className="size-3.5" />
      </span>
    </button>
  );
}

function OfferDrawer({
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

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={offer ? offer.name : undefined}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto border-l bg-background shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {offer && (
          <>
            <div className="relative border-b p-6">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 grid size-9 place-items-center rounded-lg border text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
              <LogoMark offer={offer} size={60} />
              <span className="mt-3 inline-block w-fit rounded-md border px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                {offer.type}
              </span>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight">
                {offer.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {offer.headline}
              </p>
            </div>

            <div className="flex flex-col gap-6 p-6">
              <Section label="Who it's for">
                <p className="text-sm text-muted-foreground">{offer.who}</p>
              </Section>

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

              {offer.requirements.length > 0 && (
                <Section label="What you'll need">
                  <ul className="flex flex-col gap-2">
                    {offer.requirements.map((r) => (
                      <li
                        key={r}
                        className="flex items-start gap-2.5 text-sm text-muted-foreground"
                      >
                        <Check className="mt-0.5 size-4 flex-none text-success" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              <Section label="How it works">
                <ol className="flex flex-col gap-2.5">
                  {offer.process.map((step, i) => (
                    <li
                      key={step}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <span className="grid size-6 flex-none place-items-center rounded-md bg-primary/10 text-xs font-bold text-primary tabular-nums">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </Section>

              <InterestForm offer={offer} />
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
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

function InterestForm({ offer }: { offer: Offer }) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const payload = {
      offerId: offer.id,
      offerName: offer.name,
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      company: String(data.get("company") || "").trim(),
      monthlyUnits: String(data.get("volume") || ""),
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    return (
      <div className="rounded-2xl border bg-muted/50 p-6 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-success/10 text-success">
          <Check className="size-6" strokeWidth={2.5} />
        </div>
        <h4 className="mt-3.5 text-lg font-extrabold tracking-tight">
          Sent to your Goflow team
        </h4>
        <p className="mx-auto mt-2 max-w-[34ch] text-sm text-muted-foreground">
          Thanks, {done}. Your interest in <b>{offer.name}</b> just landed with
          your Goflow rep, who&apos;ll reach out to kick off the intro.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border bg-muted/40 p-5">
      <div className="text-[15.5px] font-bold tracking-tight">
        Request a warm intro
      </div>
      <p className="mt-0.5 text-[12.5px] text-muted-foreground">
        Tell us about your brand — this goes straight to your Goflow team.
      </p>

      <Field label="Your name">
        <input
          required
          name="name"
          autoComplete="name"
          placeholder="Jordan Rivera"
          className={inputCls}
        />
      </Field>
      <Field label="Work email">
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@brand.com"
          className={inputCls}
        />
      </Field>
      <Field label="Brand / company">
        <input
          required
          name="company"
          placeholder="Your brand"
          className={inputCls}
        />
      </Field>
      <Field label="Monthly units (roughly)">
        <select
          name="volume"
          className={inputCls}
          defaultValue={VOLUME_OPTIONS[0]}
        >
          {VOLUME_OPTIONS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </Field>

      {error && (
        <p className="mt-3 text-[12.5px] font-medium text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            Request intro to {offer.name} <Send className="size-4" />
          </>
        )}
      </button>
      <p className="mt-2.5 text-center text-[11.5px] text-muted-foreground">
        Routed to your Goflow rep · sadya@goflow.com
      </p>
    </form>
  );
}

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-[3px] focus:ring-primary/20";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mt-3 flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
