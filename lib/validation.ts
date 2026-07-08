export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function cleanString(value: unknown, max = 500): string {
  return String(value || "").trim().slice(0, max);
}

export function cleanEmail(value: unknown): string {
  return cleanString(value, 254).toLowerCase();
}

export function cleanUrl(value: unknown): string | null {
  const raw = cleanString(value, 300);
  if (!raw) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withProtocol);
    return url.toString();
  } catch {
    return raw;
  }
}

export function cleanDetails(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([key, detail]) => [cleanString(key, 80), cleanString(detail, 500)])
      .filter(([key, detail]) => key && detail),
  );
}

export function getAttribution(request: Request, body: Record<string, unknown>) {
  const headerUrl = new URL(request.url);
  const source = body.attribution;
  const attribution =
    source && typeof source === "object" && !Array.isArray(source)
      ? (source as Record<string, unknown>)
      : {};

  return {
    utm_source: cleanString(attribution.utm_source, 120) || null,
    utm_medium: cleanString(attribution.utm_medium, 120) || null,
    utm_campaign: cleanString(attribution.utm_campaign, 120) || null,
    utm_term: cleanString(attribution.utm_term, 120) || null,
    utm_content: cleanString(attribution.utm_content, 120) || null,
    referrer: cleanString(attribution.referrer, 500) || null,
    landing_path:
      cleanString(attribution.landing_path, 500) ||
      `${headerUrl.pathname}${headerUrl.search}`,
  };
}
