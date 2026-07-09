// Goflow Partner Collective — offer catalog (V1 static source of truth).
// Sourced from the Goflow channel-expansion sheet. Internal rep contacts are
// intentionally NOT included here — this data is public-facing.

export type CollectField = {
  /** Field key stored in the lead's `details`. */
  name: string;
  label: string;
  type: "text" | "select";
  options?: string[];
  required?: boolean;
};

export type Offer = {
  id: string;
  /** Short label, e.g. "Amazon NSI". */
  name: string;
  /** Full program name, e.g. "Amazon New Seller Incentives". */
  fullName: string;
  /** Path to a bundled logo asset. When absent, a wordmark is shown. */
  logo?: string;
  /** Short brand word used when there's no logo asset. */
  wordmark?: string;
  /** Brand accent color (hex) for the card top rule + accents. */
  brand: string;
  /** High-level program type, shown as a tag. */
  type: string;
  /** Filter buckets this offer belongs to. */
  filters: string[];
  /** Product/category tags. Also the input for future recommendation logic. */
  tags: string[];
  /** 1–2 sentence description of what the program is / what it's for. */
  description: string;
  /** Who the program is looking for. */
  whoItsFor: string;
  /** Concrete requirements a brand must meet (may be empty). */
  requirements: string[];
  /** Plain-English "how it works" steps (rep names/emails stripped). */
  process: string[];
  /** Offer-specific intake questions, added on top of the base fields. */
  collect: CollectField[];
  /** Custom action-button label (defaults to "Request intro to {name}"). */
  cta?: string;
  /** External URL. When set, the modal shows a join button instead of a form. */
  link?: string;
  /** Informational site shown as a "Visit site" link. */
  website?: string;
  /** Application. When embed=true the form renders in an iframe; else a link-out button. */
  apply?: { url: string; embed?: boolean; label?: string };
};

export const FILTERS = [
  "All",
  "Amazon",
  "Big-Box Retail",
  "International",
  "Fashion & Beauty",
  "Community",
] as const;

const CATEGORY_FIELD = (options?: string[]): CollectField =>
  options
    ? { name: "category", label: "Primary category", type: "select", options }
    : { name: "category", label: "Primary category", type: "text" };

