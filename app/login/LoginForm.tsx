"use client";

import { useState, type FormEvent } from "react";
import { Check, Loader2, Send } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "We couldn't send your login link.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mt-6 rounded-xl border border-border bg-muted/50 p-5 text-sm text-muted-foreground">
        <Check className="mb-3 size-5 text-success" />
        Check your inbox for the secure login link.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-3">
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@brand.com"
        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-[3px] focus:ring-primary/20"
      />
      {error && <p className="text-[12.5px] font-medium text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Sending
          </>
        ) : (
          <>
            Send login link <Send className="size-4" />
          </>
        )}
      </button>
    </form>
  );
}
