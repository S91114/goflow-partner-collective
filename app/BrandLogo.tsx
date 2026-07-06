import type { Offer } from "@/lib/offers";

/**
 * Brand logo mark. Renders the bundled logo asset on a clean white tile when
 * available, otherwise a brand-colored wordmark. Used on cards and in the modal.
 */
export function BrandLogo({
  offer,
  size = 56,
}: {
  offer: Pick<Offer, "logo" | "wordmark" | "name" | "brand">;
  size?: number;
}) {
  if (offer.logo) {
    return (
      <div
        className="grid flex-none place-items-center overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={offer.logo}
          alt={`${offer.name} logo`}
          className="object-contain"
          style={{ width: size * 0.62, height: size * 0.62 }}
        />
      </div>
    );
  }

  const label = offer.wordmark ?? offer.name;
  return (
    <div
      className="grid flex-none place-items-center rounded-2xl px-1.5 text-center font-bold leading-none text-white shadow-sm"
      style={{
        width: size,
        height: size,
        backgroundColor: offer.brand,
        fontSize: Math.max(11, size * 0.2),
      }}
      aria-hidden
    >
      {label}
    </div>
  );
}
