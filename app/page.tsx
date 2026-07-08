import Link from "next/link";
import { ArrowRight, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";
import { RegistrationForm } from "./RegistrationForm";

const channels = [
  "Amazon",
  "Walmart",
  "Target Plus",
  "Macy's",
  "Nordstrom",
  "International",
];

const proof = [
  "Curated channel programs",
  "Warm Goflow intros",
  "Application tracking",
  "Partner community access",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <section className="relative">
        <div className="brand-mesh pointer-events-none absolute inset-0" aria-hidden />
        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/goflowlogo.svg" alt="Goflow" className="h-4 w-auto" />
            <span className="hidden h-5 w-px bg-border sm:block" />
            <span className="hidden text-sm font-semibold text-muted-foreground sm:block">
              Partner Collective
            </span>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            Member login
            <LockKeyhole className="size-4" />
          </Link>
        </header>

        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:pb-20 lg:pt-14">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary backdrop-blur">
              <Sparkles className="size-3.5" />
              Retail and marketplace access
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.02] tracking-tight text-balance sm:text-6xl">
              Get matched to the marketplace programs Goflow can open for you.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
              Apply once to access the Partner Collective: a gated catalog of
              retail, marketplace, international, and community programs built
              for ecommerce brands ready to expand.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {proof.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="size-4 text-success" />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap gap-2">
              {channels.map((channel) => (
                <span
                  key={channel}
                  className="rounded-md border border-border bg-card/80 px-3 py-1.5 text-sm font-semibold text-muted-foreground"
                >
                  {channel}
                </span>
              ))}
            </div>
          </div>

          <div id="apply" className="rounded-2xl border border-border bg-card p-5 shadow-xl shadow-primary/10 sm:p-7">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Apply to join
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight">
                Request access
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Tell us about your brand. We&apos;ll email a secure login link
                and use this profile to route future program applications.
              </p>
            </div>
            <RegistrationForm />
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card/45">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-12 md:grid-cols-3">
          {[
            ["Discover", "Filter programs by channel, category, geography, and seller stage."],
            ["Apply", "Submit Goflow-owned applications before any partner handoff."],
            ["Track", "Every registration, request, and outbound click lands in Supabase."],
          ].map(([title, body]) => (
            <div key={title}>
              <h3 className="text-base font-extrabold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col justify-between gap-3 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center">
        <span>Goflow Partner Collective</span>
        <Link href="/collective" className="inline-flex items-center gap-1 font-semibold text-primary">
          Already approved? Enter the catalog <ArrowRight className="size-3.5" />
        </Link>
      </footer>
    </main>
  );
}
