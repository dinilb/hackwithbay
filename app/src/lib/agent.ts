// ─────────────────────────────────────────────────────────────────────────
// Scripted "agent". Parses list / search / buy intent by keyword, runs REAL
// queries over the dummy database, and narrates like a system log. No API.
// ─────────────────────────────────────────────────────────────────────────
import { DB_STATS, type Row } from "../data/mercato";
import {
  searchOffers, listOffers, sortRows, placeOrder, money,
  type SortKey, type Confirmation,
} from "./search";

export type StepTone = "info" | "pending" | "authorized" | "denied";
export type Step = { text: string; tone: StepTone };

export type AgentResult =
  | { kind: "search"; query: string; rows: Row[]; summary: string }
  | { kind: "buy"; query: string; confirmation: Confirmation; summary: string }
  | { kind: "message"; summary: string };

export type Emit = (e: { step?: Step; query?: string }) => void;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const D = 280; // pause between narration steps
const commas = (n: number) => n.toLocaleString("en-US");

const SORT_HINTS: [RegExp, SortKey, string][] = [
  [/\b(cheapest|cheap|lowest|least expensive)\b/, "price", "price ↑"],
  [/\b(most reliable|reliab|dependable)\b/, "reliability", "reliability ↓"],
  [/\b(fastest|quickest|soonest|fast shipping|quick)\b/, "fulfillment", "fulfillment ↑"],
  [/\b(best selling|bestseller|popular|most sold|top selling)\b/, "sales", "sales ↓"],
  [/\b(best rated|top rated|highest rated|best reviews|best)\b/, "rating", "rating ↓"],
];

function parseSort(text: string): { sort?: SortKey; label?: string } {
  for (const [re, sort, label] of SORT_HINTS) if (re.test(text)) return { sort, label };
  return {};
}

function parseMaxPrice(text: string): number | undefined {
  const m = text.match(/(?:under|below|less than|cheaper than|max|up to|<=?)\s*\$?\s*(\d+(?:\.\d{1,2})?)/);
  return m ? Math.round(parseFloat(m[1]) * 100) : undefined;
}

