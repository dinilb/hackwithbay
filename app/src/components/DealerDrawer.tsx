import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { dealersForProduct, money, compact } from "../lib/search";
import { CATEGORY_LABEL } from "../data/mercato";
import { Btn } from "./ui";
import { ProductImg, Stars, ReliabilityBar, AvailBadge } from "./bits";

export function DealerDrawer({
  productId, busy, onClose, onBuy,
}: { productId: string; busy: boolean; onClose: () => void; onBuy: (offerId: string) => void }) {
  const rows = dealersForProduct(productId);
  if (!rows.length) return null;
  const product = rows[0].product;

  const cheapest = rows[0].offer.id;
  const mostReliable = [...rows].sort((a, b) => b.offer.reliability - a.offer.reliability)[0].offer.id;
  const fastest = [...rows].sort((a, b) => a.offer.fulfillmentDays - b.offer.fulfillmentDays)[0].offer.id;

  const tag = (id: string): { text: string; tone: string } | null => {
    if (id === cheapest) return { text: "CHEAPEST", tone: "var(--color-authorized)" };
    if (id === mostReliable) return { text: "MOST RELIABLE", tone: "var(--ink-700)" };
    if (id === fastest) return { text: "FASTEST", tone: "var(--color-pending)" };
    return null;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-[color:var(--ink-900)]/20"
      />
      <motion.aside
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.28, ease: [0.2, 0, 0, 1] }}
        className="fixed right-0 top-0 z-50 h-full w-full max-w-[560px] bg-surface border-l border-[color:var(--color-border-strong)] flex flex-col"
      >
        <header className="flex items-center justify-between px-5 py-3 border-b border-[color:var(--color-border)]">
          <div className="t-label text-text-label">COMPARE DEALERS · {rows.length} OFFERS</div>
          <button onClick={onClose} className="p-1 hover:bg-[color:var(--paper-100)] rounded-sm" aria-label="Close">
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {/* product hero */}
          <div className="flex gap-4 p-5 border-b border-[color:var(--color-border)]">
            <ProductImg src={product.image} emoji={product.emoji} alt={product.name} className="w-28 h-28 rounded-md shrink-0" />
            <div className="min-w-0">
              <div className="t-label text-text-label">{CATEGORY_LABEL[product.category]} · {product.brand}</div>
              <h2 className="t-h1 mt-1 leading-tight" style={{ fontSize: "1.6rem" }}>{product.name}</h2>
              <p className="t-data text-text-muted mt-2">{product.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {Object.entries(product.specs).map(([k, v]) => (
                  <span key={k} className="t-label rounded-sm border border-[color:var(--color-border)] px-2 py-1">
                    {k}: <span className="text-text">{v}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* dealer offers */}
          <div className="p-5 space-y-3">
            {rows.map((r) => {
              const t = tag(r.offer.id);
              const out = r.offer.stock <= 0;
              return (
                <div key={r.offer.id} className="crop border border-[color:var(--color-border)] bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="t-h3">{r.dealer.badge} {r.dealer.name}</span>
                        {t && (
                          <span className="t-label px-1.5 py-0.5 rounded-sm border" style={{ color: t.tone, borderColor: t.tone }}>
                            {t.text}
                          </span>
                        )}
                      </div>
                      <div className="t-label text-text-label mt-1">
                        {r.dealer.location} · {compact(r.dealer.totalSales)} LIFETIME SALES
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="t-data text-xl font-semibold">{money(r.offer.priceCents)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                    <Field label="AVAILABILITY"><AvailBadge stock={r.offer.stock} /></Field>
                    <Field label="RELIABILITY"><ReliabilityBar value={r.offer.reliability} /></Field>
                    <Field label="REVIEWS"><Stars rating={r.offer.rating} reviews={r.offer.reviews} /></Field>
                    <Field label="FULFILLMENT"><span className="t-data">{r.offer.fulfillmentDays} day{r.offer.fulfillmentDays > 1 ? "s" : ""}</span></Field>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="t-label text-text-label">{compact(r.offer.unitsSold)} SOLD HERE</span>
                    <Btn variant={out ? "secondary" : "primary"} size="sm" disabled={out || busy} onClick={() => onBuy(r.offer.id)}>
                      {out ? "OUT OF STOCK" : `BUY · ${money(r.offer.priceCents)}`}
                    </Btn>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="t-label text-text-label mb-1">{label}</div>
      {children}
    </div>
  );
}
