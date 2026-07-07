import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import type { Step } from "../lib/agent";
import { Chip } from "./ui";

export type ChatMsg =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "agent"; text: string }
  | { id: number; role: "steps"; steps: Step[] };

const PRESETS = [
  "List the whole catalog",
  "Find a GPU under $600",
  "Cheapest noise-cancelling headphones",
  "Best-rated coffee beans",
  "Buy the cheapest RTX 5070",
];

const toneColor: Record<Step["tone"], string> = {
  info: "var(--ink-500)",
  pending: "var(--color-pending)",
  authorized: "var(--color-authorized)",
  denied: "var(--color-denied)",
};

export function ChatPanel({
  messages, running, onSubmit,
}: { messages: ChatMsg[]; running: boolean; onSubmit: (text: string) => void }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, running]);

  function submit(text: string) {
    const t = text.trim();
    if (!t || running) return;
    onSubmit(t);
    setInput("");
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="t-data text-text-muted">
            Ask me to <span className="text-text">list</span>, <span className="text-text">search</span>, or{" "}
            <span className="text-text">buy</span> anything. I query the Mercato database live and order with your card on file.
          </div>
        )}

        {messages.map((m) => {
          if (m.role === "user") {
            return (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[85%] bg-[color:var(--ink-900)] text-[color:var(--paper-0)] px-3 py-2 rounded-md t-data">
                  {m.text}
                </div>
              </div>
            );
          }
          if (m.role === "agent") {
            return (
              <div key={m.id} className="crop border border-[color:var(--color-border)] bg-surface px-3 py-2 max-w-[92%]">
                <div className="t-label text-text-label mb-1">AGENT</div>
                <div className="text-[13.5px] leading-relaxed">{m.text}</div>
              </div>
            );
          }
          // steps (system log)
          return (
            <div key={m.id} className="bg-[color:var(--color-surface-sunken)] border border-[color:var(--color-border)] px-3 py-2">
              {m.steps.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-2 py-0.5"
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: toneColor[s.tone] }} />
                  <span className="t-label" style={{ color: toneColor[s.tone], letterSpacing: "0.08em" }}>{s.text}</span>
                </motion.div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="border-t border-[color:var(--color-border)] p-3 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <Chip key={p} onClick={() => submit(p)}>{p}</Chip>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); submit(input); }}
          className="flex items-center gap-2 border border-[color:var(--color-border-strong)] bg-surface px-3 h-11"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={running}
            placeholder={running ? "Agent is working…" : "Find me anything…"}
            className="flex-1 bg-transparent outline-none t-data placeholder:text-text-label disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={running || !input.trim()}
            className="grid place-items-center w-7 h-7 rounded-full bg-[color:var(--ink-900)] text-[color:var(--paper-0)] disabled:opacity-30"
            aria-label="Send"
          >
            <ArrowUp size={15} strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
