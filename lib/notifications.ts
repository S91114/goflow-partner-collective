const NOTIFY_TO = process.env.COLLECTIVE_NOTIFY_EMAIL || "sadya@goflow.com";

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
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.COLLECTIVE_NOTIFY_FROM ||
    "Partner Collective <onboarding@resend.dev>";
  if (!apiKey) return;

  const rowHtml = Object.entries(rows)
    .filter(([, value]) => value)
    .map(
      ([key, value]) =>
        `<li><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value || "")}</li>`,
    )
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
        subject,
        html: `
          <h2>${escapeHtml(title)}</h2>
          <p>${escapeHtml(intro)}</p>
          <ul>${rowHtml}</ul>
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

export function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] as string,
  );
}
