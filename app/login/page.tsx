import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-xl shadow-primary/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/goflowlogo.svg" alt="Goflow" className="h-4 w-auto" />
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight">
          Enter the Partner Collective
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          We&apos;ll email you a secure magic link. New applicants should request
          access first so we can attach a brand profile to the account.
        </p>
        <LoginForm />
        <Link href="/#apply" className="mt-5 block text-sm font-semibold text-primary">
          Need access? Apply to join
        </Link>
      </div>
    </main>
  );
}
