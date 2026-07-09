const NOTIFY_TO = process.env.COLLECTIVE_NOTIFY_EMAIL || "sadya@goflow.com";
const DEFAULT_FROM = "Partner Collective <onboarding@resend.dev>";
const SITE_URL =
  process.env.COLLECTIVE_SITE_URL || "https://goflowpartnercollective.com";

export type EmailSendResult = {
  status: "sent" | "skipped" | "failed";
  error?: string;
};

export async function notifyByEmail({
  subject,
  title,
  intro,
  rows,
}: {
  subject: string;
  title: string;
  intro: string;
  rows: Record<string, string | null | undefined>;
}): Promise<EmailSendResult> {
  const rowHtml = Object.entries(rows)
    .filter(([, value]) => value)
    .map(
      ([key, value]) =>
        `<li><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value || "")}</li>`,
    )
    .join("");

  return sendEmail({
    to: [NOTIFY_TO],
    subject,
    html: `
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(intro)}</p>
      <ul>${rowHtml}</ul>
    `,
    logLabel: "email notify",
  });
}

export async function sendLeadConfirmationEmail({
  name,
  email,
  company,
  program,
}: {
  name: string;
  email: string;
  company: string;
  program?: string;
}): Promise<EmailSendResult> {
  const firstName = name.split(" ")[0] || "there";
  const isBundle = program?.toLowerCase().includes("introduction bundle");
  const subject = isBundle
    ? "Your Goflow introduction requests are in"
    : program
      ? `We received your ${program} request`
      : "Your Goflow Partner Collective request is in";
  const preview = isBundle
    ? `Goflow received your introduction requests for ${company}.`
    : program
      ? `Goflow received your ${program} request for ${company}.`
      : `Goflow received your Partner Collective access request for ${company}.`;
  const heading = isBundle
    ? "Your introduction requests are in."
    : "We received your request.";
  const introLine = isBundle
    ? `Hi ${escapeHtml(firstName)}, thanks for submitting ${escapeHtml(company)}'s introduction requests. We saved your profile and will use it to route your selected programs to the right partner paths.`
    : `Hi ${escapeHtml(firstName)}, thanks for submitting ${escapeHtml(company)}${program ? ` for ${escapeHtml(program)}` : ""}. We saved your profile and will use it to route you toward the marketplace, retail, international, and partner programs that may fit your brand.`;

  return sendEmail({
    to: [email],
    subject,
    html: `
      <div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preview)}</div>
      <div style="font-family:Inter,Arial,sans-serif;background:#f6f8fc;padding:28px;color:#22354c">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #dbe2ee;border-radius:16px;overflow:hidden">
          <div style="height:4px;background:#5a6cfb"></div>
          <div style="padding:28px">
            <p style="margin:0 0 12px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:#5a6cfb">Goflow Partner Collective</p>
            <h1 style="margin:0 0 14px;font-size:28px;line-height:1.12;color:#22354c">${escapeHtml(heading)}</h1>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#53647a">${introLine}</p>
            <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#53647a">Eligible brands may uncover invite-only marketplace paths, warm Goflow introductions, and potential program savings from $500K to $1M+ depending on qualification and partner terms.</p>
            <a href="${SITE_URL}/collective" style="display:inline-block;background:#5a6cfb;color:#ffffff;text-decoration:none;font-weight:700;border-radius:10px;padding:12px 18px;font-size:14px">Preview the catalog</a>
            <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#6b7a90">If anything in your profile needs to be corrected, reply to this email and the Goflow team will adjust it before making introductions.</p>
          </div>
        </div>
      </div>
    `,
    logLabel: "lead confirmation",
  });
}

async function sendEmail({
  to,
  subject,
  html,
  logLabel,
}: {
  to: string[];
  subject: string;
  html: string;
  logLabel: string;
}): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.COLLECTIVE_NOTIFY_FROM || DEFAULT_FROM;
  if (!apiKey) {
    return { status: "skipped", error: "RESEND_API_KEY is not configured." };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const error = await res.text();
      console.error(`[collective] ${logLabel} failed:`, error);
      return { status: "failed", error };
    }
    return { status: "sent" };
  } catch (err) {
    console.error(`[collective] ${logLabel} threw:`, err);
    return {
      status: "failed",
      error: err instanceof Error ? err.message : "Unknown email send error.",
    };
  }
}

export function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] as string,
  );
}
