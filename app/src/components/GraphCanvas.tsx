import { motion, AnimatePresence } from "framer-motion";
import type { GraphEdge } from "../lib/types";
import { NODES, NODE_R, VIEW, type NodeMeta } from "../lib/layout";

export type DynNode = { id: string; x: number; y: number; kind: "Card" | "Order"; label: string; sub: string; spent?: boolean };
export type Denied = { from: string; to: string; label: string } | null;

type Props = {
  edges: GraphEdge[];
  highlight: string[][];
  rings: Set<string>;
  denied: Denied;
  dynamics: DynNode[];
  provenance: boolean;
};

const key = (a: string, b: string) => [a, b].sort().join("|");

export default function GraphCanvas({ edges, highlight, rings, denied, dynamics, provenance }: Props) {
  const hlSet = new Set(highlight.map(([a, b]) => key(a, b)));
  const dim = provenance || highlight.length > 0 || !!denied;

  return (
    <div className="crop relative w-full h-full bg-[color:var(--color-bg)] overflow-hidden">
      <div className="absolute top-3 left-3 t-label text-text-label z-10 pointer-events-none">GRAPH · TRUST LAYER</div>
      <div className="absolute top-3 right-3 t-label text-text-label z-10 pointer-events-none">NEO4J · LIVE TRAVERSAL</div>

      <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* base hairline edges */}
        {edges.map((e, i) => {
          const a = NODES[e.from], b = NODES[e.to];
          if (!a || !b) return null;
          const active = hlSet.has(key(e.from, e.to));
          const faded = dim && !active;
          return (
            <line key={`e${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke="var(--ink-300)" strokeWidth={1}
              style={{ opacity: faded ? 0.12 : active ? 0 : 0.55, transition: "opacity .3s" }} />
          );
        })}

        {/* denied edge (missing allow) — red dashed flash */}
        {denied && NODES[denied.from] && NODES[denied.to] && (
          <g>
            <motion.line
              x1={NODES[denied.from].x} y1={NODES[denied.from].y}
              x2={NODES[denied.to].x} y2={NODES[denied.to].y}
              stroke="var(--color-denied)" strokeWidth={2} strokeDasharray="6 6"
              initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.2, 1, 0.85] }}
              transition={{ duration: 0.6, times: [0, 0.2, 0.4, 0.6, 1] }} />
            <text
              x={(NODES[denied.from].x + NODES[denied.to].x) / 2}
              y={(NODES[denied.from].y + NODES[denied.to].y) / 2 - 10}
              textAnchor="middle" className="t-label" fill="var(--color-denied)"
              style={{ fontSize: 11 }}>{denied.label}</text>
          </g>
        )}

        {/* highlighted (authorized) edges — animated draw */}
        {highlight.map(([from, to], i) => {
          const a = NODES[from], b = NODES[to];
          if (!a || !b) return null;
          return (
            <motion.line key={`h${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke="var(--color-authorized-bright)" strokeWidth={2.5} strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.45, delay: i * 0.35, ease: [0.2, 0, 0, 1] }} />
          );
        })}

        {/* dynamic card / order nodes */}
        <AnimatePresence>
          {dynamics.map((d) => (
            <motion.g key={d.id}
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.2, 0, 0, 1] }} style={{ transformOrigin: `${d.x}px ${d.y}px` }}>
              <rect x={d.x - 16} y={d.y - 12} width={32} height={24} rx={3}
                fill="var(--color-surface)"
                stroke={d.spent ? "var(--ink-400)" : "var(--color-authorized)"} strokeWidth={1.5} />
              <text x={d.x} y={d.y + 3} textAnchor="middle" className="t-data"
                fill={d.spent ? "var(--ink-400)" : "var(--color-authorized)"} style={{ fontSize: 9 }}>{d.label}</text>
              <text x={d.x} y={d.y + 22} textAnchor="middle" className="t-label"
                fill="var(--ink-400)" style={{ fontSize: 8 }}>{d.sub}</text>
            </motion.g>
          ))}
        </AnimatePresence>

        {/* nodes */}
        {Object.entries(NODES).map(([id, n]) => (
          <Node key={id} n={n}
            ring={rings.has(id)}
            denied={!!denied && (denied.to === id || denied.from === id)}
            faded={dim && !rings.has(id) && !(denied && (denied.to === id || denied.from === id))} />
        ))}
      </svg>
    </div>
  );
}

function Node({ n, ring, denied, faded }: { n: NodeMeta; ring: boolean; denied: boolean; faded: boolean }) {
  const r = NODE_R[n.type];
  const unmandated = n.type === "Category" && n.allowed === false;
  const fill = n.type === "Merchant" ? "var(--color-surface)" : "var(--ink-900)";
  const stroke = denied ? "var(--color-denied)" : ring ? "var(--color-authorized)" : "var(--ink-900)";
  return (
    <g style={{ opacity: faded ? 0.28 : 1, transition: "opacity .3s" }}>
      {ring && (
        <motion.circle cx={n.x} cy={n.y} r={r + 6} fill="none" stroke="var(--color-authorized)" strokeWidth={1.5}
          initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 0.9, scale: 1 }} transition={{ duration: 0.3 }}
          style={{ transformOrigin: `${n.x}px ${n.y}px` }} />
      )}
      {denied && (
        <motion.circle cx={n.x} cy={n.y} r={r + 6} fill="none" stroke="var(--color-denied)" strokeWidth={1.5}
          strokeDasharray="4 4" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.3, 1] }} transition={{ duration: 0.6 }} />
      )}
      <circle cx={n.x} cy={n.y} r={r}
        fill={n.type === "Merchant" ? fill : denied ? "var(--color-denied)" : "var(--ink-900)"}
        stroke={n.type === "Merchant" ? stroke : "none"}
        strokeWidth={n.type === "Merchant" ? 1.5 : 0}
        strokeDasharray={unmandated ? "3 3" : undefined} />
      {n.type === "Merchant" && <text x={n.x} y={n.y + 4} textAnchor="middle" style={{ fontSize: 11 }}>🏪</text>}
      <text x={n.x} y={n.y + r + 15} textAnchor="middle" className="t-h3"
        style={{ fontSize: n.type === "User" || n.type === "Agent" ? 13 : 12, fontFamily: "var(--font-sans)", fontWeight: 550 }}
        fill="var(--color-text)">{n.label}</text>
      <text x={n.x} y={n.y + r + 28} textAnchor="middle" className="t-label" fill="var(--color-text-label)"
        style={{ fontSize: 9 }}>{n.tag}</text>
    </g>
  );
}
