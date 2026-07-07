import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { money } from "../lib/search";
import type { Confirmation } from "../lib/search";
import { Btn } from "./ui";
import { ProductImg } from "./bits";

export function ConfirmationCard({ confirmation, onClose }: { confirmation: Confirmation; onClose: () => void }) {
  const { row, orderId, totalCents, card, etaDays } = confirmation;
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-[color:var(--ink-900)]/30 grid place-items-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="crop bg-surface border-[1.5px] border-[color:var(--color-authorized)] w-full max-w-[420px]"
        >
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[color:var(--color-border)]">
            <span className="grid place-items-center w-5 h-5 rounded-full" style={{ background: "var(--color-authorized)" }}>
              <Check size={13} color="var(--paper-0)" strokeWidth={3} />
            </span>
            <span className="t-label" style={{ color: "var(--color-authorized)" }}>ORDER CONFIRMED</span>
            <span className="t-label text-text-label ml-auto">{orderId}</span>
          </div>

          <div className="p-5">
            <div className="flex gap-4">
              <ProductImg src={row.product.image} emoji={row.product.emoji} alt={row.product.name} className="w-16 h-16 rounded-md shrink-0" />
              <div className="min-w-0">
                <div className="t-h3 leading-tight">{row.product.name}</div>
                <div className="t-label text-text-label mt-1">{row.dealer.badge} {row.dealer.name} · {row.dealer.location}</div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <Line label="Total charged" value={money(totalCents)} strong />
              <Line label="Paid with" value={`${card.brand} •${card.last4}`} />
              <Line label="Arrives in" value={`${etaDays} day${etaDays > 1 ? "s" : ""}`} />
              <Line label="Confirmation" value="sent to you ✓" />
            </div>

            <div className="mt-5 p-3 bg-[color:var(--green-100)] border border-[color:var(--color-authorized)]">
              <span className="t-data" style={{ color: "var(--color-authorized)" }}>
                Charged with your card on file — no signup, no re-entry.
              </span>
            </div>

            <div className="mt-5 flex justify-end">
              <Btn variant="approve" onClick={onClose}>DONE</Btn>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between border-b border-[color:var(--color-border)] pb-1.5">
      <span className="t-label text-text-label">{label}</span>
      <span className={strong ? "t-data text-lg font-semibold" : "t-data"}>{value}</span>
    </div>
  );
}
