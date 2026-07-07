import { motion } from "framer-motion";
import { money } from "../lib/search";
import type { Product } from "../data/mercato";
import { ProductImg, Stars, AvailBadge } from "./bits";

export type ProductGroup = {
  product: Product;
  offerCount: number;
  minPriceCents: number;
  bestRating: number;
  totalReviews: number;
  maxStock: number;
};

export function ProductCard({ group, index, onSelect }: { group: ProductGroup; index: number; onSelect: (productId: string) => void }) {
  const { product, offerCount, minPriceCents, bestRating, totalReviews, maxStock } = group;
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: Math.min(index, 24) * 0.025, ease: [0.2, 0, 0, 1] }}
      onClick={() => onSelect(product.id)}
      className="crop border border-[color:var(--color-border)] bg-surface flex flex-col text-left hover:border-[color:var(--color-border-strong)] transition-colors"
    >
      <ProductImg src={product.image} emoji={product.emoji} alt={product.name} className="w-full aspect-[4/3]" />
      <div className="p-3 flex flex-col flex-1">
        <div className="t-label text-text-label">{product.category}</div>
        <div className="t-h3 mt-0.5 leading-tight">{product.name}</div>
        <div className="t-label text-text-label mt-1">{product.brand}</div>
        <div className="mt-2 flex items-center justify-between">
          <Stars rating={bestRating} reviews={totalReviews} />
          <AvailBadge stock={maxStock} />
        </div>
        <div className="mt-auto pt-3 flex items-baseline justify-between">
          <div>
            <span className="t-label text-text-label">FROM</span>{" "}
            <span className="t-data text-lg font-semibold">{money(minPriceCents)}</span>
          </div>
          <span className="t-label text-text-label">{offerCount} DEALER{offerCount > 1 ? "S" : ""}</span>
        </div>
      </div>
    </motion.button>
  );
}
