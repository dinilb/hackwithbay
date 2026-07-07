import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgentEvent } from "../lib/types";

const stepColor = (level: string) =>
  level === "authorized" ? "var(--color-authorized)"
  : level === "pending" ? "var(--color-pending)"
  : level === "denied" ? "var(--color-denied)"
  : "var(--ink-500)";

const hhmmss = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "--:--:--" : d.toTimeString().slice(0, 8);
};

export default function AgentFeed({ events }: { events: AgentEvent[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" }); }, [events.length]);

  return (
    <div ref={ref} className="h-full overflow-y-auto bg-[color:var(--color-surface-sunken)] px-3 py-2">
      {events.length === 0 && (
        <div className="h-full flex items-center justify-center t-label text-text-label">AGENT IDLE · ISSUE A TASK</div>
      )}
      <div className="flex flex-col">
        <AnimatePresence initial={false}>
          {events.map((e) => (
            <motion.div key={e.id}
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18 }}
              className="grid grid-cols-[64px_84px_1fr] gap-2 py-1.5 border-b border-[color:var(--color-border)] last:border-0 items-start">
              <span className="t-data text-text-label">{hhmmss(e.created_at)}</span>
              <span className="t-label" style={{ color: stepColor(e.level) }}>{e.step}</span>
              <span className="t-data text-text leading-snug">{e.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
