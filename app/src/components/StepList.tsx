import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import type { Step, StepTone } from "../lib/agent";

const toneColor: Record<StepTone, string> = {
  info: "var(--ink-500)",
  pending: "var(--color-pending)",
  authorized: "var(--color-authorized)",
  denied: "var(--color-denied)",
};

/** Renders the agent's streamed steps: reasoning, tool calls, and system logs. */
export function StepList({ steps }: { steps: Step[] }) {
  return (
    <div className="space-y-1.5">
      {steps.map((s, i) => (
        <StepItem key={i} step={s} />
      ))}
    </div>
  );
}

function StepItem({ step }: { step: Step }) {
  if (step.kind === "think") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.18 }}
        className="flex items-start gap-2 py-0.5"
      >
        <span className="t-label text-text-label mt-[2px] shrink-0">THINKING</span>
        <span className="t-data italic text-text-muted leading-snug">
          {step.text}
          <ThinkingDots />
        </span>
      </motion.div>
    );
  }

  if (step.kind === "tool") {
    const done = !step.running;
    return (
      <motion.div
        initial={{ opacity: 0, y: 2 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="border border-[color:var(--color-border)] bg-surface px-2.5 py-1.5"
      >
        <div className="flex items-center gap-2">
          {done ? (
            <span className="grid place-items-center w-3.5 h-3.5 rounded-full shrink-0" style={{ background: "var(--color-authorized)" }}>
              <Check size={9} color="var(--paper-0)" strokeWidth={3.5} />
            </span>
          ) : (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="grid place-items-center w-3.5 h-3.5 shrink-0"
            >
              <Loader2 size={12} color="var(--color-pending)" strokeWidth={2.5} />
            </motion.span>
          )}
          <span className="t-data font-semibold">{step.name}</span>
          {step.args && Object.keys(step.args).length > 0 && (
            <span className="t-data text-text-label truncate">{formatArgs(step.args)}</span>
          )}
          {done && step.ms != null && (
            <span className="t-label text-text-label ml-auto shrink-0">{step.ms}ms</span>
          )}
        </div>
        {done && step.result && (
          <div className="t-data text-text-muted mt-0.5 pl-[22px]">→ {step.result}</div>
        )}
      </motion.div>
    );
  }

  // log (system event)
  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18 }}
      className="flex items-center gap-2 py-0.5"
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: toneColor[step.tone] }} />
      <span className="t-label" style={{ color: toneColor[step.tone], letterSpacing: "0.08em" }}>{step.text}</span>
    </motion.div>
  );
}

function ThinkingDots() {
  return (
    <span className="inline-flex ml-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
        >
          .
        </motion.span>
      ))}
    </span>
  );
}

function formatArgs(args: Record<string, unknown>): string {
  const parts = Object.entries(args)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${typeof v === "string" ? `"${v}"` : String(v)}`);
  return parts.length ? `{ ${parts.join(", ")} }` : "";
}
