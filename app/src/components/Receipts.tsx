import type { Order, Card } from "../lib/types";
import { money } from "../lib/api";

export default function Receipts({
  orders, cards, selected, onSelect,
}: {
  orders: Order[]; cards: Card[]; selected: string | null; onSelect: (order: Order) => void;
}) {
  if (orders.length === 0) {
    return <div className="p-4 t-label text-text-label">NO ORDERS YET</div>;
  }
  const cardFor = (id: string) => cards.find((c) => c.id === id);
  return (
    <div className="divide-y divide-[color:var(--color-border)] overflow-y-auto max-h-full">
      {orders.map((o) => {
        const c = cardFor(o.card_id);
        const active = selected === o.id;
        return (
          <button key={o.id} onClick={() => onSelect(o)}
            className={"w-full text-left px-4 py-3 transition-colors " + (active ? "bg-[color:var(--paper-100)]" : "hover:bg-[color:var(--paper-100)]")}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="t-data text-text truncate">{o.item}</span>
              <span className="t-data font-semibold">{money(o.total_cents)}</span>
            </div>
            <div className="t-label text-text-label mt-1">
              PAID WITH SINGLE-USE CARD ••{c?.pan_last4 ?? "----"} <span style={{ color: "var(--ink-400)" }}>(NOW DEAD)</span>
            </div>
            <div className="t-label text-text-label mt-0.5">
              {o.merchant_slug} · BAZAAR FEE 2.5% {money(o.fee_cents)} · TEST
            </div>
            {active && <div className="t-label mt-1" style={{ color: "var(--color-authorized)" }}>▸ PROVENANCE PATH HIGHLIGHTED</div>}
          </button>
        );
      })}
    </div>
  );
}
