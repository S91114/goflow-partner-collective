import { NextResponse } from "next/server";
import { notifyByEmail } from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  cleanDetails,
  cleanEmail,
  cleanString,
  cleanUrl,
  EMAIL_RE,
} from "@/lib/validation";

export const runtime = "nodejs";

type LeadPayload = {
  offerId?: string;
  offerName?: string;
  name?: string;
  email?: string;
  company?: string;
  website?: string;
  details?: Record<string, string>;
};

export async function POST(request: Request) {
  let body: LeadPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const offerId = cleanString(body.offerId, 80);
  const offerName = cleanString(body.offerName, 160);
  const name = cleanString(body.name, 120);
  const email = cleanEmail(body.email);
  const company = cleanString(body.company, 160);
  const website = cleanUrl(body.website);
  const details = cleanDetails(body.details);

  if (!offerId || !offerName || !name || !company || !email) {
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

  // Save the lead.
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("leads").insert({
      offer_id: offerId,
      offer_name: offerName,
      name,
      email,
      company,
      website,
      details,
      source: "partner-collective",
    });
    if (error) {
      console.error("[collective] lead insert failed:", error.message);
      return NextResponse.json(
        { error: "We couldn't save your request. Please try again." },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error("[collective] lead insert threw:", err);
    return NextResponse.json(
      { error: "We couldn't save your request. Please try again." },
      { status: 500 },
    );
  }

  // Notify the Goflow team by email. Optional — only runs when a Resend API
  // key is configured, so the form works with or without it.
  await notifyByEmail({
    subject: `New interest: ${offerName} - ${company}`,
    title: "New Partner Collective lead",
    intro: `${name} from ${company} is interested in ${offerName}.`,
    rows: {
      Email: email,
      Company: company,
      Website: website,
      Details: Object.entries(details)
        .map(([key, value]) => `${key}: ${value}`)
        .join("; "),
    },
  });

  return NextResponse.json({ ok: true });
}
