// ─────────────────────────────────────────────────────────────────────────
// Mercato — dummy commerce database.
//
// This module is intentionally framework-agnostic (no React, no env, no fetch)
// so an MCP server can import the SAME data + a future backend can mirror it.
// Everything is deterministic: offers are generated from a stable hash of
// (product, dealer) so the "database" looks identical on every reload.
// ─────────────────────────────────────────────────────────────────────────

export type Category =
  | "electronics" | "gaming" | "audio" | "apparel" | "coffee"
  | "outdoor" | "fitness" | "home" | "books" | "accessories";

export type Dealer = {
  id: string;
  name: string;
  badge: string;            // short emoji/mark for the row
  reliability: number;      // 0–100, dealer track record
  rating: number;           // 0–5 dealer rating
  ratingCount: number;
  totalSales: number;       // lifetime units moved
  fulfillmentDays: number;  // typical dispatch speed
  location: string;
};

export type Product = {
  id: string;
  name: string;
  category: Category;
  brand: string;
  description: string;
  image: string;            // curated stock-photo URL
  emoji: string;            // fallback art (onError)
  basePriceCents: number;   // MSRP; dealer offers vary around this
  specs: Record<string, string>;
};

export type Offer = {
  id: string;
  productId: string;
  dealerId: string;
  priceCents: number;
  stock: number;            // availability
  fulfillmentDays: number;
  rating: number;           // 0–5 offer rating
  reviews: number;          // review count
  unitsSold: number;        // sales for this offer
  reliability: number;      // 0–100 for this offer
};

export type PaymentMethod = { brand: string; last4: string; holder: string };

// A denormalized "database row": one offer joined to its product + dealer.
export type Row = { offer: Offer; product: Product; dealer: Dealer };

// ── deterministic helpers ────────────────────────────────────────────────
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
/** stable pseudo-random in [0,1) from a seed string */
function rand(seed: string): number {
  return (hash(seed) % 100000) / 100000;
}
/** keyword stock photo, stable per seed. Swap for curated Unsplash IDs anytime. */
function img(keyword: string, seed: string): string {
  return `https://loremflickr.com/600/450/${encodeURIComponent(keyword)}?lock=${hash(seed) % 900 + 100}`;
}
/** Real product photo from Amazon's media CDN (scraped). id = the /images/I/<id> token. */
const amzn = (id: string) => `https://m.media-amazon.com/images/I/${id}._AC_UL480_.jpg`;

// ── the card on file (entered once) ──────────────────────────────────────
export const paymentMethod: PaymentMethod = {
  brand: "Mercato Card",
  last4: "4242",
  holder: "Dinil B.",
};

export const CATEGORY_LABEL: Record<Category, string> = {
  electronics: "Electronics",
  gaming: "Gaming",
  audio: "Audio",
  apparel: "Apparel",
  coffee: "Coffee",
  outdoor: "Outdoor",
  fitness: "Fitness",
  home: "Home",
  books: "Books",
  accessories: "Accessories",
};

