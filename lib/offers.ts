// Goflow Partner Collective — offer catalog (V1 static source of truth).
// Sourced from the Goflow channel-expansion sheet. Internal rep contacts are
// intentionally NOT included here — this data is public-facing.

export type Offer = {
  id: string;
  name: string;
  /** Brand accent color (hex) used for the logo mark + card top rule. */
  brand: string;
  /** Foreground color for text/mono on top of the brand color. */
  fg: string;
  /** Placeholder monogram shown until an official logo asset is added. */
  mono: string;
  /** High-level program type, shown as a tag. */
  type: string;
  /** Filter buckets this offer belongs to. */
  filters: string[];
  /** One-line hook shown on the tile. */
  headline: string;
  /** Who the program is looking for. */
  who: string;
  /** Product/category tags. Also the input for future recommendation logic. */
  tags: string[];
  /** Concrete requirements a brand must meet (may be empty). */
  requirements: string[];
  /** Plain-English "how it works" steps (rep names/emails stripped). */
  process: string[];
};

export const FILTERS = [
  "All",
  "Amazon",
  "Big-Box Retail",
  "International",
  "Fashion & Beauty",
] as const;

export const OFFERS: Offer[] = [
  {
    id: "amazon-mcf",
    name: "Amazon MCF",
    brand: "#FF9900",
    fg: "#131A22",
    mono: "a",
    type: "Amazon Program",
    filters: ["Amazon"],
    headline:
      "Preferred Pricing Program — up to 15% off MCF fees, plus FBA credits and unbranded packaging.",
    who: "Sellers moving 100K+ off-Amazon units a year",
    tags: ["All categories", "Fulfillment"],
    requirements: [],
    process: [
      "We confirm your off-Amazon volume qualifies.",
      "We pass your details to Amazon's MCF team.",
      "Amazon assigns you a dedicated rep to get set up.",
    ],
  },
  {
    id: "amazon-nsi",
    name: "Amazon NSI",
    brand: "#FF9900",
    fg: "#131A22",
    mono: "a",
    type: "Amazon Program",
    filters: ["Amazon"],
    headline:
      "New Seller Incentives — the launch perks and credits for brands just getting on Amazon.",
    who: "Brand-new Amazon sellers",
    tags: ["All categories", "New to Amazon"],
    requirements: [],
    process: [
      "We verify you're new to Amazon.",
      "We enroll you in the New Seller Incentives program.",
    ],
  },
  {
    id: "walmart-nss",
    name: "Walmart NSS",
    brand: "#0071DC",
    fg: "#FFC220",
    mono: "✳",
    type: "Big-Box Retail",
    filters: ["Big-Box Retail"],
    headline:
      "Up to $75K in savings and incentives to launch and grow on Walmart Marketplace.",
    who: "Sellers doing $1M+ GMV and not yet on Walmart",
    tags: ["Most categories", "Incentives"],
    requirements: [],
    process: [
      "We meet with you to confirm fit.",
      "We submit your details to Walmart.",
      "Walmart assigns you a dedicated BDM.",
    ],
  },
  {
    id: "walmart-fav",
    name: "Walmart Customer Favorites",
    brand: "#0071DC",
    fg: "#FFC220",
    mono: "✳",
    type: "Big-Box Retail",
    filters: ["Big-Box Retail"],
    headline:
      "Get your in-demand assortment surfaced against Walmart's high-demand catalog.",
    who: "Sellers with 125+ matching items",
    tags: ["Walmart demand categories", "Assortment"],
    requirements: [],
    process: [
      "We verify your matching items.",
      "We share your assortment with Walmart.",
      "We request a review for placement.",
    ],
  },
  {
    id: "target-plus",
    name: "Target Plus",
    brand: "#CC0000",
    fg: "#ffffff",
    mono: "◎",
    type: "Big-Box Retail",
    filters: ["Big-Box Retail"],
    headline:
      "Invite-only marketplace access to sell alongside Target's own assortment.",
    who: "Established brands",
    tags: ["Most categories", "Invite-only"],
    requirements: [],
    process: [
      "We submit your application to Target Plus.",
      "Target reviews and confirms fit.",
    ],
  },
  {
    id: "lowes",
    name: "Lowe's Marketplace",
    brand: "#004990",
    fg: "#ffffff",
    mono: "L",
    type: "Big-Box Retail",
    filters: ["Big-Box Retail"],
    headline: "Marketplace access to reach Lowe's home-improvement shoppers.",
    who: "Established brands",
    tags: ["Home Improvement", "Hardware", "Tools", "Garden", "Outdoor"],
    requirements: [],
    process: [
      "We submit your brand through Goflow's Lowe's application.",
      "Lowe's reviews for category fit.",
    ],
  },
  {
    id: "macys",
    name: "Macy's Marketplace",
    brand: "#E21A2C",
    fg: "#ffffff",
    mono: "★",
    type: "Big-Box Retail",
    filters: ["Big-Box Retail", "Fashion & Beauty"],
    headline: "Marketplace access to Macy's department-store audience.",
    who: "Established consumer brands",
    tags: ["Fashion", "Beauty", "Home", "Gifts"],
    requirements: [],
    process: [
      "We submit your brand through Goflow's Macy's application.",
      "Macy's reviews for fit.",
    ],
  },
  {
    id: "nordstrom",
    name: "Nordstrom Marketplace",
    brand: "#0A0A0A",
    fg: "#ffffff",
    mono: "N",
    type: "Big-Box Retail",
    filters: ["Big-Box Retail", "Fashion & Beauty"],
    headline:
      "Premium marketplace access — apparel is the current priority, with beauty, home and accessories growing fast.",
    who: "Premium brands (YC / Gen-Z and men's apparel prioritized)",
    tags: ["Apparel", "Beauty", "Shoes", "Accessories", "Jewelry", "Fragrance"],
    requirements: [
      "Valid, scannable barcode on every item (GTIN & EAN)",
      "US business registration (EIN, Tax ID, or LEI)",
      "US bank account",
      "W9 / W8 documentation",
      "US return address (no PO boxes)",
    ],
    process: [
      "We submit your brand through Goflow's Nordstrom application.",
      "Nordstrom reviews against current category priorities.",
    ],
  },
  {
    id: "aliexpress",
    name: "AliExpress",
    brand: "#E62E04",
    fg: "#ffffff",
    mono: "A",
    type: "International",
    filters: ["International"],
    headline:
      "Expand onto AliExpress and reach its global marketplace audience.",
    who: "Recognizable brands",
    tags: ["Fragrance", "Electronics", "Toys", "Footwear"],
    requirements: [],
    process: ["We introduce you to the AliExpress team to get onboarded."],
  },
  {
    id: "shein",
    name: "SHEIN",
    brand: "#0A0A0A",
    fg: "#ffffff",
    mono: "S",
    type: "International",
    filters: ["International", "Fashion & Beauty"],
    headline:
      "Get in front of SHEIN's fashion-first, high-velocity shopper base.",
    who: "Fashion-focused brands",
    tags: ["Apparel", "Beauty", "Accessories"],
    requirements: [],
    process: ["We introduce you to the SHEIN team to get onboarded."],
  },
  {
    id: "temu",
    name: "Temu",
    brand: "#FB7701",
    fg: "#ffffff",
    mono: "T",
    type: "International",
    filters: ["International"],
    headline: "List on Temu and tap its fast-growing, value-driven marketplace.",
    who: "Value-oriented brands",
    tags: ["Broad consumer categories"],
    requirements: [],
    process: ["We help you apply and connect with the Temu team."],
  },
  {
    id: "nocnoc",
    name: "NocNoc",
    brand: "#FF6A3D",
    fg: "#ffffff",
    mono: "n",
    type: "International",
    filters: ["International"],
    headline:
      "Expand into Latin America through NocNoc's cross-border marketplace.",
    who: "Brands looking to expand internationally",
    tags: ["Fragrance", "Cosmetics", "Women's fashion", "Electronics"],
    requirements: [],
    process: ["We introduce you to the NocNoc team to plan your LATAM launch."],
  },
  {
    id: "retail-expansion",
    name: "Retail Expansion",
    brand: "#536DFE",
    fg: "#ffffff",
    mono: "▦",
    type: "Retail Network",
    filters: ["Big-Box Retail"],
    headline:
      "One intro, many doors — Home Depot, Tractor Supply, Wayfair, Target, JCPenney, Best Buy and Zoro.",
    who: "Established ecommerce brands, typically $2M+ revenue",
    tags: ["Home", "Hardware", "Electronics", "Furniture", "Apparel"],
    requirements: [],
    process: [
      "We introduce you to our retail-expansion partner.",
      "They evaluate fit across their retailer network.",
      "They make direct buyer introductions where there's a match.",
    ],
  },
];

export function filterOffers(offers: Offer[], filter: string): Offer[] {
  if (filter === "All") return offers;
  return offers.filter((o) => o.filters.includes(filter));
}
