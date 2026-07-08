import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createAdminClient, hasAdminKey } from "@/lib/supabase/admin";
import { notifyByEmail } from "@/lib/notifications";
import {
  cleanEmail,
  cleanString,
  cleanUrl,
  EMAIL_RE,
  getAttribution,
} from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = cleanString(body.name, 120);
  const email = cleanEmail(body.email);
  const company = cleanString(body.company, 160);
  const website = cleanUrl(body.website);
  const category = cleanString(body.category, 120);
  const gmvBand = cleanString(body.gmvBand, 80);
  const currentChannels = cleanString(body.currentChannels, 300);
  const notes = cleanString(body.notes, 1000);
  const attribution = getAttribution(request, body);

  if (!name || !email || !company || !website || !category || !gmvBand) {
    return NextResponse.json(
      { error: "Please complete the required profile fields." },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "That doesn't look like a valid work email." },
      { status: 400 },
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { error: "The access form is not connected yet." },
      { status: 503 },
    );
  }

  try {
    const writeClient = hasAdminKey()
      ? createAdminClient()
      : createSupabaseClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
    const { error } = await writeClient.from("registrations").insert({
      name,
      email,
      company,
      website,
      category,
      gmv_band: gmvBand,
      current_channels: currentChannels,
      notes,
      ...attribution,
      status: "access_sent",
    });

    if (error) {
      console.error("[collective] registration insert failed:", error.message);
      return NextResponse.json(
        { error: "We couldn't save your request. Please try again." },
        { status: 500 },
      );
    }

    const authClient = createSupabaseClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const origin = new URL(request.url).origin;
    const { error: otpError } = await authClient.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${origin}/auth/callback?next=/collective`,
      },
    });

    if (otpError) {
      console.error("[collective] registration magic link failed:", otpError.message);
      return NextResponse.json(
        { error: "We saved your profile, but couldn't send the access link yet." },
        { status: 500 },
      );
    }

    await notifyByEmail({
      subject: `New Partner Collective registration - ${company}`,
      title: "New Partner Collective registration",
      intro: `${name} from ${company} requested access.`,
      rows: {
        Email: email,
        Website: website,
        Category: category,
        "Annual GMV": gmvBand,
        "Current channels": currentChannels,
        Notes: notes,
        Source: attribution.utm_source,
        Campaign: attribution.utm_campaign,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[collective] registration threw:", err);
    return NextResponse.json(
      { error: "We couldn't process your request. Please try again." },
      { status: 500 },
    );
  }
}
