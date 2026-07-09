type LeadSyncPayload = {
  kind: "registration" | "program_application";
  name: string;
  email: string;
  company: string;
  website?: string | null;
  program?: string | null;
  requestType?: string | null;
  category?: string | null;
  gmvBand?: string | null;
  currentChannels?: string | null;
  notes?: string | null;
  details?: Record<string, string>;
  attribution?: Record<string, string | null | undefined>;
};

export async function syncLead(payload: LeadSyncPayload) {
  const webhookUrl = process.env.COLLECTIVE_LEAD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const secret = process.env.COLLECTIVE_LEAD_WEBHOOK_SECRET;
  if (secret) {
    headers["X-Collective-Webhook-Secret"] = secret;
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        source: "goflow-partner-collective",
        createdAt: new Date().toISOString(),
        ...payload,
      }),
    });

    if (!res.ok) {
      console.error("[collective] lead sync failed:", await res.text());
    }
  } catch (err) {
    console.error("[collective] lead sync threw:", err);
  }
}
