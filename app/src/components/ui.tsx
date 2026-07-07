import { clsx } from "clsx";
import type { ReactNode } from "react";

export function Panel({
  title, eyebrow, children, className, active, state, right,
}: {
  title?: string; eyebrow?: string; children: ReactNode; className?: string;
  active?: boolean; state?: "authorized" | "denied" | "pending"; right?: ReactNode;
}) {
  const stateBorder =
    state === "authorized" ? "border-[color:var(--color-authorized)]"
    : state === "denied" ? "border-[color:var(--color-denied)]"
    : state === "pending" ? "border-[color:var(--color-pending)]"
    : active ? "border-[color:var(--color-border-strong)]"
    : "border-[color:var(--color-border)]";
  return (
    <section
      className={clsx(
        "crop bg-surface border relative flex flex-col min-h-0",
        state ? "border-[1.5px]" : "border",
        stateBorder, className
      )}
    >
      {(title || eyebrow) && (
        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[color:var(--color-border)]">
          <div className="min-w-0">
            {eyebrow && <div className="t-label text-text-label">{eyebrow}</div>}
            {title && <h3 className="t-h3 truncate">{title}</h3>}
          </div>
          {right}
        </header>
      )}
      <div className="flex-1 min-h-0">{children}</div>
    </section>
  );
}

export function Btn({
  children, onClick, variant = "secondary", size = "md", disabled, className, type,
}: {
  children: ReactNode; onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "approve" | "deny";
  size?: "sm" | "md"; disabled?: boolean; className?: string; type?: "button" | "submit";
}) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full t-label transition-[background,color,opacity] duration-150 disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = size === "sm" ? "h-8 px-4" : "h-10 px-5";
  const variants = {
    primary: "bg-[color:var(--ink-900)] text-[color:var(--paper-0)] hover:opacity-90",
    secondary: "border border-[color:var(--color-border)] hover:bg-[color:var(--paper-100)] text-text",
    ghost: "text-text-muted hover:bg-[color:var(--paper-100)]",
    approve: "bg-[color:var(--color-authorized)] text-[color:var(--paper-0)] hover:opacity-90",
    deny: "border border-[color:var(--color-denied)] text-[color:var(--color-denied)] hover:bg-[color:var(--red-100)]",
  }[variant];
  return (
    <button type={type || "button"} onClick={onClick} disabled={disabled} className={clsx(base, sizes, variants, className)}>
      {children}
    </button>
  );
}

export function Chip({ children, onClick, active, tone = "ink", className }: {
  children: ReactNode; onClick?: () => void; active?: boolean;
  tone?: "ink" | "green" | "red" | "amber"; className?: string;
}) {
  const tones = {
    ink: "border-[color:var(--color-border)] text-text",
    green: "border-[color:var(--color-authorized)] text-[color:var(--color-authorized)]",
    red: "border-[color:var(--color-denied)] text-[color:var(--color-denied)]",
    amber: "border-[color:var(--color-pending)] text-[color:var(--color-pending)]",
  }[tone];
  return (
    <button
      onClick={onClick}
      className={clsx(
        "t-label rounded-sm border px-2.5 py-1.5 transition-colors duration-150",
        active ? "bg-[color:var(--paper-200)]" : "hover:bg-[color:var(--paper-100)]",
        tones, className
      )}
    >
      {children}
    </button>
  );
}

export function Dot({ tone }: { tone: "green" | "red" | "amber" | "ink" }) {
  const c = { green: "var(--color-authorized)", red: "var(--color-denied)", amber: "var(--color-pending)", ink: "var(--ink-400)" }[tone];
  return <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: c }} />;
}
