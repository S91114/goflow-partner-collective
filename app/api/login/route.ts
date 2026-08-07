import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { cleanEmail, cleanString, EMAIL_RE } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const recaptcha = await verifyRecaptcha({
    token: cleanString(body.recaptchaToken, 4096),
    action: "login",
  });
  if (!recaptcha.ok) {
    console.warn("[collective] login blocked by reCAPTCHA:", recaptcha.reason);
    return NextResponse.json(
      { error: "We couldn't verify this login request. Please try again." },
      { status: 403 },
    );
  }

  const email = cleanEmail(body.email);
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { error: "Login is not connected yet." },
      { status: 503 },
    );
  }

  const supabase = createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const origin = new URL(request.url).origin;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/auth/callback?next=/`,
    },
  });

  if (error) {
    console.error("[collective] login magic link failed:", error.message);
    return NextResponse.json(
      { error: "We couldn't send that login link. Apply first if you are new." },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
