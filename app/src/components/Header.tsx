import { CreditCard } from "lucide-react";
import { money } from "../lib/search";
import { paymentMethod } from "../data/mercato";
import { Btn } from "./ui";

export default function Header({ spentCents, onReset }: { spentCents: number; onReset?: () => void }) {
  return (
    <header className="flex items-center justify-between gap-4 px-5 py-3 border-b border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] shrink-0">
      <div className="flex items-baseline gap-3 min-w-0">
        <span className="t-display" style={{ fontSize: "1.6rem" }}>Mercato</span>
        <span className="t-label text-text-label hidden md:block">COMMERCE FOR AGENTS · ONE DATABASE, PAY ONCE</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-2 border border-[color:var(--color-border)] px-2.5 h-8 rounded-full">
          <CreditCard size={13} className="text-text-muted" />
          <span className="t-label">{paymentMethod.brand} •{paymentMethod.last4}</span>
          <span className="t-label text-text-label">· {money(spentCents)} SPENT</span>
        </span>
        {onReset && <Btn variant="ghost" size="sm" onClick={onReset}>RESET</Btn>}
      </div>
    </header>
  );
}
