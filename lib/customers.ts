import type { SupabaseClient } from "@supabase/supabase-js";

export type CustomerProgramSelection = {
  offerId: string;
  offerName: string;
};

type CustomerInput = {
  email: string;
  userId?: string | null;
  name?: string | null;
  company?: string | null;
  website?: string | null;
  category?: string | null;
  gmvBand?: string | null;
  currentChannels?: string | null;
  notes?: string | null;
  lastRegistrationId?: string | null;
  metadata?: Record<string, unknown>;
};

type EmailAutomationInput = {
  customerId?: string | null;
  programApplicationId?: string | null;
  registrationId?: string | null;
  template: string;
  recipientEmail: string;
  subject: string;
  status: "sent" | "skipped" | "failed";
  error?: string | null;
  metadata?: Record<string, unknown>;
};

export async function upsertCustomer(
  client: SupabaseClient,
  input: CustomerInput,
): Promise<string | null> {
  const email = input.email.toLowerCase();
  if (!email) return null;

  const payload: Record<string, unknown> = {
    email,
    last_seen_at: new Date().toISOString(),
  };

  setIfPresent(payload, "user_id", input.userId);
  setIfPresent(payload, "name", input.name);
  setIfPresent(payload, "company", input.company);
  setIfPresent(payload, "website", input.website);
  setIfPresent(payload, "category", input.category);
  setIfPresent(payload, "gmv_band", input.gmvBand);
  setIfPresent(payload, "current_channels", input.currentChannels);
  setIfPresent(payload, "notes", input.notes);
  setIfPresent(payload, "last_registration_id", input.lastRegistrationId);
  if (input.metadata && Object.keys(input.metadata).length > 0) {
    payload.metadata = input.metadata;
  }

  const { data, error } = await client
    .from("customers")
    .upsert(payload, { onConflict: "email" })
    .select("id")
    .single();

  if (error) {
    console.error("[collective] customer upsert failed:", error.message);
    return null;
  }

  return (data?.id as string | undefined) ?? null;
}

export async function updateCustomerRegistration(
  client: SupabaseClient,
  customerId: string | null,
  registrationId: string | null,
) {
  if (!customerId || !registrationId) return;

  const { error } = await client
    .from("customers")
    .update({ last_registration_id: registrationId })
    .eq("id", customerId);

  if (error) {
    console.error("[collective] customer registration link failed:", error.message);
  }
}

export async function upsertCustomerProgramInterests({
  client,
  customerId,
  programApplicationId,
  requestType,
  selections,
  details,
}: {
  client: SupabaseClient;
  customerId: string | null;
  programApplicationId: string | null;
  requestType: string;
  selections: CustomerProgramSelection[];
  details: Record<string, string>;
}) {
  if (!customerId || !programApplicationId || selections.length === 0) return;

  const rows = selections.map((selection) => ({
    customer_id: customerId,
    program_application_id: programApplicationId,
    offer_id: selection.offerId,
    offer_name: selection.offerName,
    request_type: requestType,
    status: "requested",
    details,
  }));

  const { error } = await client
    .from("customer_program_interests")
    .upsert(rows, { onConflict: "customer_id,offer_id" });

  if (error) {
    console.error("[collective] customer interest upsert failed:", error.message);
  }
}

export async function logEmailAutomation(
  client: SupabaseClient,
  input: EmailAutomationInput,
) {
  const { error } = await client.from("email_automation_events").insert({
    customer_id: input.customerId ?? null,
    program_application_id: input.programApplicationId ?? null,
    registration_id: input.registrationId ?? null,
    template: input.template,
    recipient_email: input.recipientEmail.toLowerCase(),
    subject: input.subject,
    status: input.status,
    sent_at: input.status === "sent" ? new Date().toISOString() : null,
    error: input.error ?? null,
    metadata: input.metadata ?? {},
  });

  if (error) {
    console.error("[collective] email automation log failed:", error.message);
  }
}

function setIfPresent(
  payload: Record<string, unknown>,
  key: string,
  value: string | null | undefined,
) {
  if (value) payload[key] = value;
}
