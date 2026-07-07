// ─────────────────────────────────────────────────────────────────────────
// Pure query layer over the Mercato "database". No React, no side effects.
// A future MCP server / backend can call these exact functions.
// ─────────────────────────────────────────────────────────────────────────
import {
  ROWS, ROW_BY_OFFER, CATEGORY_LABEL, paymentMethod,
  type Row, type Category, type PaymentMethod,
} from "../data/mercato";

export type SortKey = "relevance" | "price" | "reliability" | "rating" | "sales" | "fulfillment";

export type SearchOpts = {
  text?: string;
  category?: Category;
  maxPriceCents?: number;
  minReliability?: number;
  inStockOnly?: boolean;
  sort?: SortKey;
  limit?: number;
};

export type Confirmation = {
  orderId: string;
  row: Row;
  qty: number;
  totalCents: number;
  card: PaymentMethod;
  etaDays: number;
  placedAt: string;
};

// ── formatters ───────────────────────────────────────────────────────────
export const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(n);
}

export type Availability = { label: string; tone: "green" | "amber" | "red" };
export function availability(stock: number): Availability {
  if (stock <= 0) return { label: "OUT OF STOCK", tone: "red" };
  if (stock < 8) return { label: `LOW · ${stock} LEFT`, tone: "amber" };
  return { label: "IN STOCK", tone: "green" };
}

// ── search / filter / sort ────────────────────────────────────────────────
function scoreRow(row: Row, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const { product } = row;
  const name = product.name.toLowerCase();
  // Note: dealer name is deliberately excluded — product search shouldn't match
  // a GPU just because its dealer is "BeanRoute Coffee". Dealer targeting for buys
  // is handled separately in agent.ts (filterByDealer).
  const hay = [
    product.name, product.brand, CATEGORY_LABEL[product.category], product.category,
    product.description, ...Object.values(product.specs),
  ].join(" ").toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (name.includes(t)) score += 3;
    else if (hay.includes(t)) score += 1;
  }
  return score;
}

export function searchOffers(opts: SearchOpts): Row[] {
  const tokens = (opts.text ?? "")
    .toLowerCase()
    .split(/[^a-z0-9$]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));

  let rows = ROWS.filter((r) => {
    if (opts.category && r.product.category !== opts.category) return false;
    if (opts.maxPriceCents != null && r.offer.priceCents > opts.maxPriceCents) return false;
    if (opts.minReliability != null && r.offer.reliability < opts.minReliability) return false;
    if (opts.inStockOnly && r.offer.stock <= 0) return false;
    return true;
  });

  if (tokens.length) {
    rows = rows
      .map((r) => ({ r, s: scoreRow(r, tokens) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.r);
  }

  const sort = opts.sort ?? (tokens.length ? "relevance" : "sales");
  rows = sortRows(rows, sort);
  return opts.limit ? rows.slice(0, opts.limit) : rows;
}

export function sortRows(rows: Row[], sort: SortKey): Row[] {
  const r = [...rows];
  switch (sort) {
    case "price": return r.sort((a, b) => a.offer.priceCents - b.offer.priceCents);
    case "reliability": return r.sort((a, b) => b.offer.reliability - a.offer.reliability);
    case "rating": return r.sort((a, b) => b.offer.rating - a.offer.rating || b.offer.reviews - a.offer.reviews);
    case "sales": return r.sort((a, b) => b.offer.unitsSold - a.offer.unitsSold);
    case "fulfillment": return r.sort((a, b) => a.offer.fulfillmentDays - b.offer.fulfillmentDays);
    case "relevance": default: return r; // preserve incoming (score) order
  }
}

export function listOffers(): Row[] {
  return sortRows(ROWS, "sales");
}

/** All dealer offers for the product behind a given offer/row, cheapest first. */
export function dealersForProduct(productId: string): Row[] {
  return sortRows(ROWS.filter((r) => r.product.id === productId), "price");
}

export function rowByOffer(offerId: string): Row | undefined {
  return ROW_BY_OFFER.get(offerId);
}

// ── ordering ──────────────────────────────────────────────────────────────
let orderSeq = 0;
export function placeOrder(offerId: string, qty = 1): Confirmation | null {
  const row = ROW_BY_OFFER.get(offerId);
  if (!row) return null;
  orderSeq += 1;
  const stamp = (Date.now().toString(36) + orderSeq).toUpperCase().slice(-4);
  return {
    orderId: `MCT-${stamp}`,
    row,
    qty,
    totalCents: row.offer.priceCents * qty,
    card: paymentMethod,
    etaDays: row.offer.fulfillmentDays,
    placedAt: new Date().toISOString(),
  };
}

const STOPWORDS = new Set([
  "the", "a", "an", "me", "my", "for", "and", "or", "of", "to", "with", "under",
  "below", "over", "cheapest", "best", "buy", "order", "find", "search", "get",
  "show", "list", "all", "some", "please", "any", "that", "this", "from", "in",
  "on", "at", "is", "are", "want", "need", "looking", "good", "top", "most",
  "reliable", "fast", "fastest", "purchase", "grab", "give",
]);
