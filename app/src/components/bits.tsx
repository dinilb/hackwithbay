import { useState } from "react";
import { clsx } from "clsx";
import { availability, compact } from "../lib/search";

/** Product image with graceful emoji fallback on load error. */
export function ProductImg({
  src, emoji, alt, className,
}: { src: string; emoji: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={clsx("flex items-center justify-center bg-[color:var(--paper-100)] select-none", className)}>
        <span className="leading-none" style={{ fontSize: "1.6em" }}>{emoji}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={clsx("object-cover bg-[color:var(--paper-100)]", className)}
    />
  );
}

/** ★ rating with review count, e.g. ★ 4.8 (2.1k) */
export function Stars({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <span className="t-data whitespace-nowrap">
      <span style={{ color: "var(--amber-500)" }}>★</span> {rating.toFixed(1)}
      {reviews != null && <span className="text-text-label"> ({compact(reviews)})</span>}
    </span>
  );
}

/** Thin reliability meter 0–100. */
export function ReliabilityBar({ value }: { value: number }) {
  const tone = value >= 95 ? "var(--color-authorized)" : value >= 88 ? "var(--amber-600)" : "var(--ink-400)";
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="relative inline-block h-1.5 w-10 bg-[color:var(--paper-200)] rounded-full overflow-hidden">
        <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${value}%`, background: tone }} />
      </span>
      <span className="t-data" style={{ color: tone }}>{value}%</span>
    </span>
  );
}

/** Availability dot + label. */
export function AvailBadge({ stock }: { stock: number }) {
  const a = availability(stock);
  const color = a.tone === "green" ? "var(--color-authorized)" : a.tone === "amber" ? "var(--color-pending)" : "var(--color-denied)";
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
      <span className="t-label" style={{ color }}>{a.label}</span>
    </span>
  );
}
