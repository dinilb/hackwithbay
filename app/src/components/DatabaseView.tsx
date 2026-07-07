import { useMemo } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { DB_STATS, type Row } from "../data/mercato";
import { OfferRow } from "./OfferRow";
import { ProductCard, type ProductGroup } from "./ProductCard";

type Props = {
  query: string | null;
  rows: Row[];
  matched: number | null;
  running: boolean;
  view: "table" | "gallery";
  gen: number;
  onView: (v: "table" | "gallery") => void;
  onSelect: (productId: string) => void;
};

const HEADERS = ["", "PRODUCT", "DEALER", "PRICE", "AVAILABILITY", "RELIABILITY", "REVIEWS", "SALES", "FULFIL"];

export function DatabaseView({ query, rows, matched, running, view, gen, onView, onSelect }: Props) {
  const groups = useMemo(() => (view === "gallery" ? groupByProduct(rows) : []), [rows, view]);
  const commas = (n: number) => n.toLocaleString("en-US");

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* connection + counts + view toggle */}
      <div className="flex items-center gap-4 px-4 h-11 border-b border-[color:var(--color-border)] bg-surface shrink-0">
        <span className="inline-flex items-center gap-2">
          <motion.span
            animate={{ opacity: running ? [1, 0.3, 1] : 1 }}
            transition={{ duration: 1, repeat: running ? Infinity : 0 }}
            className="w-2 h-2 rounded-full"
            style={{ background: "var(--color-authorized)" }}
          />
          <span className="t-label" style={{ color: "var(--color-authorized)" }}>CONNECTED</span>
          <span className="t-label text-text-label">mercato.offers</span>
        </span>
        <span className="t-label text-text-label hidden sm:inline">{commas(DB_STATS.offers)} ROWS · {DB_STATS.products} PRODUCTS · {DB_STATS.dealers} DEALERS</span>
        {matched != null && (
          <span className="t-label" style={{ color: "var(--color-authorized)" }}>· {commas(rows.length)} MATCHED</span>
        )}
        <div className="ml-auto flex border border-[color:var(--color-border)]">
          {(["table", "gallery"] as const).map((v) => (
            <button
              key={v}
              onClick={() => onView(v)}
              className={clsx(
                "t-label px-3 h-7 transition-colors",
                view === v ? "bg-[color:var(--ink-900)] text-[color:var(--paper-0)]" : "text-text-muted hover:bg-[color:var(--paper-100)]"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* query bar */}
      <div className="px-4 py-2.5 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-sunken)] shrink-0">
        <div className="flex items-start gap-2">
          <span className="t-label text-text-label pt-0.5">QUERY</span>
          <pre className="t-data text-text whitespace-pre-wrap flex-1 m-0">
            {query ?? "SELECT * FROM offers JOIN products USING(product_id) ORDER BY units_sold DESC"}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="inline-block w-[7px] h-[13px] align-middle ml-0.5"
              style={{ background: running ? "var(--color-pending)" : "var(--ink-400)" }}
            />
          </pre>
          {running && <span className="t-label shrink-0" style={{ color: "var(--color-pending)" }}>RUNNING…</span>}
        </div>
      </div>

      {/* results */}
      <div className="flex-1 min-h-0 overflow-auto blueprint">
        {rows.length === 0 ? (
          <div className="p-12 t-label text-text-label">0 ROWS RETURNED — try a broader query</div>
        ) : view === "table" ? (
          <table className="w-full border-separate px-3" style={{ borderSpacing: "0 8px" }}>
            <thead className="sticky top-0 z-10">
              <tr>
                {HEADERS.map((h, i) => (
                  <th key={i} className={clsx("t-label text-text-label font-medium py-2 px-3 bg-[color:var(--color-bg)] border-b border-[color:var(--color-border-strong)]", i >= 3 && i !== 4 && i !== 5 && i !== 6 ? "text-right" : "text-left")}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody key={gen}>
              {rows.map((r, i) => (
                <OfferRow key={r.offer.id} row={r} index={i} onSelect={onSelect} />
              ))}
            </tbody>
          </table>
        ) : (
          <div key={gen} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 p-4">
            {groups.map((g, i) => (
              <ProductCard key={g.product.id} group={g} index={i} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function groupByProduct(rows: Row[]): ProductGroup[] {
  const map = new Map<string, { product: Row["product"]; offers: Row[] }>();
  for (const r of rows) {
    let g = map.get(r.product.id);
    if (!g) { g = { product: r.product, offers: [] }; map.set(r.product.id, g); }
    g.offers.push(r);
  }
  return [...map.values()].map((g) => ({
    product: g.product,
    offerCount: g.offers.length,
    minPriceCents: Math.min(...g.offers.map((o) => o.offer.priceCents)),
    bestRating: Math.max(...g.offers.map((o) => o.offer.rating)),
    totalReviews: g.offers.reduce((s, o) => s + o.offer.reviews, 0),
    maxStock: Math.max(...g.offers.map((o) => o.offer.stock)),
  }));
}