// ── dealers (suppliers) ──────────────────────────────────────────────────
export const DEALERS: Dealer[] = [
  { id: "vertex",     name: "Vertex Supply Co",     badge: "⚡", reliability: 98, rating: 4.8, ratingCount: 21400, totalSales: 1840000, fulfillmentDays: 2, location: "Austin, TX" },
  { id: "northgate",  name: "Northgate Traders",    badge: "◧", reliability: 91, rating: 4.5, ratingCount: 8730,  totalSales: 512000,  fulfillmentDays: 4, location: "Fremont, CA" },
  { id: "meridian",   name: "Meridian Goods",       badge: "◆", reliability: 95, rating: 4.7, ratingCount: 13120, totalSales: 964000,  fulfillmentDays: 3, location: "Portland, OR" },
  { id: "ironwood",   name: "Ironwood Depot",       badge: "⌁", reliability: 89, rating: 4.3, ratingCount: 6210,  totalSales: 288000,  fulfillmentDays: 3, location: "Denver, CO" },
  { id: "blueharbor", name: "BlueHarbor Trading",   badge: "◕", reliability: 96, rating: 4.8, ratingCount: 15980, totalSales: 733000,  fulfillmentDays: 2, location: "Nashville, TN" },
  { id: "crestline",  name: "Crestline Retail",     badge: "❖", reliability: 93, rating: 4.6, ratingCount: 9840,  totalSales: 604000,  fulfillmentDays: 3, location: "Minneapolis, MN" },
  { id: "everline",   name: "Everline Market",      badge: "✚", reliability: 90, rating: 4.4, ratingCount: 4520,  totalSales: 197000,  fulfillmentDays: 4, location: "Raleigh, NC" },
  { id: "cardinal",   name: "Cardinal Supply",      badge: "◐", reliability: 97, rating: 4.9, ratingCount: 18730, totalSales: 421000,  fulfillmentDays: 2, location: "Seattle, WA" },
  { id: "oakhaven",   name: "Oakhaven Goods",       badge: "◒", reliability: 88, rating: 4.2, ratingCount: 3110,  totalSales: 88000,   fulfillmentDays: 5, location: "Brooklyn, NY" },
  { id: "summit",     name: "Summit Trading Co",    badge: "▲", reliability: 94, rating: 4.7, ratingCount: 11220, totalSales: 356000, fulfillmentDays: 3, location: "Boulder, CO" },
  { id: "vantage",    name: "Vantage Distribution", badge: "△", reliability: 92, rating: 4.5, ratingCount: 5680,  totalSales: 214000,  fulfillmentDays: 4, location: "Salt Lake City, UT" },
  { id: "keystone",   name: "Keystone Retail",      badge: "◉", reliability: 91, rating: 4.5, ratingCount: 7420,  totalSales: 271000,  fulfillmentDays: 3, location: "San Diego, CA" },
  { id: "fairview",   name: "Fairview Supply",      badge: "▣", reliability: 90, rating: 4.4, ratingCount: 6050,  totalSales: 245000,  fulfillmentDays: 4, location: "Columbus, OH" },
  { id: "waypoint",   name: "Waypoint Goods",       badge: "❍", reliability: 96, rating: 4.8, ratingCount: 20110, totalSales: 512000,  fulfillmentDays: 2, location: "Boston, MA" },
  { id: "beacon",     name: "Beacon Market",        badge: "◈", reliability: 87, rating: 4.2, ratingCount: 2940,  totalSales: 74000,   fulfillmentDays: 5, location: "Tampa, FL" },
  { id: "primedepot", name: "Prime Depot",          badge: "▤", reliability: 93, rating: 4.6, ratingCount: 26400, totalSales: 2210000, fulfillmentDays: 2, location: "Reno, NV" },
  { id: "swiftship",  name: "SwiftShip Direct",     badge: "»",  reliability: 95, rating: 4.7, ratingCount: 17880, totalSales: 1330000, fulfillmentDays: 1, location: "Memphis, TN" },
  { id: "metro",      name: "Metro Mercantile",     badge: "▦", reliability: 86, rating: 4.1, ratingCount: 4190,  totalSales: 133000,  fulfillmentDays: 6, location: "Newark, NJ" },
  { id: "redwood",    name: "Redwood Supply",       badge: "≈", reliability: 92, rating: 4.5, ratingCount: 8360,  totalSales: 298000,  fulfillmentDays: 3, location: "Providence, RI" },
  { id: "anvil",      name: "Anvil Retail",         badge: "▮", reliability: 89, rating: 4.3, ratingCount: 5510,  totalSales: 226000,  fulfillmentDays: 4, location: "Pittsburgh, PA" },
];

