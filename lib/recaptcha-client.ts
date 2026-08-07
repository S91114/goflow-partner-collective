"use client";

type RecaptchaApi = {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: RecaptchaApi;
  }
}

export function getRecaptchaToken(action: string): Promise<string | null> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) return Promise.resolve(null);

  const recaptcha = window.grecaptcha;
  if (!recaptcha) {
    return Promise.reject(
      new Error("Security verification is still loading. Please try again."),
    );
  }

  return new Promise((resolve, reject) => {
    recaptcha.ready(() => {
      recaptcha.execute(siteKey, { action }).then(resolve).catch(reject);
    });
  });
}
