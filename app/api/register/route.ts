import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  logEmailAutomation,
  updateCustomerRegistration,
  upsertCustomer,
} from "@/lib/customers";
import { createAdminClient, hasAdminKey } from "@/lib/supabase/admin";
import { syncLead } from "@/lib/lead-sync";
import { notifyByEmail, sendLeadConfirmationEmail } from "@/lib/notifications";
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
    const adminWritesEnabled = hasAdminKey();
    const writeClient = adminWritesEnabled
      ? createAdminClient()
      : createSupabaseClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

    const customerId = adminWritesEnabled
      ? await upsertCustomer(writeClient, {
          name,
          email,
          company,
          website,
          category,
          gmvBand,
          currentChannels,
          notes,
          metadata: { attribution },
        })
      : null;

    const registrationPayload = {
      ...(customerId ? { customer_id: customerId } : {}),
      name,
      email,
      company,
      website,
      category,
      gmv_band: gmvBand,
      current_channels: currentChannels,
      notes,
      ...attribution,
      status: "registered",
    };

    const registrationResult = adminWritesEnabled
      ? await writeClient
          .from("registrations")
          .insert(registrationPayload)
          .select("id")
          .single()
      : await writeClient.from("registrations").insert(registrationPayload);

    if (registrationResult.error) {
      console.error(
        "[collective] registration insert failed:",
        registrationResult.error.message,
      );
      return NextResponse.json(
        { error: "We couldn't save your request. Please try again." },
        { status: 500 },
      );
    }

    const registrationId =
      adminWritesEnabled && registrationResult.data
        ? ((registrationResult.data as { id?: string }).id ?? null)
        : null;
    await updateCustomerRegistration(writeClient, customerId, registrationId);

    const internalSubject = `New Partner Collective registration - ${company}`;
    const internalEmail = await notifyByEmail({
      subject: internalSubject,
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
    if (adminWritesEnabled) {
      await logEmailAutomation(writeClient, {
        customerId,
        registrationId,
        template: "internal_registration_alert",
        recipientEmail: process.env.COLLECTIVE_NOTIFY_EMAIL || "sadya@goflow.com",
        subject: internalSubject,
        status: internalEmail.status,
        error: internalEmail.error,
        metadata: { company, category, gmvBand },
      });
    }

    const leadSubject = "Your Goflow Partner Collective request is in";
    const leadEmail = await sendLeadConfirmationEmail({
      name,
      email,
      company,
    });
    if (adminWritesEnabled) {
      await logEmailAutomation(writeClient, {
        customerId,
        registrationId,
        template: "lead_confirmation",
        recipientEmail: email,
        subject: leadSubject,
        status: leadEmail.status,
        error: leadEmail.error,
        metadata: { company },
      });
    }

    await syncLead({
      kind: "registration",
      name,
      email,
      company,
      website,
      category,
      gmvBand,
      currentChannels,
      notes,
      attribution,
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
