// Goflow Growth Engine — offer catalog (V1 static source of truth).
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
  /** Optional second mark for co-branded offers. */
  secondaryLogo?: string;
  /** Wider frame for horizontal wordmarks. */
  logoLayout?: "wide" | "wordmark" | "ultraWide" | "paired";
  /** Color treatment for a monochrome bundled mark. */
  logoTone?: "target" | "macys" | "newegg" | "aliexpress";
  /** Lucide mark for Goflow-owned offers without an external brand logo. */
  icon?: "calendar" | "landmark" | "network" | "shield";
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
  /** Verified external application. */
  apply?: { url: string; label?: string; embed?: boolean };
};

export const FILTERS = [
  "All",
  "Marketplaces",
  "Retail",
  "Services",
  "Events",
] as const;

const CATEGORY_FIELD = (options?: string[]): CollectField =>
  options
    ? { name: "category", label: "Primary category", type: "select", options }
    : { name: "category", label: "Primary category", type: "text" };

const RETAIL_OPPORTUNITY_FIELDS: CollectField[] = [
  {
    name: "revenue",
    label: "Annual revenue",
    type: "select",
    options: ["Under $2M", "$2M - $10M", "$10M - $50M", "$50M+"],
    required: true,
  },
  CATEGORY_FIELD(),
  {
    name: "retailers",
    label: "Current retail relationships",
    type: "text",
  },
];

function retailOpportunity({
  id,
  name,
  website,
  description,
  tags,
  brand,
  logo,
  logoLayout,
  logoTone,
  wordmark,
  filters = ["Retail"],
  type = "Retail opportunity",
}: {
  id: string;
  name: string;
  website: string;
  description: string;
  tags: string[];
  brand: string;
  logo?: string;
  logoLayout?: Offer["logoLayout"];
  logoTone?: Offer["logoTone"];
  wordmark?: string;
  filters?: string[];
  type?: string;
}): Offer {
  return {
    id,
    name,
    fullName: name,
    website,
    description,
    logo,
    logoLayout,
    logoTone,
    wordmark: wordmark ?? name,
    brand,
    type,
    filters,
    tags,
    whoItsFor: "Established brands ready for retail expansion",
    requirements: [],
    process: [
      "Share your brand and retail goals.",
      "Goflow reviews fit and routes the right retail path.",
      "We follow up when there is a qualified next step.",
    ],
    collect: RETAIL_OPPORTUNITY_FIELDS,
  };
}

