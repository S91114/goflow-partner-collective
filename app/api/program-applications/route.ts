import { NextResponse } from "next/server";
import { OFFERS, findOffer } from "@/lib/offers";
import { notifyByEmail } from "@/lib/notifications";
import { createAdminClient, hasAdminKey } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  cleanDetails,
  cleanEmail,
  cleanString,
  cleanUrl,
  EMAIL_RE,
  getAttribution,
} from "@/lib/validation";

export const runtime = "nodejs";

const requestTypes = new Set(["apply", "learn_more", "join", "general"]);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  }

  const offerId = cleanString(body.offerId, 80);
  const offer = offerId === "general" ? null : findOffer(offerId);
  if (offerId !== "general" && !offer) {
    return NextResponse.json({ error: "Unknown program." }, { status: 400 });
  }

  const requestType = cleanString(body.requestType, 40);
  if (!requestTypes.has(requestType)) {
    return NextResponse.json({ error: "Unknown request type." }, { status: 400 });
  }

  const name = cleanString(body.name, 120);
  const email = cleanEmail(body.email);
  const company = cleanString(body.company, 160);
  const website = cleanUrl(body.website);
  const details = cleanDetails(body.details);
  const attribution = getAttribution(request, body);

  if (!name || !email || !company) {
    return NextResponse.json(
      { error: "Please fill in your name, work email, and company." },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "That doesn't look like a valid email address." },
      { status: 400 },
    );
  }

  try {
    const writeClient = hasAdminKey() ? createAdminClient() : supabase;
    const offerName =
      offerId === "general" ? "Talk to Goflow" : offer?.fullName ?? offerId;
    const outboundUrl =
      offer?.apply?.url || offer?.link || offer?.website || null;
    const profileSnapshot = {
      name,
      email,
      company,
      website,
      user_id: userId,
    };

    const { error } = await writeClient.from("program_applications").insert({
      user_id: userId,
      offer_id: offerId,
      offer_name: offerName,
      request_type: requestType,
      name,
      email,
      company,
      website,
      details,
      profile_snapshot: profileSnapshot,
      outbound_url: outboundUrl,
      ...attribution,
    });

    if (error) {
      console.error("[collective] program application failed:", error.message);
      return NextResponse.json(
        { error: "We couldn't save your application. Please try again." },
        { status: 500 },
      );
    }

    await writeClient.from("program_events").insert({
      user_id: userId,
      offer_id: offerId,
      offer_name: offerName,
      event_type: `${requestType}_submitted`,
      metadata: { details },
      ...attribution,
    });

    await notifyByEmail({
      subject: `New ${offerName} request - ${company}`,
      title: "New Partner Collective program request",
      intro: `${name} from ${company} submitted a ${requestType.replace("_", " ")} request for ${offerName}.`,
      rows: {
        Email: email,
        Website: website,
        Program: offerName,
        "Request type": requestType,
        "Outbound URL": outboundUrl,
        Details: Object.entries(details)
          .map(([key, value]) => `${key}: ${value}`)
          .join("; "),
      },
    });

    return NextResponse.json({ ok: true, outboundUrl });
  } catch (err) {
    console.error("[collective] program application threw:", err);
    return NextResponse.json(
      { error: "We couldn't process your application. Please try again." },
      { status: 500 },
    );
  }
}

export function GET() {
  return NextResponse.json({ programs: OFFERS.map((offer) => offer.id) });
}
