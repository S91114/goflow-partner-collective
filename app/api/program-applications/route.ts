import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  type CustomerProgramSelection,
  logEmailAutomation,
  upsertCustomer,
  upsertCustomerProgramInterests,
} from "@/lib/customers";
import { OFFERS, findOffer } from "@/lib/offers";
import { syncLead } from "@/lib/lead-sync";
import { notifyByEmail, sendLeadConfirmationEmail } from "@/lib/notifications";
import { createAdminClient, hasAdminKey } from "@/lib/supabase/admin";
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
const offerNamesById = new Map(OFFERS.map((offer) => [offer.id, offer.fullName]));

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { error: "The application form is not connected yet." },
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
    const submittedOfferName = cleanString(body.offerName, 160);
    const offerName =
      offerId === "general"
        ? submittedOfferName || "Talk to Goflow"
        : offer?.fullName ?? offerId;
    const selectedPrograms = parseSelectedPrograms(body.selectedPrograms);
    const interestSelections =
      selectedPrograms.length > 0
        ? selectedPrograms
        : [{ offerId, offerName }];
    const outboundUrl =
      offer?.apply?.url || offer?.link || offer?.website || null;

    const customerId = adminWritesEnabled
      ? await upsertCustomer(writeClient, {
          name,
          email,
          company,
          website,
          metadata: {
            lastRequestType: requestType,
            lastOfferId: offerId,
            lastOfferName: offerName,
          },
        })
      : null;

    const profileSnapshot = {
      customer_id: customerId,
      name,
      email,
      company,
      website,
      user_id: null,
    };

    const applicationPayload = {
      user_id: null,
      ...(customerId ? { customer_id: customerId } : {}),
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
    };

    const applicationResult = adminWritesEnabled
      ? await writeClient
          .from("program_applications")
          .insert(applicationPayload)
          .select("id")
          .single()
      : await writeClient.from("program_applications").insert(applicationPayload);

    if (applicationResult.error) {
      console.error(
        "[collective] program application failed:",
        applicationResult.error.message,
      );
      return NextResponse.json(
        { error: "We couldn't save your application. Please try again." },
        { status: 500 },
      );
    }

    const applicationId =
      adminWritesEnabled && applicationResult.data
        ? ((applicationResult.data as { id?: string }).id ?? null)
        : null;
    if (adminWritesEnabled) {
      await upsertCustomerProgramInterests({
        client: writeClient,
        customerId,
        programApplicationId: applicationId,
        requestType,
        selections: interestSelections,
        details,
      });
    }

    await writeClient.from("program_events").insert({
      user_id: null,
      customer_id: customerId,
      offer_id: offerId,
      offer_name: offerName,
      event_type: `${requestType}_submitted`,
      metadata: { details, selectedPrograms: interestSelections },
      ...attribution,
    });

    const internalSubject = `New ${offerName} request - ${company}`;
    const internalEmail = await notifyByEmail({
      subject: internalSubject,
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
        "Selected programs": interestSelections
          .map((selection) => selection.offerName)
          .join("; "),
      },
    });
    if (adminWritesEnabled) {
      await logEmailAutomation(writeClient, {
        customerId,
        programApplicationId: applicationId,
        template: "internal_program_alert",
        recipientEmail: process.env.COLLECTIVE_NOTIFY_EMAIL || "sadya@goflow.com",
        subject: internalSubject,
        status: internalEmail.status,
        error: internalEmail.error,
        metadata: { offerId, offerName, requestType },
      });
    }

    const leadSubject = `We received your ${offerName} request`;
    const leadEmail = await sendLeadConfirmationEmail({
      name,
      email,
      company,
      program: offerName,
    });
    if (adminWritesEnabled) {
      await logEmailAutomation(writeClient, {
        customerId,
        programApplicationId: applicationId,
        template: "program_confirmation",
        recipientEmail: email,
        subject: leadSubject,
        status: leadEmail.status,
        error: leadEmail.error,
        metadata: {
          offerId,
          offerName,
          selectedPrograms: interestSelections,
        },
      });
    }

    await syncLead({
      kind: "program_application",
      name,
      email,
      company,
      website,
      program: offerName,
      requestType,
      details,
      attribution,
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

function parseSelectedPrograms(value: unknown): CustomerProgramSelection[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const source = item as Record<string, unknown>;
      const offerId = cleanString(source.offerId, 80);
      const offerName =
        offerNamesById.get(offerId) || cleanString(source.offerName, 160);
      if (!offerId || !offerNamesById.has(offerId)) return null;
      return { offerId, offerName };
    })
    .filter((item): item is CustomerProgramSelection => Boolean(item));
}
