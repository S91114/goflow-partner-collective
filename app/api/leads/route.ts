import { NextResponse } from "next/server";
import { getSupabase, collectiveConfigured } from "@/lib/supabase";

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Where interest notifications are routed (server-side only, never rendered). */
const NOTIFY_TO = process.env.COLLECTIVE_NOTIFY_EMAIL || "sadya@goflow.com";

export async function POST(request: Request) {
  let body: LeadPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const offerId = body.offerId?.trim();
  const offerName = body.offerName?.trim();
  const name = body.name?.trim();
  const email = body.email?.trim();
  const company = body.company?.trim();
  const website = body.website?.trim() || null;
  const details =
    body.details && typeof body.details === "object" ? body.details : {};

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

  if (!collectiveConfigured()) {
    return NextResponse.json(
      { error: "The catalog isn't connected to a database yet." },
      { status: 503 },
    );
  }

  // Save the lead.
  try {
    const supabase = getSupabase();
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
  await notifyByEmail({ offerName, name, email, company, website, details });

  return NextResponse.json({ ok: true });
}

async function notifyByEmail(lead: {
  offerName: string;
  name: string;
  email: string;
  company: string;
  website: string | null;
  details: Record<string, string>;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.COLLECTIVE_NOTIFY_FROM ||
    "Partner Collective <onboarding@resend.dev>";
  if (!apiKey) return; // Email not configured yet — lead is still saved.

  const detailRows = Object.entries(lead.details)
    .map(([k, v]) => `<li>${escapeHtml(k)}: ${escapeHtml(v)}</li>`)
    .join("");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [NOTIFY_TO],
        reply_to: lead.email,
        subject: `New interest: ${lead.offerName} — ${lead.company}`,
        html: `
          <h2>New Partner Collective lead</h2>
          <p><strong>${escapeHtml(lead.name)}</strong> from
             <strong>${escapeHtml(lead.company)}</strong> is interested in
             <strong>${escapeHtml(lead.offerName)}</strong>.</p>
          <ul>
            <li>Email: <a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a></li>
            <li>Company: ${escapeHtml(lead.company)}</li>
            <li>Website: ${escapeHtml(lead.website || "—")}</li>
            ${detailRows}
          </ul>
        `,
      }),
    });
    if (!res.ok) {
      console.error("[collective] email notify failed:", await res.text());
    }
  } catch (err) {
    console.error("[collective] email notify threw:", err);
  }
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] as string,
  );
}
