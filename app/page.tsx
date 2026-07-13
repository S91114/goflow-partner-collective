import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
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
  "Exclusive and invite-only marketplace paths",
  "Potential marketplace partner incentives for eligible brands",
  "Goflow guidance before every partner handoff",
  "One profile for marketplace, retail, and global expansion",
];

const logos = [
  { name: "Amazon", src: "/logos/amazon.ico" },
  { name: "Walmart", src: "/logos/walmart.ico" },
  { name: "Target Plus", src: "/logos/target.ico" },
  { name: "Macy's", src: "/logos/macys.ico" },
  { name: "Lowe's", src: "/logos/lowes.ico" },
  { name: "Temu", src: "/logos/temu.ico" },
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
            href="/collective"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            Preview catalog
            <ArrowRight className="size-4" />
          </Link>
        </header>

        <div className="relative mx-auto grid max-w-6xl gap-9 px-6 pb-14 pt-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-start lg:pb-20 lg:pt-14">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary backdrop-blur">
              <Sparkles className="size-3.5" />
              Exclusive partner access
            </p>
            <h1 className="max-w-[13ch] text-5xl font-black leading-[0.98] tracking-tight text-balance sm:text-7xl">
              Unlock the marketplace savings most brands never see.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Apply once to see which exclusive marketplace partner incentives
              you may qualify for through Goflow, including programs from
              Amazon, Walmart, and more.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {proof.map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm font-semibold leading-6">
                  <CheckCircle2 className="mt-0.5 size-4 flex-none text-success" />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Programs inside the collective
              </p>
              <div className="flex flex-wrap gap-2">
                {logos.map((logo) => (
                  <span
                    key={logo.name}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/90 px-3 py-2 text-sm font-bold text-foreground shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo.src} alt="" className="size-5 rounded-sm" />
                    {logo.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-card p-5 shadow-xl shadow-primary/10 sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                  <LockKeyhole className="size-3.5" />
                  Apply for access
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">
                  See which programs your brand may qualify for.
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Goflow reviews your profile, helps identify the right
                  programs, and supports the application process before a
                  partner handoff.
                </p>
              </div>
            </div>
            <RegistrationForm />
          </aside>
        </div>
      </section>

      <section className="border-y border-border bg-card/45">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 md:grid-cols-3">
          {[
            ["Share your profile", "Tell us about your brand, current channels, and growth goals in one short form."],
            ["Review the right paths", "A Goflow team member reviews your fit and helps identify relevant partner programs."],
            ["Apply with support", "We help guide the application process before making the appropriate partner introduction."],
          ].map(([title, body]) => (
            <div key={title}>
              <h3 className="text-base font-extrabold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
              Designed for growing brands
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              The right marketplace path starts with the right fit.
            </h2>
          </div>
          <p className="text-sm leading-7 text-muted-foreground">
            Goflow brings together the programs, incentives, and retail
            expansion opportunities that are often managed through private
            forms and partner introductions. Eligibility and savings vary by
            program and brand.
          </p>
        </div>
        <div className="mt-7 flex flex-wrap gap-2">
          {channels.map((channel) => (
            <span
              key={channel}
              className="rounded-md border border-border bg-card/80 px-3 py-1.5 text-sm font-semibold text-muted-foreground"
            >
              {channel}
            </span>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col justify-between gap-3 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center">
        <span>Goflow Partner Collective</span>
        <Link href="/collective" className="inline-flex items-center gap-1 font-semibold text-primary">
          Enter the catalog <ArrowRight className="size-3.5" />
        </Link>
      </footer>
    </main>
  );
}
