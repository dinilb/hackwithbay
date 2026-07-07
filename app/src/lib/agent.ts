// ─────────────────────────────────────────────────────────────────────────
// Scripted "agent". Parses list / search / buy intent by keyword, runs REAL
// queries over the dummy database, and narrates like a real agent: it thinks
// out loud, calls named "tools" (with visible latency), and logs system
// events. No API — every tool result is still computed from the local dummy
// database, so the narration is truthful to the fake data.
// ─────────────────────────────────────────────────────────────────────────
import { DB_STATS, type Row } from "../data/mercato";
import {
  searchOffers, listOffers, sortRows, placeOrder, rowByOffer, money,
  type SortKey, type Confirmation,
} from "./search";

export type StepTone = "info" | "pending" | "authorized" | "denied";

export type Step =
  | { kind: "log"; text: string; tone: StepTone }
  | { kind: "think"; text: string }
  | {
      kind: "tool";
      name: string;
      args?: Record<string, unknown>;
      result?: string;
      ms?: number;
      running?: boolean;
    };

export type AgentResult =
  | { kind: "search"; query: string; rows: Row[]; summary: string }
  | { kind: "buy"; query: string; confirmation: Confirmation; summary: string }
  | { kind: "message"; summary: string };

export type Emit = (e: {
  step?: Step;
  query?: string;
  resolve?: { result: string; ms: number };
}) => void;

// ── timing ─────────────────────────────────────────────────────────────────
// Variable latency ranges so the demo feels like real network round-trips.
// All pacing lives here — tune these to speed up / slow down the whole demo.
const T = {
  connect: [400, 700],
  think: [700, 1260], // ~40% slower than tool/log beats — the agent visibly mulls it over
  tool: [350, 950],
  log: [140, 300],
  finalize: [900, 1400],
} as const;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const rand = (a: number, b: number) => a + Math.random() * (b - a);
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

/** Does this message want to place an order? (used to show the checkout overlay) */
export function isBuyIntent(input: string): boolean {
  return BUY_RE.test(input.toLowerCase().trim());
}

export async function runAgent(input: string, emit: Emit): Promise<AgentResult> {
  const text = input.toLowerCase().trim();
  const core = coreText(text);
  const { sort, label } = parseSort(text);
  const maxPriceCents = parseMaxPrice(text);

  // ── BUY ──────────────────────────────────────────────────────────────
  if (BUY_RE.test(text)) {
    await think(
      emit,
      `You want to buy ${core ? `"${core}"` : "this"}${maxPriceCents != null ? ` under ${money(maxPriceCents)}` : ""}. Let me find the best matching offer before I check out.`,
    );

    const pool0 = await tool(
      emit, "search_catalog",
      {
        query: core || undefined,
        max_price: maxPriceCents != null ? maxPriceCents / 100 : undefined,
      },
      () => {
        const cs = searchOffers({ text: core, maxPriceCents });
        const filtered = filterByDealer(cs, text);
        return filtered.length ? filtered : cs;
      },
      (rows) => (rows.length ? `${rows.length} candidate offer${rows.length > 1 ? "s" : ""}` : "no matches"),
    );

    // Narrow to the single best-matching product, then pick the offer within it.
    let pool = pool0;
    if (pool.length) {
      const topProduct = pool[0].product.id;
      pool = pool.filter((r) => r.product.id === topProduct);
    }
    const chosen = pool.length ? sortRows(pool, sort ?? "price")[0] : undefined;
    if (!chosen) {
      await log(emit, "NO MATCH — NOTHING TO ORDER", "denied");
      return { kind: "message", summary: `I couldn't find "${core || input}" in the catalog to buy. Try searching first.` };
    }

    await log(emit, `SELECTED ${chosen.product.name.toUpperCase()} · ${chosen.dealer.name.toUpperCase()}`, "info");
    return runBuy(chosen.offer.id, emit);
  }

  // ── connect (search / list) ────────────────────────────────────────────
  await think(emit, "Let me parse what you're after and turn it into a database query.");
  await tool(
    emit, "connect_db", { database: "mercato" },
    () => DB_STATS,
    (s) => `connected · ${s.products} products · ${s.dealers} dealers · ${commas(s.offers)} offers`,
  );

  // ── LIST vs SEARCH ─────────────────────────────────────────────────────
  const isList = !core && (LIST_RE.test(text) || text === "");
  let rows: Row[];
  let query: string;

  if (isList) {
    query = `SELECT * FROM offers JOIN products USING(product_id)\n  ORDER BY ${sort ?? "units_sold"} ${sort === "price" || sort === "fulfillment" ? "ASC" : "DESC"}`;
    emit({ query });
    rows = await tool(
      emit, "list_catalog", { order_by: sort ?? "units_sold" },
      () => (sort ? sortRows(listOffers(), sort) : listOffers()),
      (rs) => `scanned ${commas(DB_STATS.offers)} rows → ${commas(rs.length)} offers · ${DB_STATS.products} products`,
    );
    await log(emit, `LOADED ${commas(rows.length)} OFFERS · ${DB_STATS.products} PRODUCTS`, "authorized");
    return {
      kind: "search", query, rows,
      summary:
        `Loaded the full catalog — ${commas(rows.length)} offers across ${DB_STATS.products} products from ${DB_STATS.dealers} dealers` +
        (label ? `, ranked by ${label}` : "") +
        `. Click any product to compare its dealers side by side.`,
    };
  }

  const where = [
    core ? `product ~ '${core}'` : null,
    maxPriceCents != null ? `price < ${(maxPriceCents / 100).toFixed(0)}` : null,
  ].filter(Boolean).join(" AND ") || "true";
  query = `SELECT * FROM offers JOIN products USING(product_id)\n  WHERE ${where}\n  ORDER BY ${sort ?? "relevance"} ${sort === "price" || sort === "fulfillment" ? "ASC" : "DESC"}`;

  await tool(emit, "plan_query", { intent: "search", filters: where }, () => query, () => "query planned");
  emit({ query });

  rows = await tool(
    emit, "search_catalog",
    {
      query: core || undefined,
      max_price: maxPriceCents != null ? maxPriceCents / 100 : undefined,
      sort: sort ?? "relevance",
    },
    () => searchOffers({ text: core, maxPriceCents, sort }),
    (rs) => `scanned ${commas(DB_STATS.offers)} rows → ${rs.length} match${rs.length === 1 ? "" : "es"}`,
  );

  if (!rows.length) {
    await log(emit, "0 MATCHES", "denied");
    return { kind: "message", summary: `No offers matched "${core || input}". Try a broader term like "coffee", "gpu", or "headphones".` };
  }

  const dealerCount = new Set(rows.map((r) => r.dealer.id)).size;
  await log(emit, `MATCHED ${rows.length} OFFERS · ${dealerCount} DEALER${dealerCount > 1 ? "S" : ""}`, "authorized");
  if (label) {
    await tool(emit, "rank_offers", { by: label }, () => rows, () => `ranked ${rows.length} offers by ${label}`);
  }

  const cheapest = sortRows(rows, "price")[0];
  const top = rows[0];
  return {
    kind: "search", query, rows,
    summary:
      `Found ${rows.length} offer${rows.length > 1 ? "s" : ""} for "${core || "everything"}"` +
      (maxPriceCents != null ? ` under ${money(maxPriceCents)}` : "") +
      ` across ${dealerCount} dealer${dealerCount > 1 ? "s" : ""}. Best match: ${top.product.name} from ${top.dealer.name} at ${money(top.offer.priceCents)}` +
      (cheapest.offer.id !== top.offer.id ? ` · cheapest is ${money(cheapest.offer.priceCents)} at ${cheapest.dealer.name}.` : ".") +
      ` Open any row to compare the dealers head-to-head.`,
  };
}

