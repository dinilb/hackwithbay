import { motion } from "framer-motion";
import type { Approval } from "../lib/types";
import { money } from "../lib/api";
import { Btn } from "./ui";

export default function ApprovalCard({
  approval, onDecide, busy,
}: {
  approval: Approval; onDecide: (d: "approve" | "deny") => void; busy: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="border-[1.5px] p-4 m-4"
      style={{ borderColor: "var(--color-pending)" }}
    >
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-pending)" }} />
        <span className="t-label" style={{ color: "var(--color-pending)" }}>AWAITING SIGNATURE</span>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <div className="t-h3">{approval.item}</div>
        <div className="t-data text-lg font-semibold">{money(approval.amount_cents)}</div>
      </div>
      <div className="t-label text-text-label mt-1">{approval.merchant_slug}</div>

      <div className="mt-3 t-data text-text-muted border-t border-[color:var(--color-border)] pt-3">
        &gt; requires human signature · exceeds <span className="text-text">$25.00</span> per-txn limit
      </div>

      <div className="mt-4 flex gap-2">
        <Btn variant="approve" size="sm" onClick={() => onDecide("approve")} disabled={busy} className="flex-1">✓ APPROVE</Btn>
        <Btn variant="deny" size="sm" onClick={() => onDecide("deny")} disabled={busy} className="flex-1">✕ DENY</Btn>
      </div>
    </motion.div>
  );
}