export const OFFERS: Offer[] = [
  {
    id: "jcpenney-commission-offer",
    name: "JCPenney",
    fullName: "JCPenney Commission Rate Offer",
    logo: "/logos/jcpenney.svg",
    logoLayout: "wordmark",
    brand: "#CC0102",
    apply: {
      url: "https://forms.cloud.microsoft/pages/responsepage.aspx?id=oUoHsHSyjkaz937ZD_J62_AU77UpDSZOlVg0H3WT-35UNjNFVlE3MVE4TFc5MFc2UUlTNERKRUtRVi4u&route=shorturl",
      label: "Apply here directly",
    },
    type: "Marketplace exclusive",
    filters: ["Marketplaces"],
    tags: ["Goflow exclusive", "2% through September", "1% in October"],
    description:
      "Get 2% off applicable JCPenney marketplace commission rates through September. Eligible sellers get 1% off in October.",
    whoItsFor: "Goflow customers not already live on JCPenney",
    requirements: [
      "An active Goflow account",
      "Not live on JCPenney when the request is submitted",
      "JCPenney eligibility and category requirements apply",
    ],
    process: [
      "Add JCPenney to your introduction requests.",
      "Goflow confirms your eligibility and shares the right details.",
      "JCPenney reviews your marketplace opportunity.",
    ],
    collect: [],
  },
  {
    id: "amazon-mcf-tiktok",
    website:
      "https://supplychain.amazon.com/learn/tiktok-shop-promotion?utm_medium=partner&utm_source=partner&utm_campaign=us-mcf-partner-partner-tts-promotion-2607&utm_content=direct-partner-email",
    name: "Amazon MCF x TikTok",
    fullName: "Amazon MCF for TikTok Shop - 35% Off",
    logo: "/logos/amazon.ico",
    secondaryLogo: "/logos/tiktok.svg",
    logoLayout: "paired",
    brand: "#FF9900",
    type: "Marketplace program",
    filters: ["Marketplaces"],
    tags: ["TikTok Shop", "35% Off", "Fulfillment"],
    description:
      "Get 35% off Standard and Expedited Amazon MCF fulfillment for eligible U.S. TikTok Shop orders for 12 months.",
    whoItsFor: "U.S. TikTok Shop sellers using a supported integration partner",
    requirements: ["A supported TikTok Shop integration partner"],
    process: [
      "We confirm your TikTok Shop setup and integration path.",
      "Eligible Standard and Expedited orders receive the promotion automatically.",
    ],
    collect: [
      {
        name: "tiktokStore",
        label: "TikTok Shop storefront",
        type: "text",
      },
    ],
  },
  {
    id: "amazon-mcf",
    website: "https://sell.amazon.com/fulfillment-by-amazon/fba-multichannel",
    name: "Amazon MCF",
    fullName: "Amazon Multi-Channel Fulfillment — Preferred Pricing",
    logo: "/logos/amazon.ico",
    brand: "#FF9900",
    type: "Marketplace program",
    filters: ["Marketplaces"],
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
    type: "Marketplace program",
    filters: ["Marketplaces"],
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
      label: "Apply here directly",
    },
    name: "Walmart NSS",
    fullName: "Walmart New Seller Savings",
    logo: "/logos/walmart.ico",
    brand: "#0071DC",
    type: "Marketplace",
    filters: ["Marketplaces"],
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
    type: "Marketplace",
    filters: ["Marketplaces"],
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
    website: "https://lp.goflow.com/sell-on-target-plus-with-goflow/",
    apply: {
      url: "https://share.hsforms.com/11LMJrXewTFalUIwYloJSyQ4cwyj",
      label: "Apply here directly",
    },
    name: "Target Plus",
    fullName: "Target Plus",
    logo: "/logos/target.svg",
    logoTone: "target",
    brand: "#CC0000",
    type: "Marketplace",
    filters: ["Marketplaces"],
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
    logo: "/logos/lowes.svg",
    logoLayout: "wide",
    brand: "#004990",
    type: "Marketplace",
    filters: ["Marketplaces"],
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
      label: "Apply here directly",
    },
    name: "Macy's Marketplace",
    fullName: "Macy's Marketplace",
    logo: "/logos/macys.svg",
    logoTone: "macys",
    brand: "#E21A2C",
    type: "Marketplace",
    filters: ["Marketplaces"],
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
      url: "https://share.hsforms.com/1APbMcrL5S1KhNZl09fmFTA4cwyj",
      label: "Apply here directly",
    },
    name: "Nordstrom Marketplace",
    fullName: "Nordstrom Marketplace",
    logo: "/logos/nordstrom.ico",
    brand: "#0A0A0A",
    type: "Marketplace",
    filters: ["Marketplaces"],
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
    logo: "/logos/aliexpress.svg",
    logoTone: "aliexpress",
    brand: "#E62E04",
    type: "Marketplace",
    filters: ["Marketplaces"],
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
    id: "mercado-libre",
    website: "https://global-selling.mercadolibre.com/landing/about",
    name: "Mercado Libre",
    fullName: "Mercado Libre Global Selling",
    logo: "/logos/mercado-libre.png",
    logoLayout: "wide",
    brand: "#FFE600",
    type: "Marketplace",
    filters: ["Marketplaces"],
    tags: ["Latin America", "Cross border", "Global Selling"],
    description:
      "Sell across Mercado Libre marketplaces in Mexico, Brazil, Chile, Colombia, and Argentina with one Global Selling account.",
    whoItsFor: "Brands ready to grow in Latin America",
    requirements: [],
    process: [
      "Add Mercado Libre to your requests.",
      "Goflow reviews your catalog, target countries, and cross border readiness.",
      "Submit your request, then apply directly to Global Selling with Goflow support.",
    ],
    collect: [
      { name: "regions", label: "Target Latin American markets", type: "text" },
    ],
  },
  {
    id: "shein",
    website: "https://marketplace.shein.com",
    name: "SHEIN",
    fullName: "SHEIN Marketplace",
    logo: "/logos/shein.ico",
    brand: "#0A0A0A",
    type: "Marketplace",
    filters: ["Marketplaces"],
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
    type: "Marketplace",
    filters: ["Marketplaces"],
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
    name: "nocnoc",
    fullName: "nocnoc — Latin America",
    wordmark: "nocnoc",
    brand: "#FF6A3D",
    type: "Marketplace",
    filters: ["Marketplaces"],
    tags: ["Fragrance", "Cosmetics", "Women's fashion", "Electronics"],
    description:
      "Expand into Latin America through nocnoc's cross-border marketplace — no local entity required.",
    whoItsFor: "Brands looking to expand internationally",
    requirements: [],
    process: ["We introduce you to the nocnoc team to plan your LATAM launch."],
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
    logo: "/logos/ecomdiversify.ico",
    brand: "#536DFE",
    type: "Retail Network",
    filters: ["Retail"],
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
    id: "tactical-logistics",
    website: "https://tacticallogistic.com/",
    name: "Tactical Logistics",
    fullName: "Tactical Logistic Solutions",
    logo: "/logos/tactical-logistics.ico",
    brand: "#163B65",
    type: "Operations Partner",
    filters: ["Services"],
    tags: ["3PL", "Multichannel", "Inventory"],
    description:
      "Get end-to-end 3PL support, from freight forwarding and FBA prep to warehousing and D2C fulfillment.",
    whoItsFor: "Brands scaling fulfillment across more than one sales channel",
    requirements: [],
    process: [
      "We introduce you to Tactical's logistics team.",
      "They review your fulfillment footprint, volume, and channel mix.",
      "Together, you map the right supply-chain and fulfillment path.",
    ],
    collect: [
      {
        name: "monthlyOrders",
        label: "Approximate monthly orders",
        type: "select",
        options: ["Under 1,000", "1,000 - 10,000", "10,000 - 50,000", "50,000+"],
      },
      {
        name: "channels",
        label: "Channels you need to fulfill",
        type: "text",
      },
    ],
  },
  {
    id: "amazon-account-health",
    website: "https://sell.amazon.com/blog/seller-account-health",
    name: "Amazon Account Health",
    fullName: "Amazon Account Health and Suspension Support",
    logo: "/logos/amazon.ico",
    brand: "#FF9900",
    type: "Goflow Support",
    filters: ["Services"],
    tags: ["Account Health", "Suspension", "Reinstatement"],
    description:
      "If your Amazon account is suspended or at risk, Goflow will assess the situation and route you to the right recovery support path.",
    whoItsFor: "Amazon sellers navigating a suspension, reinstatement, or account-health issue",
    requirements: [],
    process: [
      "Tell us what happened and where you need help.",
      "Goflow reviews the context and routes the right support path.",
      "We follow up with the next steps for your account situation.",
    ],
    collect: [
      {
        name: "issueType",
        label: "What do you need help with?",
        type: "select",
        options: [
          "Account suspended",
          "Account health warning",
          "Appeal or reinstatement",
          "Other Amazon account issue",
        ],
        required: true,
      },
      {
        name: "caseSummary",
        label: "Briefly describe the issue",
        type: "text",
      },
    ],
  },
  {
    id: "goflow-core",
    website: "https://ps.goflow.com/sadya-core",
    apply: {
      url: "https://ps.goflow.com/sadya-core",
      label: "Sign up for Goflow Core",
      embed: false,
    },
    name: "Goflow Core",
    fullName: "Goflow Core",
    icon: "network",
    brand: "#536DFE",
    type: "Goflow Service",
    filters: ["Services"],
    tags: ["Operations", "Multichannel", "Growth"],
    description:
      "Start with Goflow Core and bring the work behind your growth channels into one platform.",
    whoItsFor: "Brands ready for a more connected operating foundation",
    requirements: [],
    process: [
      "Add Goflow Core to your requests.",
      "Submit your request, then apply directly with Goflow support.",
    ],
    collect: [],
  },
  {
    id: "goflow-capital",
    name: "Goflow Capital",
    fullName: "Goflow Capital",
    logo: "/logos/goflow-capital.svg",
    logoLayout: "ultraWide",
    brand: "#536DFE",
    type: "Goflow Service",
    filters: ["Services"],
    tags: ["Working Capital", "Inventory", "Expansion"],
    description:
      "Explore working-capital options for inventory, operations, expansion, and cash-flow timing through Goflow Capital.",
    whoItsFor: "Eligible Goflow users in the U.S., U.K., and Canada",
    requirements: [
      "Availability is subject to eligibility, review, underwriting, approval, and partner terms.",
    ],
    process: [
      "Answer a few questions about your business and capital needs.",
      "Review available working-capital options with no obligation to accept an offer.",
    ],
    collect: [
      {
        name: "capitalUse",
        label: "What would you use capital for?",
        type: "select",
        options: [
          "Inventory or replenishment",
          "Seasonal demand planning",
          "Channel or product expansion",
          "Cash-flow timing",
          "Other",
        ],
        required: true,
      },
    ],
  },
  {
    id: "partner-dinners",
    website: "https://www.goflow.com/",
    name: "Exclusive Events",
    fullName: "Great Exclusive Events",
    icon: "calendar",
    brand: "#FF9B00",
    type: "Events",
    filters: ["Events"],
    tags: ["Invite-only", "Networking", "Monthly"],
    description:
      "Small, invite-only events and dinners with top ecommerce executives for great food and candid, off-the-record conversation.",
    whoItsFor: "Founders and senior leaders at established ecommerce brands",
    requirements: [],
    process: [
      "Tell us your city and a bit about your brand.",
      "We confirm fit and send an invite to the next event near you.",
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
  retailOpportunity({
    id: "home-depot",
    name: "Home Depot",
    website: "https://corporate.homedepot.com/page/contact-us",
    logo: "/logos/home-depot.svg",
    tags: ["Home Improvement", "Hardware", "Tools"],
    brand: "#F96302",
    description:
      "Present your home-improvement assortment for a Goflow-reviewed introduction to The Home Depot's supplier path. We will assess category fit, product readiness, and the right next conversation.",
  }),
  retailOpportunity({
    id: "newegg",
    name: "Newegg",
    website: "https://seller.newegg.com/",
    logo: "/logos/newegg.svg",
    logoTone: "newegg",
    filters: ["Marketplaces"],
    type: "Marketplace",
    tags: ["Electronics", "Gaming", "Technology"],
    brand: "#F5A623",
    description:
      "Bring your electronics, gaming, and technology assortment to Newegg Marketplace. Goflow can help frame the brand story and seller readiness before the marketplace review.",
  }),
  retailOpportunity({
    id: "ulta-beauty",
    name: "Ulta Beauty",
    website: "https://www.ulta.com/company/marketplace",
    logo: "/logos/ulta-beauty.ico",
    filters: ["Marketplaces"],
    type: "Marketplace",
    tags: ["Beauty", "Skincare", "Wellness"],
    brand: "#E74B9C",
    description:
      "Ulta Beauty Marketplace lets approved brands sell on Ulta.com while shipping domestic inventory directly to guests. Goflow can help position your beauty assortment for review.",
  }),
  retailOpportunity({
    id: "best-buy",
    name: "Best Buy",
    website: "https://www.bestbuy.com/seller/signup",
    logo: "/logos/best-buy.ico",
    filters: ["Marketplaces"],
    type: "Marketplace",
    tags: ["Electronics", "Technology", "Home"],
    brand: "#0046BE",
    description:
      "Best Buy Marketplace gives qualified sellers a route to list on BestBuy.com with support from its Seller Success team. Goflow can prepare the right introduction for your assortment.",
  }),
  retailOpportunity({
    id: "chewy",
    name: "Chewy",
    website: "https://cph.chewy.com/home",
    logo: "/logos/chewy.ico",
    filters: ["Marketplaces"],
    type: "Marketplace",
    tags: ["Pet", "Health", "Supplies"],
    brand: "#2652CC",
    description:
      "Chewy Partner Hub is the vendor path for pet brands ready to reach Chewy customers. Share your product range and fulfillment readiness so Goflow can route the opportunity thoughtfully.",
  }),
  retailOpportunity({
    id: "hobby-lobby",
    name: "Hobby Lobby",
    website: "https://www.hobbylobby.com/",
    logo: "/logos/hobby-lobby.svg",
    logoLayout: "ultraWide",
    tags: ["Crafts", "Home", "Seasonal"],
    brand: "#CF1F2F",
    description:
      "Put your crafts, seasonal, home, or hobby assortment forward for a Goflow-reviewed introduction to Hobby Lobby. We will focus the request around the category and buyer fit.",
  }),
  retailOpportunity({
    id: "cvs",
    name: "CVS",
    website: "https://www.cvshealth.com/contact.html?vendor=here",
    logo: "/logos/cvs.ico",
    tags: ["Health", "Beauty", "Wellness"],
    brand: "#CC0000",
    description:
      "Goflow reviews health, beauty, and wellness brands that may suit CVS Pharmacy's assortment. When the timing and category fit are right, we route the next buyer conversation.",
  }),
  retailOpportunity({
    id: "zoro",
    name: "Zoro",
    website: "https://www.zoro.com/sell-on-zoro/",
    wordmark: "Zoro",
    filters: ["Marketplaces"],
    type: "Marketplace",
    tags: ["Tools", "Hardware", "B2B"],
    brand: "#F47A20",
    description:
      "Zoro's supplier program is built for business-ready tools, MRO, and industrial products. Goflow can help qualify your catalog, product data, and dropship readiness before the introduction.",
  }),
  retailOpportunity({
    id: "kohls",
    name: "Kohl's",
    website: "https://corporate.kohls.com/our-suppliers",
    logo: "/logos/kohls.ico",
    filters: ["Marketplaces"],
    type: "Marketplace",
    tags: ["Apparel", "Home", "Beauty"],
    brand: "#4E246E",
    description:
      "Kohl's Marketplace lets brands sell directly to Kohl's customers online. Goflow can route an introduction for apparel, home, and beauty brands that fit its digital marketplace.",
  }),
  retailOpportunity({
    id: "mathis-home",
    name: "Mathis Home",
    website: "https://www.mathishome.com/marketplace/marketplace.html",
    logo: "/logos/mathis-home.webp",
    filters: ["Marketplaces"],
    type: "Marketplace",
    tags: ["Furniture", "Home", "Decor"],
    brand: "#B78B57",
    description:
      "Mathis Marketplace gives home and furniture sellers a direct route to its online audience. Goflow can help package your catalog and integration readiness for the marketplace team.",
  }),
  retailOpportunity({
    id: "costco-next",
    name: "Costco Next",
    website: "https://www.costco.com/costco-next-menu.html",
    logo: "/logos/costco.svg",
    logoLayout: "wide",
    tags: ["Home", "Electronics", "Lifestyle"],
    brand: "#E31837",
    description:
      "Costco Next connects Costco members to select brands for direct purchase at a Costco member value. Goflow will assess whether your brand belongs in a Costco supplier conversation.",
  }),
  retailOpportunity({
    id: "menards",
    name: "Menards",
    website: "https://www.menards.com/forms/supplier/supplier.html",
    logo: "/logos/menards.svg",
    logoLayout: "ultraWide",
    tags: ["Home Improvement", "Hardware", "Outdoor"],
    brand: "#0A8A31",
    description:
      "Menards accepts supplier inquiries across home, hardware, outdoor, and seasonal categories. Goflow can help package your assortment for a focused buyer introduction.",
  }),
];

export function filterOffers(offers: Offer[], filter: string): Offer[] {
  if (filter === "All") return offers;
  return offers.filter((o) => o.filters.includes(filter));
}

export function findOffer(id: string | null): Offer | undefined {
  if (!id) return undefined;
  return OFFERS.find((o) => o.id === id);
}