/** strip verbs / price / sort phrases → the actual product query text */
function coreText(text: string): string {
  return text
    .replace(/\b(buy|order|purchase|checkout|pay for|find|search for|search|look for|show me|show|list|browse|catalog|get me|get|i want|i need|please|for me|me)\b/g, " ")
    .replace(/(?:under|below|less than|cheaper than|max|up to|<=?)\s*\$?\s*\d+(?:\.\d{1,2})?/g, " ")
    .replace(/\b(cheapest|cheap|lowest|least expensive|most reliable|reliable|dependable|fastest|quickest|soonest|best selling|bestseller|popular|most sold|top selling|best rated|top rated|highest rated|best reviews|best|the|a|an|of|with|and|all|products?|everything)\b/g, " ")
    .replace(/\$\s*\d+(?:\.\d{1,2})?/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const BUY_RE = /\b(buy|order|purchase|checkout|pay for)\b/;
const LIST_RE = /\b(list|browse|catalog|everything|show all|all products|whole (catalog|database))\b/;

export async function runAgent(input: string, emit: Emit): Promise<AgentResult> {
  const text = input.toLowerCase().trim();
  const core = coreText(text);
  const { sort, label } = parseSort(text);
  const maxPriceCents = parseMaxPrice(text);

  await step(emit, { text: "CONNECTING mercato.db", tone: "info" });

  // ── BUY ──────────────────────────────────────────────────────────────
  if (BUY_RE.test(text)) {
    const candidates = searchOffers({ text: core, maxPriceCents });
    const filtered = filterByDealer(candidates, text);
    let pool = filtered.length ? filtered : candidates;
    // Narrow to the single best-matching product, then pick the offer within it.
    if (pool.length) {
      const topProduct = pool[0].product.id;
      pool = pool.filter((r) => r.product.id === topProduct);
    }
    const chosen = pool.length ? sortRows(pool, sort ?? "price")[0] : undefined;
    if (!chosen) {
      const summary = `I couldn't find "${core || input}" in the catalog to buy. Try searching first.`;
      await step(emit, { text: "NO MATCH — NOTHING TO ORDER", tone: "denied" });
      return { kind: "message", summary };
    }
    return runBuy(chosen.offer.id, emit);
  }

  // ── LIST vs SEARCH ─────────────────────────────────────────────────────
  const isList = !core && (LIST_RE.test(text) || text === "" );
  let rows: Row[];
  let query: string;

  if (isList) {
    query = `SELECT * FROM offers JOIN products USING(product_id)\n  ORDER BY ${sort ?? "units_sold"} ${sort === "price" || sort === "fulfillment" ? "ASC" : "DESC"}`;
    emit({ query });
    await step(emit, { text: `SCANNING ${commas(DB_STATS.offers)} ROWS`, tone: "info" });
    rows = sort ? sortRows(listOffers(), sort) : listOffers();
    await step(emit, { text: `LOADED ${commas(rows.length)} OFFERS · ${DB_STATS.products} PRODUCTS`, tone: "authorized" });
    return {
      kind: "search", query, rows,
      summary: `Loaded the full catalog — ${rows.length} offers across ${DB_STATS.products} products from ${DB_STATS.dealers} dealers.`,
    };
  }

  const where = [
    core ? `product ~ '${core}'` : null,
    maxPriceCents != null ? `price < ${(maxPriceCents / 100).toFixed(0)}` : null,
  ].filter(Boolean).join(" AND ") || "true";
  query = `SELECT * FROM offers JOIN products USING(product_id)\n  WHERE ${where}\n  ORDER BY ${sort ?? "relevance"} ${sort === "price" || sort === "fulfillment" ? "ASC" : "DESC"}`;
  emit({ query });
  await step(emit, { text: `SCANNING ${commas(DB_STATS.offers)} ROWS`, tone: "info" });

  rows = searchOffers({ text: core, maxPriceCents, sort });

  if (!rows.length) {
    await step(emit, { text: "0 MATCHES", tone: "denied" });
    return { kind: "message", summary: `No offers matched "${core || input}". Try a broader term like "coffee", "gpu", or "headphones".` };
  }

  await step(emit, { text: `MATCHED ${rows.length} OFFERS`, tone: "authorized" });
  if (label) await step(emit, { text: `RANKED BY ${label}`, tone: "info" });

  const cheapest = sortRows(rows, "price")[0];
  const top = rows[0];
  return {
    kind: "search", query, rows,
    summary:
      `Found ${rows.length} offer${rows.length > 1 ? "s" : ""} for "${core || "everything"}"` +
      (maxPriceCents != null ? ` under ${money(maxPriceCents)}` : "") +
      `. Best match: ${top.product.name} from ${top.dealer.name} at ${money(top.offer.priceCents)}` +
      (cheapest.offer.id !== top.offer.id ? ` · cheapest ${money(cheapest.offer.priceCents)} at ${cheapest.dealer.name}.` : "."),
  };
}

/** Shared buy flow — also called directly by the DealerDrawer's Buy button. */
export async function runBuy(offerId: string, emit: Emit): Promise<AgentResult> {
  const confirmation = placeOrder(offerId);
  if (!confirmation) return { kind: "message", summary: "That offer is no longer available." };
  const { row, orderId, totalCents, etaDays } = confirmation;

  const query = `INSERT INTO orders (offer_id, card)\n  VALUES ('${offerId}', '•4242') RETURNING confirmation`;
  emit({ query });
  await step(emit, { text: `AUTHORIZING ${money(totalCents)}`, tone: "pending" });
  await step(emit, { text: "CHARGING card •4242", tone: "pending" });
  await step(emit, { text: `ORDER ${orderId} CONFIRMED`, tone: "authorized" });
  await step(emit, { text: "CONFIRMATION SENT", tone: "authorized" });

  return {
    kind: "buy", query, confirmation,
    summary: `Done — ordered ${row.product.name} from ${row.dealer.name} for ${money(totalCents)}, charged to card •4242. Arrives in ${etaDays} day${etaDays > 1 ? "s" : ""}. Confirmation ${orderId} sent to you.`,
  };
}

function filterByDealer(rows: Row[], text: string): Row[] {
  return rows.filter((r) => {
    const name = r.dealer.name.toLowerCase();
    const first = name.split(/[^a-z0-9]+/)[0];
    return text.includes(name) || (first.length > 3 && text.includes(first));
  });
}

async function step(emit: Emit, s: Step) {
  await wait(D);
  emit({ step: s });
}
