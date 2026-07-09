import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { findOffer } from "@/lib/offers";
import { createAdminClient, hasAdminKey } from "@/lib/supabase/admin";
import { cleanDetails, cleanString, getAttribution } from "@/lib/validation";

export const runtime = "nodejs";

const eventTypes = new Set([
  "offer_open",
  "filter_used",
  "search_used",
  "visit_site_click",
  "partner_apply_click",
  "join_click",
  "cart_add",
  "cart_remove",
]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const eventType = cleanString(body.eventType, 60);
  if (!eventTypes.has(eventType)) {
    return NextResponse.json({ error: "Unknown event type." }, { status: 400 });
  }

  const offerId = cleanString(body.offerId, 80) || null;
  const offer = offerId ? findOffer(offerId) : null;
  const metadata = cleanDetails(body.metadata);
  const attribution = getAttribution(request, body as Record<string, unknown>);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ ok: true });
  }

  try {
    const writeClient = hasAdminKey()
      ? createAdminClient()
      : createSupabaseClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
    const { error } = await writeClient.from("program_events").insert({
      user_id: null,
      offer_id: offerId,
      offer_name: offer?.fullName ?? null,
      event_type: eventType,
      metadata,
      ...attribution,
    });
    if (error) {
      console.error("[collective] event insert failed:", error.message);
    }
  } catch (err) {
    console.error("[collective] event insert threw:", err);
  }

  return NextResponse.json({ ok: true });
}
