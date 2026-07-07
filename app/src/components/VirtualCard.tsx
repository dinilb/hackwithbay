import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Card } from "../lib/types";
import { money } from "../lib/api";

export default function VirtualCard({ card }: { card: Card | null }) {
  const [spent, setSpent] = useState(false);

  useEffect(() => {
    if (!card) return;
    setSpent(false);
    const t = setTimeout(() => setSpent(true), 1400); // ACTIVE → SPENT beat
    return () => clearTimeout(t);
  }, [card?.id]);

  if (!card) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="t-label text-text-label">NO CARD MINTED YET</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={card.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.32, ease: [0.2, 0, 0, 1] }}
          className="relative border-[1.5px] rounded-md p-4 overflow-hidden"
          style={{
            borderColor: spent ? "var(--ink-400)" : "var(--color-authorized)",
            background: "var(--color-surface)",
            filter: spent ? "grayscale(1)" : "none",
            transition: "filter .4s, border-color .4s",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="t-label" style={{ color: spent ? "var(--ink-400)" : "var(--color-authorized)" }}>
              MANDATE · TEST
            </div>
            <StatusChip spent={spent} />
          </div>

          <div className="mt-6 t-data" style={{ fontSize: 18, letterSpacing: "0.08em" }}>
            <span className="text-text-muted">•••• •••• ••••</span>{" "}
            <span className="font-semibold">{card.pan_last4}</span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <Field label="CAP" value={money(card.cap_cents)} />
            <Field label="LOCK" value={card.merchant_lock} />
            <Field label="EXP" value="+30:00" />
          </div>

          {spent && (
            <motion.div
              initial={{ scale: 1.08, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="t-label border-[1.5px] px-3 py-1"
                style={{ color: "var(--ink-900)", borderColor: "var(--ink-900)", transform: "rotate(-8deg)", fontSize: 14, letterSpacing: "0.2em" }}>
                SPENT
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="mt-2 t-label text-text-label">SINGLE-USE · DIES ON SPEND · NO STORED BALANCE</div>
    </div>
  );
}

function StatusChip({ spent }: { spent: boolean }) {
  return (
    <div className="t-label flex items-center gap-1.5 rounded-full border px-2 py-1"
      style={{
        color: spent ? "var(--ink-400)" : "var(--color-authorized)",
        borderColor: spent ? "var(--ink-300)" : "var(--color-authorized)",
      }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: spent ? "var(--ink-400)" : "var(--color-authorized)" }} />
      {spent ? "SPENT" : "ACTIVE"}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="t-label text-text-label">{label}</div>
      <div className="t-data mt-0.5 truncate">{value}</div>
    </div>
  );
}
