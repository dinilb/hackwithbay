import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { Step } from "../lib/agent";
import { StepList } from "./StepList";

/**
 * Full-screen "placing order" beat shown while the checkout tools run, so the
 * confirmation takes a visible moment to arrive — and stays visible even when
 * the chat column is collapsed. It mirrors the same tool calls streaming in
 * the chat feed.
 */
export function ProcessingOverlay({ steps }: { steps: Step[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [steps]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[color:var(--ink-900)]/30 grid place-items-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
        className="crop bg-surface border-[1.5px] border-[color:var(--color-pending)] w-full max-w-[440px]"
      >
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[color:var(--color-border)]">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            className="grid place-items-center"
          >
            <Loader2 size={15} color="var(--color-pending)" strokeWidth={2.5} />
          </motion.span>
          <span className="t-label" style={{ color: "var(--color-pending)" }}>PLACING ORDER</span>
          <span className="t-label text-text-label ml-auto">card •4242</span>
        </div>

        <div className="p-4">
          <div ref={scrollRef} className="max-h-[52vh] overflow-y-auto">
            <StepList steps={steps} />
          </div>
          <div className="mt-3 pt-3 border-t border-[color:var(--color-border)] t-label text-text-label">
            Charging your card on file — no signup, no re-entry. Don&rsquo;t close this window…
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
