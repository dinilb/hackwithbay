import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, money } from "../lib/api";
import type { Merchant } from "../lib/types";

export default function Store() {
  const { slug } = useParams();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const cat = await api.catalog();
        setMerchant(cat.merchants.find((m) => m.slug === slug) || null);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [slug]);

  return (
    <div className="min-h-screen blueprint">
      <header className="flex items-center justify-between px-6 py-3 border-b border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)]">
        <Link to="/" className="t-label text-text-muted hover:text-text">← BAZAAR</Link>
        <span className="t-label text-text-label">STOREFRONT · SPEAKS MCP</span>
      </header>

      {loading && <div className="p-12 t-label text-text-label">LOADING…</div>}
      {!loading && !merchant && <div className="p-12 t-label text-text-label">STORE NOT FOUND</div>}

      {merchant && (
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          <div className="crop border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-8 mb-8">
            <div className="t-label text-text-label">{merchant.category.toUpperCase()} · GARDEN · TRUSTED</div>
            <h1 className="t-hero mt-2" style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)" }}>{merchant.name}</h1>
            <p className="t-data text-text-muted mt-2">{merchant.blurb}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="t-label rounded-sm border px-2.5 py-1.5">GET ?rest=1 · JSON</span>
              <span className="t-label rounded-sm border px-2.5 py-1.5">tools/list · tools/call</span>
              <span className="t-label rounded-sm border px-2.5 py-1.5">create_order · single-use card</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {merchant.products.map((p) => (
              <div key={p.sku} className="crop border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 flex flex-col">
                <div className="text-5xl leading-none py-6 text-center">{p.emoji}</div>
                <div className="t-label text-text-label">{p.category}</div>
                <div className="t-h3 mt-0.5">{p.name}</div>
                <div className="mt-auto pt-3 flex items-baseline justify-between">
                  <span className="t-data text-lg font-semibold">{money(p.price_cents)}</span>
                  <span className="t-label text-text-label">{p.stock} IN STOCK</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
