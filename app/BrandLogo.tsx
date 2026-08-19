import {
  CalendarDays,
  Landmark,
  Network,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import type { Offer } from "@/lib/offers";

const ICONS: Record<NonNullable<Offer["icon"]>, LucideIcon> = {
  calendar: CalendarDays,
  landmark: Landmark,
  network: Network,
  shield: ShieldCheck,
};

const LOGO_FILTERS: Record<NonNullable<Offer["logoTone"]>, string> = {
  target:
    "invert(14%) sepia(97%) saturate(5248%) hue-rotate(353deg) brightness(84%) contrast(116%)",
  macys:
    "invert(14%) sepia(97%) saturate(5248%) hue-rotate(353deg) brightness(84%) contrast(116%)",
  aliexpress:
    "invert(14%) sepia(97%) saturate(5248%) hue-rotate(353deg) brightness(84%) contrast(116%)",
  newegg:
    "invert(69%) sepia(54%) saturate(710%) hue-rotate(351deg) brightness(100%) contrast(92%)",
};

/**
 * Brand logo mark. Every partner mark sits on the same color-aware tile, even
 * when the native logo itself is monochrome. Used on cards and in the modal.
 */
export function BrandLogo({
  offer,
  size = 56,
}: {
  offer: Pick<
    Offer,
    | "logo"
    | "secondaryLogo"
    | "logoLayout"
    | "logoTone"
    | "icon"
    | "wordmark"
    | "name"
    | "brand"
  >;
  size?: number;
}) {
  const tileClass = "brand-logo-tile grid flex-none place-items-center rounded-lg";
  const tileStyle = { "--logo-brand": offer.brand } as CSSProperties;
  const paired = offer.logoLayout === "paired" && Boolean(offer.secondaryLogo) && size >= 50;
  const wordmark = offer.logoLayout === "wordmark" && size >= 50;
  const ultraWide = offer.logoLayout === "ultraWide" && size >= 50;
  const wide = offer.logoLayout === "wide" || wordmark || ultraWide;
  const width = paired
    ? size * 2 + 8
    : ultraWide
    ? Math.round(size * 4.15)
    : wordmark
    ? Math.round(size * 3.2)
    : wide
      ? Math.round(size * 2.35)
      : size;
  const height = size;
  const logoStyle = offer.logoTone
    ? { filter: LOGO_FILTERS[offer.logoTone] }
    : undefined;

  if (offer.logo) {
    if (paired && offer.secondaryLogo) {
      return (
        <div className="flex flex-none items-center gap-2" style={{ width, height: size }}>
          <div className={`${tileClass} size-full max-w-[calc(50%-0.25rem)] overflow-hidden p-1`} style={tileStyle}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={offer.logo}
              alt={`${offer.name} logo`}
              className="max-h-full max-w-full object-contain"
              style={logoStyle}
            />
          </div>
          <div
            className={`${tileClass} size-full max-w-[calc(50%-0.25rem)] overflow-hidden p-1`}
            style={{ "--logo-brand": "#010101" } as CSSProperties}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={offer.secondaryLogo}
              alt=""
              aria-hidden
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="relative flex-none" style={{ width, height }}>
        <div
          className={`${tileClass} size-full overflow-hidden ${wide ? "p-1.5" : "p-1"}`}
          style={tileStyle}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={offer.logo}
            alt={`${offer.name} logo`}
            className="max-h-full max-w-full object-contain"
            style={logoStyle}
          />
        </div>
        {offer.secondaryLogo && (
          <div
            className="brand-logo-tile absolute -bottom-1 -right-1 grid place-items-center rounded-md p-1"
            style={{ width: Math.round(size * 0.42), height: Math.round(size * 0.42), ...tileStyle }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={offer.secondaryLogo}
              alt=""
              aria-hidden
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}
      </div>
    );
  }

  if (offer.icon) {
    const Icon = ICONS[offer.icon];
    return (
      <div
        className={tileClass}
        style={{ width: size, height: size, color: offer.brand, ...tileStyle }}
        aria-hidden
      >
        <Icon style={{ width: size * 0.42, height: size * 0.42 }} strokeWidth={2.1} />
      </div>
    );
  }

  const label = offer.wordmark ?? offer.name;

  return (
    <div
      className={`${tileClass} px-2 text-center font-black leading-none tracking-wide`}
      style={{
        width: label.length > 8 && size >= 50 ? Math.round(size * 1.46) : size,
        height: size,
        color: offer.brand,
        fontSize: Math.max(10, size * (label.length > 8 ? 0.15 : 0.18)),
        ...tileStyle,
      }}
      aria-hidden
    >
      {label}
    </div>
  );
}
