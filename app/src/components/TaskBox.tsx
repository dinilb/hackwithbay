import { PRESETS, type Preset } from "../lib/layout";

export default function TaskBox({ onRun, busy, current }: {
  onRun: (p: Preset) => void; busy: boolean; current: string | null;
}) {
  const tone = (e: Preset["expect"]) => (e === "auto" ? "ink" : e === "approval" ? "amber" : "red");
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 border border-[color:var(--color-border)] rounded-sm px-3 py-2.5 bg-[color:var(--color-surface)]">
        <span className="t-data text-text-label">$</span>
        <span className="t-data text-text truncate">{current || "Tell your agent what to buy…"}</span>
        <span className="ml-auto t-label text-text-label animate-pulse">{busy ? "RUNNING" : "READY"}</span>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {PRESETS.map((p) => {
          const t = tone(p.expect);
          const c = t === "amber" ? "var(--color-pending)" : t === "red" ? "var(--color-denied)" : "var(--ink-900)";
          return (
            <button key={p.sku} onClick={() => onRun(p)} disabled={busy}
              className="group flex items-center justify-between gap-2 border border-[color:var(--color-border)] rounded-sm px-3 py-2.5 text-left hover:bg-[color:var(--paper-100)] disabled:opacity-40 transition-colors">
              <span className="t-data text-text">{p.label}</span>
              <span className="t-label flex items-center gap-1.5" style={{ color: c }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                {p.expect === "auto" ? "AUTO" : p.expect === "approval" ? "SIGN-OFF" : "DENY"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