export const OFFERS: Offer[] = [
  {
    id: "amazon-mcf",
    website: "https://sell.amazon.com/fulfillment-by-amazon/fba-multichannel",
    name: "Amazon MCF",
    fullName: "Amazon Multi-Channel Fulfillment — Preferred Pricing",
    logo: "/logos/amazon.ico",
    brand: "#FF9900",
    type: "Amazon Program",
    filters: ["Amazon"],
    tags: ["All categories", "Fulfillment"],
    description:
      "Use Amazon's fulfillment network to ship your off-Amazon orders at preferred rates — up to 15% off MCF fees, plus FBA credits and unbranded packaging.",
    whoItsFor: "Sellers moving 100K+ off-Amazon units a year",
    requirements: [],
    process: [
      "We confirm your off-Amazon volume qualifies.",
      "We pass your details to Amazon's MCF team.",
      "Amazon assigns you a dedicated rep to get set up.",
    ],
    collect: [
      {
        name: "units",
        label: "Annual off-Amazon units",
        type: "select",
        options: ["Under 100K", "100K – 500K", "500K – 1M", "1M+"],
        required: true,
      },
    ],
  },
  {
    id: "amazon-nsi",
    website: "https://sell.amazon.com/grow",
    name: "Amazon NSI",
    fullName: "Amazon New Seller Incentives",
    logo: "/logos/amazon.ico",
    brand: "#FF9900",
    type: "Amazon Program",
    filters: ["Amazon"],
    tags: ["All categories", "New to Amazon"],
    description:
      "The launch credits and incentives Amazon gives brand-new sellers to get momentum in their first months on the marketplace.",
    whoItsFor: "Brand-new Amazon sellers",
    requirements: [],
    process: [
      "We verify you're new to Amazon.",
      "We enroll you in the New Seller Incentives program.",
    ],
    collect: [
      {
        name: "amazonStatus",
        label: "Where are you with Amazon?",
        type: "select",
        options: ["Not selling yet", "Just started", "Established seller"],
        required: true,
      },
    ],
  },
  {
    id: "walmart-nss",
    website:
      "https://marketplace.walmart.com/nss-cp/?utm_source=goflow&utm_medium=channelpartner&utm_campaign=40235183-fy27-us-mp-cp-gfl-nss-nss",
    apply: {
      url: "https://marketplace.walmart.com/nss-cp/?utm_source=goflow&utm_medium=channelpartner&utm_campaign=40235183-fy27-us-mp-cp-gfl-nss-nss",
      label: "Apply — up to $75K in savings",
    },
    name: "Walmart NSS",
    fullName: "Walmart New Seller Savings",
    logo: "/logos/walmart.ico",
    brand: "#0071DC",
    type: "Big-Box Retail",
    filters: ["Big-Box Retail"],
    tags: ["Most categories", "Incentives"],
    description:
      "Up to $75K in savings and incentives to launch and scale on Walmart Marketplace, with a dedicated Walmart account manager.",
    whoItsFor: "Sellers doing $1M+ GMV and not yet on Walmart",
    requirements: [],
    process: [
      "We meet with you to confirm fit.",
      "We submit your details to Walmart.",
      "Walmart assigns you a dedicated BDM.",
    ],
    collect: [
      {
        name: "gmv",
        label: "Annual GMV",
        type: "select",
        options: ["Under $1M", "$1M – $5M", "$5M – $20M", "$20M+"],
        required: true,
      },
      {
        name: "onWalmart",
        label: "Already on Walmart?",
        type: "select",
        options: ["No", "Yes"],
      },
    ],
  },
  {
    id: "walmart-fav",
    website:
      "https://marketplacelearn.walmart.com/guides/Success-Hub:-Add-trending-items",
    name: "Walmart Customer Favorites",
    fullName: "Walmart Customer Favorites",
    logo: "/logos/walmart.ico",
    brand: "#0071DC",
    type: "Big-Box Retail",
    filters: ["Big-Box Retail"],
    tags: ["Walmart demand categories", "Assortment"],
    description:
      "Get your best-selling items matched against Walmart's high-demand catalog and reviewed for prioritized placement.",
    whoItsFor: "Sellers with 125+ matching items",
    requirements: [],
    process: [
      "We verify your matching items.",
      "We share your assortment with Walmart.",
      "We request a review for placement.",
    ],
    collect: [
      {
        name: "skus",
        label: "Roughly how many matching SKUs?",
        type: "select",
        options: ["Under 125", "125 – 500", "500+"],
        required: true,
      },
    ],
  },
  {
    id: "target-plus",
    website: "https://plus.target.com",
    apply: {
      url: "https://share.hsforms.com/11LMJrXewTFalUIwYloJSyQ4cwyj?partnerstack_click_id=wtmot3duBzMR6R&partnerstack_partner_key=bd1a1be36776",
      embed: true,
    },
    name: "Target Plus",
    fullName: "Target Plus",
    logo: "/logos/target.ico",
    brand: "#CC0000",
    type: "Big-Box Retail",
    filters: ["Big-Box Retail"],
    tags: ["Most categories", "Invite-only"],
    description:
      "Invite-only access to sell your brand alongside Target's own assortment on Target.com.",
    whoItsFor: "Established brands",
    requirements: [],
    process: [
      "We submit your application to Target Plus.",
      "Target reviews and confirms fit.",
    ],
    collect: [
      CATEGORY_FIELD(),
      {
        name: "years",
        label: "Years in business",
        type: "select",
        options: ["Under 1", "1 – 3", "3 – 5", "5+"],
      },
    ],
  },
  {
    id: "lowes",
    website: "https://www.lowes.com/l/about/lowes-marketplace",
    name: "Lowe's Marketplace",
    fullName: "Lowe's Marketplace",
    wordmark: "Lowe's",
    brand: "#004990",
    type: "Big-Box Retail",
    filters: ["Big-Box Retail"],
    tags: ["Home Improvement", "Hardware", "Tools", "Garden", "Outdoor"],
    description:
      "Sell your home-improvement products to Lowe's online shoppers through its third-party marketplace.",
    whoItsFor: "Established brands",
    requirements: [],
    process: [
      "We submit your brand through Goflow's Lowe's application.",
      "Lowe's reviews for category fit.",
    ],
    collect: [CATEGORY_FIELD()],
  },
  {
    id: "macys",
    website: "https://marketplace.macys.com",
    apply: {
      url: "https://share.hsforms.com/1UQ5If8SlQlOnZDFuVfcEAA4cwyj",
      embed: true,
    },
    name: "Macy's Marketplace",
    fullName: "Macy's Marketplace",
    logo: "/logos/macys.ico",
    brand: "#E21A2C",
    type: "Big-Box Retail",
    filters: ["Big-Box Retail", "Fashion & Beauty"],
    tags: ["Fashion", "Beauty", "Home", "Gifts"],
    description:
      "Reach Macy's department-store audience by listing your brand on the Macy's online marketplace.",
    whoItsFor: "Established consumer brands",
    requirements: [],
    process: [
      "We submit your brand through Goflow's Macy's application.",
      "Macy's reviews for fit.",
    ],
    collect: [CATEGORY_FIELD()],
  },
  {
    id: "nordstrom",
    website: "https://www.nordstrom.com",
    apply: {
      url: "https://share.hsforms.com/1UQ5If8SlQlOnZDFuVfcEAA4cwyj",
      embed: true,
    },
    name: "Nordstrom Marketplace",
    fullName: "Nordstrom Marketplace",
    wordmark: "Nordstrom",
    brand: "#0A0A0A",
    type: "Big-Box Retail",
    filters: ["Big-Box Retail", "Fashion & Beauty"],
    tags: ["Apparel", "Beauty", "Shoes", "Accessories", "Jewelry", "Fragrance"],
    description:
      "Premium marketplace placement on Nordstrom.com — apparel is the current priority, with beauty, home and accessories growing fast.",
    whoItsFor: "Premium brands (YC / Gen-Z and men's apparel prioritized)",
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
    collect: [
      CATEGORY_FIELD([
        "Apparel",
        "Beauty",
        "Home",
        "Kids",
        "Shoes",
        "Accessories",
        "Jewelry",
        "Fragrance",
      ]),
    ],
  },
  {
    id: "aliexpress",
    website: "https://sell.aliexpress.com",
    name: "AliExpress",
    fullName: "AliExpress Marketplace",
    logo: "/logos/aliexpress.ico",
    brand: "#E62E04",
    type: "International",
    filters: ["International"],
    tags: ["Fragrance", "Electronics", "Toys", "Footwear"],
    description:
      "Expand internationally by putting your brand in front of AliExpress's global marketplace shoppers.",
    whoItsFor: "Recognizable brands",
    requirements: [],
    process: ["We introduce you to the AliExpress team to get onboarded."],
    collect: [
      CATEGORY_FIELD(),
      { name: "regions", label: "Target regions", type: "text" },
    ],
  },
  {
    id: "shein",
    website: "https://marketplace.shein.com",
    name: "SHEIN",
    fullName: "SHEIN Marketplace",
    logo: "/logos/shein.ico",
    brand: "#0A0A0A",
    type: "International",
    filters: ["International", "Fashion & Beauty"],
    tags: ["Apparel", "Beauty", "Accessories"],
    description:
      "Get your products in front of SHEIN's fashion-first, high-velocity global shopper base.",
    whoItsFor: "Fashion-focused brands",
    requirements: [],
    process: ["We introduce you to the SHEIN team to get onboarded."],
    collect: [CATEGORY_FIELD()],
  },
  {
    id: "temu",
    website: "https://seller.temu.com",
    name: "Temu",
    fullName: "Temu Marketplace",
    logo: "/logos/temu.ico",
    brand: "#FB7701",
    type: "International",
    filters: ["International"],
    tags: ["Broad consumer categories"],
    description:
      "List on Temu to tap one of the fastest-growing, value-driven marketplaces.",
    whoItsFor: "Value-oriented brands",
    requirements: [],
    process: ["We help you apply and connect with the Temu team."],
    collect: [CATEGORY_FIELD()],
  },
  {
    id: "nocnoc",
    website: "https://nocnocstore.com",
    name: "NocNoc",
    fullName: "NocNoc — Latin America",
    wordmark: "NocNoc",
    brand: "#FF6A3D",
    type: "International",
    filters: ["International"],
    tags: ["Fragrance", "Cosmetics", "Women's fashion", "Electronics"],
    description:
      "Expand into Latin America through NocNoc's cross-border marketplace — no local entity required.",
    whoItsFor: "Brands looking to expand internationally",
    requirements: [],
    process: ["We introduce you to the NocNoc team to plan your LATAM launch."],
    collect: [
      CATEGORY_FIELD(),
      { name: "regions", label: "Target LATAM markets", type: "text" },
    ],
  },
  {
    id: "retail-expansion",
    website: "https://www.ecomdiversify.com",
    name: "Retail Expansion",
    fullName: "Retail Expansion Network",
    wordmark: "Retail",
    brand: "#536DFE",
    type: "Retail Network",
    filters: ["Big-Box Retail"],
    tags: ["Home", "Hardware", "Electronics", "Furniture", "Apparel"],
    description:
      "One introduction that opens doors to major retailers — Home Depot, Tractor Supply, Wayfair, Target, JCPenney, Best Buy and Zoro — through Goflow's retail partner.",
    whoItsFor: "Established ecommerce brands, typically $2M+ revenue",
    requirements: [],
    process: [
      "We introduce you to our retail-expansion partner.",
      "They evaluate fit across their retailer network.",
      "They make direct buyer introductions where there's a match.",
    ],
    collect: [
      {
        name: "revenue",
        label: "Annual revenue",
        type: "select",
        options: ["Under $2M", "$2M – $10M", "$10M – $50M", "$50M+"],
        required: true,
      },
      {
        name: "retailers",
        label: "Current retailers (if any)",
        type: "text",
      },
    ],
  },
  {
    id: "partner-dinners",
    name: "Partner Dinners",
    fullName: "Exclusive Partner Dinners",
    wordmark: "Dinners",
    brand: "#FF9B00",
    type: "Events",
    filters: ["Community"],
    tags: ["Invite-only", "Networking", "Monthly"],
    description:
      "Monthly, invite-only dinners we host with a partner — an intimate table of top ecommerce executives for great food and candid, off-the-record conversation.",
    whoItsFor: "Founders and senior leaders at established ecommerce brands",
    requirements: [],
    process: [
      "Tell us your city and a bit about your brand.",
      "We confirm fit and send an invite to the next dinner near you.",
    ],
    collect: [
      {
        name: "location",
        label: "Preferred location",
        type: "select",
        options: ["New York City", "Miami", "New Jersey", "Other"],
        required: true,
      },
    ],
    cta: "Request an invite",
  },
];

export function filterOffers(offers: Offer[], filter: string): Offer[] {
  if (filter === "All") return offers;
  return offers.filter((o) => o.filters.includes(filter));
}

export function findOffer(id: string | null): Offer | undefined {
  if (!id) return undefined;
  return OFFERS.find((o) => o.id === id);
}