/** Shared buy flow — also called directly by the DealerDrawer's Buy button. */
export async function runBuy(offerId: string, emit: Emit): Promise<AgentResult> {
  await think(emit, "Locking in this dealer and running checkout with the card already on file.");

  const row = await tool(
    emit, "get_offer", { offer_id: offerId },
    () => rowByOffer(offerId),
    (r) => (r ? `${r.product.name} · ${r.dealer.name} · ${money(r.offer.priceCents)}` : "offer not found"),
  );
  if (!row) return { kind: "message", summary: "That offer is no longer available." };

  await tool(
    emit, "check_inventory", { offer_id: offerId, qty: 1 },
    () => row.offer.stock,
    (stock) => (stock > 0 ? `${stock} in stock · reserved 1` : "out of stock"),
  );

  const confirmation = placeOrder(offerId);
  if (!confirmation) return { kind: "message", summary: "That offer is no longer available." };
  const { orderId, totalCents, etaDays } = confirmation;

  const query = `INSERT INTO orders (offer_id, card)\n  VALUES ('${offerId}', '•4242') RETURNING confirmation`;
  emit({ query });

  await tool(
    emit, "charge_card", { card: "•4242", amount: totalCents / 100 },
    () => totalCents,
    () => `authorized ${money(totalCents)} — no re-entry`,
  );
  await tool(
    emit, "create_order", { offer_id: offerId, qty: 1 },
    () => orderId,
    (id) => `order ${id} written`,
  );
  await tool(
    emit, "send_confirmation", { order_id: orderId },
    () => orderId,
    () => "confirmation emailed",
  );

  await log(emit, `ORDER ${orderId} CONFIRMED`, "authorized");
  // "generating confirmation" beat before the receipt appears.
  await wait(rand(T.finalize[0], T.finalize[1]));

  return {
    kind: "buy", query, confirmation,
    summary:
      `Done — I ordered the ${row.product.name} from ${row.dealer.name} for ${money(totalCents)}, ` +
      `charged to your card •4242 with no re-entry. It arrives in ${etaDays} day${etaDays > 1 ? "s" : ""}. ` +
      `Confirmation ${orderId} is on its way to you.`,
  };
}

function filterByDealer(rows: Row[], text: string): Row[] {
  return rows.filter((r) => {
    const name = r.dealer.name.toLowerCase();
    const first = name.split(/[^a-z0-9]+/)[0];
    return text.includes(name) || (first.length > 3 && text.includes(first));
  });
}

// ── narration helpers ───────────────────────────────────────────────────────
async function log(emit: Emit, text: string, tone: StepTone = "info") {
  await wait(rand(T.log[0], T.log[1]));
  emit({ step: { kind: "log", text, tone } });
}

async function think(emit: Emit, text: string) {
  await wait(rand(T.think[0], T.think[1]));
  emit({ step: { kind: "think", text } });
}

/**
 * Emit a tool call as "running", wait a variable round-trip, then resolve it
 * with a result computed from the local dummy database.
 */
async function tool<R>(
  emit: Emit,
  name: string,
  args: Record<string, unknown> | undefined,
  compute: () => R,
  format: (r: R) => string,
): Promise<R> {
  emit({ step: { kind: "tool", name, args, running: true } });
  const ms = Math.round(rand(T.tool[0], T.tool[1]));
  await wait(ms);
  const result = compute();
  emit({ resolve: { result: format(result), ms } });
  return result;
}
