import { motion } from "framer-motion";
import { clsx } from "clsx";
import { money, compact } from "../lib/search";
import type { Row } from "../data/mercato";
import { ProductImg, Stars, ReliabilityBar, AvailBadge } from "./bits";

// Each row is its own surface card; the grid shows through the gaps between rows.
const CELL = "bg-surface border-y border-[color:var(--color-border)] group-hover:bg-[color:var(--paper-100)] transition-colors";

export function OfferRow({ row, index, onSelect }: { row: Row; index: number; onSelect: (productId: string) => void }) {
  const { offer, product, dealer } = row;
  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: Math.min(index, 24) * 0.02, ease: [0.2, 0, 0, 1] }}
      onClick={() => onSelect(product.id)}
      className="group cursor-pointer"
    >
      <td className={clsx(CELL, "border-l py-2 pl-3 pr-2")}>
        <ProductImg src={product.image} emoji={product.emoji} alt={product.name} className="w-10 h-10 rounded-sm" />
      </td>
      <td className={clsx(CELL, "py-2 pr-3")}>
        <div className="t-h3 leading-tight truncate max-w-[200px]">{product.name}</div>
        <div className="t-label text-text-label mt-0.5">{product.brand} · {product.category}</div>
      </td>
      <td className={clsx(CELL, "py-2 pr-3")}>
        <div className="t-data whitespace-nowrap"><span className="mr-1">{dealer.badge}</span>{dealer.name}</div>
        <div className="t-label text-text-label mt-0.5">{dealer.location}</div>
      </td>
      <td className={clsx(CELL, "py-2 pr-3 text-right")}>
        <span className="t-data text-[15px] font-semibold">{money(offer.priceCents)}</span>
      </td>
      <td className={clsx(CELL, "py-2 pr-3")}><AvailBadge stock={offer.stock} /></td>
      <td className={clsx(CELL, "py-2 pr-3")}><ReliabilityBar value={offer.reliability} /></td>
      <td className={clsx(CELL, "py-2 pr-3")}><Stars rating={offer.rating} reviews={offer.reviews} /></td>
      <td className={clsx(CELL, "py-2 pr-3 text-right t-data text-text-muted")}>{compact(offer.unitsSold)}</td>
      <td className={clsx(CELL, "border-r py-2 pr-4 text-right t-data whitespace-nowrap")}>{offer.fulfillmentDays}d</td>
    </motion.tr>
  );
}