// ── products (canonical catalog) ─────────────────────────────────────────
// Compact seed rows → expanded to full Product objects with a stable image.
type Seed = [name: string, category: Category, brand: string, priceCents: number, emoji: string, keyword: string, description: string, specs: Record<string, string>];

const SEEDS: Seed[] = [
  // ── electronics ──
  ["8-in-1 USB-C Hub", "electronics", "Anchor", 3999, "🔌", "usb+hub", "One cable, eight ports — HDMI, USB-A, SD, PD passthrough.", { Ports: "8", Power: "100W PD", HDMI: "4K@60Hz" }],
  ["4K Streaming Webcam", "electronics", "Logi", 8999, "📷", "webcam", "Crisp 4K with HDR and dual-mic array for calls and streams.", { Resolution: "4K@30", Focus: "Auto", Mic: "Dual stereo" }],
  ["27\" 4K IPS Monitor", "electronics", "ViewMax", 34999, "🖥️", "computer+monitor", "27-inch 4K IPS, 99% sRGB, USB-C one-cable docking.", { Panel: "IPS 4K", Refresh: "60Hz", Ports: "USB-C 90W" }],
  ["Portable SSD 2TB", "electronics", "DataVault", 15999, "💾", "ssd+drive", "Pocket 2TB NVMe, 1050MB/s, shock-resistant shell.", { Capacity: "2TB", Speed: "1050MB/s", Interface: "USB 3.2" }],
  ["Wireless Ergo Mouse", "electronics", "KeyLabs", 5499, "🖱️", "computer+mouse", "Sculpted ergonomic mouse, silent clicks, 70-day battery.", { DPI: "4000", Battery: "70d", Buttons: "6" }],
  ["Aluminum Laptop Stand", "electronics", "DeskRise", 4499, "💻", "laptop+stand", "Adjustable aircraft-aluminum riser with cable channel.", { Material: "Aluminum", Height: "Adjustable", Fits: "11–17\"" }],
  ["Mechanical Keyboard TKL", "electronics", "KeyLabs", 9499, "⌨️", "mechanical+keyboard", "Tenkeyless hot-swap board, PBT caps, tactile browns.", { Layout: "TKL", Switch: "Tactile", Keycaps: "PBT" }],

  // ── gaming (GPUs: real data + images scraped from Amazon) ──
  ["Radeon RX 550 4GB", "gaming", "VisionTek", 18999, "🎮", amzn("61N9buUT+qL"), "Entry graphics card, 4GB GDDR5, 4K output over HDMI.", { Type: "GPU", VRAM: "4GB GDDR5", Output: "4K" }],
  ["GeForce RTX 2060 Super 8GB", "gaming", "GPVHOSO", 22999, "🎮", amzn("71xGnC4tLfL"), "8GB GDDR6 graphics card for 1080p/1440p, 256-bit bus.", { Type: "GPU", VRAM: "8GB GDDR6", Bus: "256-bit" }],
  ["GeForce RTX 5060 8GB", "gaming", "ASUS Dual", 34099, "🎮", amzn("81i5KcFKysL"), "Compact dual-fan RTX 5060 graphics card, 8GB GDDR7 OC.", { Type: "GPU", VRAM: "8GB GDDR7", Fans: "Dual" }],
  ["GeForce RTX 5060 Ti 16GB", "gaming", "PNY", 35999, "🎮", amzn("61T3vqv9bpL"), "16GB GDDR7 dual-fan graphics card built for 1440p.", { Type: "GPU", VRAM: "16GB GDDR7", Fans: "Dual" }],
  ["Radeon RX 9060 XT 16GB", "gaming", "GIGABYTE", 45999, "🎮", amzn("71L08TQedJL"), "16GB Gaming OC Radeon graphics card for high-refresh 1440p.", { Type: "GPU", VRAM: "16GB GDDR6", Edition: "Gaming OC" }],
  ["GeForce RTX 5060 Ti 16GB OC", "gaming", "ASUS Dual", 56499, "🎮", amzn("81kYKB0Aj5L"), "ASUS Dual 16GB GDDR7 OC graphics card, quiet Axial-tech fans.", { Type: "GPU", VRAM: "16GB GDDR7", Edition: "OC" }],
  ["GeForce RTX 5070 12GB", "gaming", "GIGABYTE WINDFORCE", 63599, "🎮", amzn("71kUODqPVoL"), "WINDFORCE OC 12GB GDDR7 RTX 5070 graphics card, SFF-ready.", { Type: "GPU", VRAM: "12GB GDDR7", Edition: "WINDFORCE OC" }],
  ["GeForce RTX 5080 16GB", "gaming", "PNY Epic-X", 131999, "🎮", amzn("6139iUxGy-L"), "Epic-X ARGB OC triple-fan flagship graphics card, 16GB GDDR7.", { Type: "GPU", VRAM: "16GB GDDR7", RGB: "ARGB" }],
  ["RGB Gaming Keyboard", "gaming", "Reactor", 12900, "⌨️", "gaming+keyboard", "Optical linear switches, per-key RGB, aircraft-alloy plate.", { Switch: "Optical", RGB: "Per-key", Polling: "8000Hz" }],
  ["Wireless Gaming Headset", "gaming", "Reactor", 15900, "🎧", "gaming+headset", "Low-latency 2.4GHz headset, 50mm drivers, 40h battery.", { Driver: "50mm", Latency: "2.4GHz", Battery: "40h" }],
  ["Pro Game Controller", "gaming", "Reactor", 6900, "🎮", "game+controller", "Hall-effect sticks, back paddles, swappable D-pad.", { Sticks: "Hall-effect", Paddles: "4", Connect: "USB-C/BT" }],
  ["1440p 165Hz Gaming Monitor", "gaming", "ViewMax", 27900, "🖥️", "gaming+monitor", "27-inch 1440p 165Hz, 1ms, adaptive-sync fast-IPS.", { Refresh: "165Hz", Response: "1ms", Panel: "Fast IPS" }],

  // ── audio ──
  ["Noise-Cancelling Headphones", "audio", "Auralis", 24900, "🎧", "headphones", "Adaptive ANC over-ears, 30h battery, plush memory foam.", { ANC: "Adaptive", Battery: "30h", Codec: "LDAC" }],
  ["Wireless Earbuds Pro", "audio", "Auralis", 12900, "🎧", "earbuds", "Tiny ANC buds, spatial audio, wireless charging case.", { ANC: "Yes", Battery: "8h+24h", Water: "IPX4" }],
  ["Portable Bluetooth Speaker", "audio", "BoomKit", 8900, "🔊", "bluetooth+speaker", "360° sound, IP67 waterproof, 20h party battery.", { Water: "IP67", Battery: "20h", Sound: "360°" }],
  ["Studio Monitor Speaker", "audio", "BoomKit", 17900, "🔊", "studio+speaker", "5-inch active studio monitor with tuned bass port.", { Woofer: "5\"", Power: "80W", Input: "XLR/TRS" }],
  ["USB Condenser Microphone", "audio", "VocalOne", 11900, "🎙️", "microphone", "Cardioid USB mic with tap-mute and zero-latency monitor.", { Pattern: "Cardioid", Rate: "24-bit/96k", Mute: "Tap" }],
  ["Belt-Drive Turntable", "audio", "Revolvr", 21900, "🎵", "turntable+vinyl", "Belt-drive vinyl player with built-in preamp and USB rip.", { Drive: "Belt", Preamp: "Built-in", USB: "Yes" }],

  // ── apparel ──
  ["Plain White Tee", "apparel", "Bob's", 1200, "👕", "white+tshirt", "Honest heavyweight cotton tee. No logos you didn't ask for.", { Fabric: "240gsm cotton", Fit: "Regular", Care: "Machine wash" }],
  ["Graphite Hoodie", "apparel", "Bob's", 3000, "🧥", "hoodie", "Brushed-fleece hoodie in graphite, double-lined hood.", { Fabric: "Fleece", Fit: "Relaxed", Pocket: "Kangaroo" }],
  ["Merino Wool Sweater", "apparel", "Northwool", 5800, "🧶", "wool+sweater", "Fine-gauge merino crew, temperature-regulating, itch-free.", { Wool: "Merino 18.5μ", Fit: "Slim", Care: "Hand wash" }],
  ["Selvedge Denim Jacket", "apparel", "Northwool", 8900, "🧥", "denim+jacket", "14oz selvedge trucker jacket that ages with you.", { Denim: "14oz selvedge", Fit: "Classic", Buttons: "Copper" }],
  ["Running Socks (3-pack)", "apparel", "StridePro", 1800, "🧦", "socks", "Cushioned merino-blend runners with arch lock.", { Pack: "3 pairs", Blend: "Merino", Zones: "Arch lock" }],
  ["Structured Baseball Cap", "apparel", "Bob's", 1800, "🧢", "baseball+cap", "Six-panel cotton twill cap with brass adjuster.", { Panels: "6", Fabric: "Twill", Fit: "Adjustable" }],

  // ── coffee ──
  ["House Blend 1kg", "coffee", "Daily Grind", 1900, "☕", "coffee+beans", "Everyday medium roast — cocoa, toasted nut, gentle finish.", { Roast: "Medium", Weight: "1kg", Notes: "Cocoa, nut" }],
  ["Single-Origin Ethiopia", "coffee", "Daily Grind", 2400, "🫘", "coffee+bag", "Bright washed Yirgacheffe — jasmine, citrus, tea-like.", { Roast: "Light", Weight: "340g", Notes: "Jasmine, citrus" }],
  ["Cold Brew Kit", "coffee", "Daily Grind", 2700, "🧊", "cold+brew", "Immersion cold-brew carafe with reusable steel filter.", { Volume: "1L", Filter: "Steel", Yield: "Concentrate" }],
  ["Espresso Beans 500g", "coffee", "Crema Co", 2100, "☕", "espresso", "Dark-caramel espresso blend pulled for thick crema.", { Roast: "Dark", Weight: "500g", Notes: "Caramel, cacao" }],
  ["Pour-Over Set", "coffee", "Crema Co", 3400, "⚗️", "pour+over+coffee", "Glass dripper, server, and 100 filters for clean cups.", { Dripper: "Glass", Server: "600ml", Filters: "100" }],

  // ── outdoor ──
  ["Insulated Trail Bottle", "outdoor", "Peak Supply", 1400, "🍶", "water+bottle", "24oz vacuum bottle keeps cold 24h, hot 12h.", { Volume: "24oz", Cold: "24h", Steel: "18/8" }],
  ["400lm Headlamp", "outdoor", "Peak Supply", 2900, "🔦", "headlamp", "Rechargeable 400-lumen headlamp with red night mode.", { Lumens: "400", Modes: "5", Charge: "USB-C" }],
  ["Dry Bag 20L", "outdoor", "Peak Supply", 2400, "🎒", "dry+bag", "Roll-top 20L dry sack, welded seams, floats when sealed.", { Volume: "20L", Rating: "IPX6", Seams: "Welded" }],
  ["Backpacking Camp Stove", "outdoor", "TrailPeak", 4900, "🔥", "camp+stove", "Ultralight canister stove, piezo ignition, boils in 3min.", { Weight: "73g", Output: "10,200 BTU", Ignite: "Piezo" }],
  ["Carbon Trekking Poles", "outdoor", "Summit", 6900, "🥢", "trekking+poles", "Carbon-fiber folding poles with cork grips and baskets.", { Material: "Carbon", Fold: "Z-fold", Grip: "Cork" }],

  // ── fitness ──
  ["Adjustable Dumbbell 24kg", "fitness", "CoreForm", 24900, "🏋️", "dumbbell", "5–24kg dial dumbbell replaces a full rack.", { Range: "5–24kg", Steps: "15", System: "Dial" }],
  ["Natural Rubber Yoga Mat", "fitness", "CoreForm", 6900, "🧘", "yoga+mat", "5mm grippy natural-rubber mat with alignment lines.", { Thickness: "5mm", Material: "Rubber", Grip: "High" }],
  ["Resistance Bands Set", "fitness", "CoreForm", 3400, "➰", "resistance+bands", "Five stackable bands (10–50lb) with door anchor.", { Bands: "5", Range: "10–50lb", Anchor: "Door" }],
  ["Cast Kettlebell 16kg", "fitness", "IronForge", 5900, "🔔", "kettlebell", "Single-cast 16kg bell, wide flat base, matte grip.", { Weight: "16kg", Cast: "Single", Base: "Flat" }],
  ["High-Density Foam Roller", "fitness", "CoreForm", 2900, "🧵", "foam+roller", "24-inch EVA roller with textured trigger zones.", { Length: "24\"", Density: "High", Texture: "Zones" }],

  // ── home ──
  ["Stoneware Mug Set (4)", "home", "IronKettle", 3200, "🍵", "coffee+mug", "Reactive-glaze stoneware mugs, 12oz, dishwasher-safe.", { Set: "4", Volume: "12oz", Glaze: "Reactive" }],
  ["Cedar Scented Candle", "home", "Ember & Oak", 2600, "🕯️", "candle", "Soy-wax cedar & amber candle, 60-hour clean burn.", { Wax: "Soy", Burn: "60h", Scent: "Cedar, amber" }],
  ["LED Desk Lamp", "home", "Lumen", 4200, "💡", "desk+lamp", "Dimmable LED task lamp with USB-C charge port.", { Modes: "5", CRI: "95", Port: "USB-C" }],
  ["Chunky Knit Throw", "home", "Loomly", 5400, "🧣", "throw+blanket", "Hand-loomed chunky cotton throw, 50×60in.", { Size: "50×60\"", Material: "Cotton", Weave: "Chunky" }],
  ["Enameled Cast Iron Skillet", "home", "IronKettle", 6900, "🍳", "cast+iron+skillet", "10-inch enameled skillet — sear, bake, oven to table.", { Size: "10\"", Coat: "Enamel", Oven: "500°F" }],

  // ── books ──
  ["Graph Databases (2e)", "books", "O'Rally", 4200, "📕", "book", "The practical guide to connected-data modeling.", { Pages: "238", Format: "Paperback", Topic: "Databases" }],
  ["Designing Data-Intensive Apps", "books", "O'Rally", 4800, "📗", "technical+book", "The definitive tour of scalable data systems.", { Pages: "616", Format: "Paperback", Topic: "Systems" }],
  ["The Pragmatic Programmer", "books", "Addison", 4500, "📘", "programming+book", "Timeless craft advice for working developers.", { Pages: "352", Format: "Hardcover", Topic: "Craft" }],
  ["Nova Drift (Sci-Fi)", "books", "Vela Press", 900, "📖", "paperback+book", "A generation ship, a missing star, one honest AI.", { Pages: "410", Format: "Paperback", Topic: "Sci-Fi" }],
  ["Dot-Grid Notebook", "books", "Vela Press", 800, "📒", "notebook", "A5 dot-grid, 160 numbered pages, lay-flat binding.", { Size: "A5", Pages: "160", Grid: "Dot" }],

  // ── accessories ──
  ["Leather Bifold Wallet", "accessories", "Tanner", 3800, "👛", "leather+wallet", "Full-grain vegetable-tanned bifold, RFID-blocked.", { Leather: "Full-grain", RFID: "Blocked", Cards: "8" }],
  ["Canvas Daypack 18L", "accessories", "Tanner", 5900, "🎒", "backpack", "Waxed-canvas daypack with padded 15\" laptop sleeve.", { Volume: "18L", Laptop: "15\"", Fabric: "Waxed canvas" }],
  ["Polarized Sunglasses", "accessories", "Solair", 4400, "🕶️", "sunglasses", "Polarized acetate frames, UV400, spring hinges.", { Lens: "Polarized", UV: "UV400", Frame: "Acetate" }],
  ["Water-Resistant Field Watch", "accessories", "Meridian", 12900, "⌚", "wristwatch", "Automatic field watch, sapphire crystal, 100m WR.", { Movement: "Automatic", Crystal: "Sapphire", WR: "100m" }],
];

