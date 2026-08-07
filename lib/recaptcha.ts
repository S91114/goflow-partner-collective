type RecaptchaAction =
  | "lead_interest"
  | "login"
  | "program_application"
  | "registration";

type RecaptchaResponse = {
  success?: boolean;
  score?: number;
  action?: string;
  hostname?: string;
};

type RecaptchaResult =
  | { ok: true; enabled: boolean }
  | { ok: false; enabled: true; reason: string };

const DEFAULT_MIN_SCORE = 0.5;

function getAllowedHostnames() {
  return (process.env.RECAPTCHA_ALLOWED_HOSTNAMES || "goflowpartnercollective.com,www.goflowpartnercollective.com")
    .split(",")
    .map((hostname) => hostname.trim().toLowerCase())
    .filter(Boolean);
}

function getMinScore() {
  const configured = Number(process.env.RECAPTCHA_MIN_SCORE);
  return Number.isFinite(configured) && configured >= 0 && configured <= 1
    ? configured
    : DEFAULT_MIN_SCORE;
}

export async function verifyRecaptcha({
  token,
  action,
}: {
  token: string;
  action: RecaptchaAction;
}): Promise<RecaptchaResult> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return { ok: true, enabled: false };
  if (!token) return { ok: false, enabled: true, reason: "missing token" };

  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: token }),
        cache: "no-store",
      },
    );
    const assessment = (await response.json()) as RecaptchaResponse;
    const hostname = assessment.hostname?.toLowerCase();

    if (!response.ok || !assessment.success) {
      return { ok: false, enabled: true, reason: "verification failed" };
    }
    if (assessment.action !== action) {
      return { ok: false, enabled: true, reason: "unexpected action" };
    }
    if (typeof assessment.score !== "number" || assessment.score < getMinScore()) {
      return { ok: false, enabled: true, reason: "low score" };
    }
    if (!hostname || !getAllowedHostnames().includes(hostname)) {
      return { ok: false, enabled: true, reason: "unexpected hostname" };
    }

    return { ok: true, enabled: true };
  } catch (error) {
    console.error("[collective] reCAPTCHA verification failed:", error);
    return { ok: false, enabled: true, reason: "verification unavailable" };
  }
}