export const PRODUCTS: Product[] = SEEDS.map(([name, category, brand, basePriceCents, emoji, keyword, description, specs], i) => {
  const id = `prd_${category}_${i}`;
  const image = keyword.startsWith("http") ? keyword : img(keyword, id);
  return { id, name, category, brand, description, image, emoji, basePriceCents, specs };
});

// ── offer generator (deterministic) ──────────────────────────────────────
function buildOffers(): Offer[] {
  const out: Offer[] = [];
  for (const p of PRODUCTS) {
    const count = 3 + (hash(p.id) % 3); // 3..5 dealers per product
    const used = new Set<number>();
    let idx = hash(p.id + "start") % DEALERS.length;
    for (let k = 0; k < count; k++) {
      while (used.has(idx)) idx = (idx + 1) % DEALERS.length;
      used.add(idx);
      const dealer = DEALERS[idx];
      const seed = `${p.id}:${dealer.id}`;
      const priceVar = 0.86 + rand(seed + "p") * 0.34;           // 0.86–1.20 × MSRP
      const raw = p.basePriceCents * priceVar;
      const priceCents = Math.max(99, Math.round(raw / 100) * 100 - 1); // .99 pricing
      const roll = rand(seed + "s");
      const stock = roll < 0.12 ? 0 : roll < 0.3 ? 1 + Math.floor(rand(seed + "s2") * 6) : 8 + Math.floor(rand(seed + "s3") * 140);
      const fulfillmentDays = Math.max(1, dealer.fulfillmentDays + (Math.floor(rand(seed + "f") * 3) - 1));
      const rating = Math.min(5, 3.9 + rand(seed + "r") * 1.1);
      const reviews = 30 + Math.floor(rand(seed + "v") * 4200);
      const unitsSold = 120 + Math.floor(rand(seed + "u") * 32000);
      const reliability = Math.min(99, dealer.reliability + (Math.floor(rand(seed + "y") * 6) - 2));
      out.push({
        id: `off_${p.id}_${dealer.id}`,
        productId: p.id,
        dealerId: dealer.id,
        priceCents,
        stock,
        fulfillmentDays,
        rating: Math.round(rating * 10) / 10,
        reviews,
        unitsSold,
        reliability,
      });
      idx = (idx + 1 + (hash(`${p.id}${k}`) % 4)) % DEALERS.length;
    }
  }
  return out;
}

export const OFFERS: Offer[] = buildOffers();

// lookup maps
const PRODUCT_BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]));
const DEALER_BY_ID = new Map(DEALERS.map((d) => [d.id, d]));

// the joined "database" — one row per offer
export const ROWS: Row[] = OFFERS.map((offer) => ({
  offer,
  product: PRODUCT_BY_ID.get(offer.productId)!,
  dealer: DEALER_BY_ID.get(offer.dealerId)!,
}));

export const OFFER_BY_ID = new Map(OFFERS.map((o) => [o.id, o]));
export const ROW_BY_OFFER = new Map(ROWS.map((r) => [r.offer.id, r]));

export const DB_STATS = {
  products: PRODUCTS.length,
  dealers: DEALERS.length,
  offers: OFFERS.length,
};
