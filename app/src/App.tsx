import { useReducer } from "react";
import { AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import { Panel } from "./components/ui";
import { ChatPanel, type ChatMsg } from "./components/ChatPanel";
import { DatabaseView } from "./components/DatabaseView";
import { DealerDrawer } from "./components/DealerDrawer";
import { ConfirmationCard } from "./components/ConfirmationCard";
import { runAgent, runBuy, type AgentResult, type Emit, type Step } from "./lib/agent";
import { listOffers, rowByOffer, type Confirmation } from "./lib/search";
import type { Row } from "./data/mercato";

type View = "table" | "gallery";

type State = {
  seq: number;
  messages: ChatMsg[];
  running: boolean;
  query: string | null;
  rows: Row[];
  matched: number | null;
  view: View;
  selectedProductId: string | null;
  confirmation: Confirmation | null;
  spentCents: number;
  gen: number;
};

type Action =
  | { type: "user"; text: string }
  | { type: "step"; step: Step }
  | { type: "resolveTool"; result: string; ms: number }
  | { type: "query"; query: string }
  | { type: "searchResult"; rows: Row[] }
  | { type: "agentMsg"; text: string }
  | { type: "buyResult"; confirmation: Confirmation }
  | { type: "done" }
  | { type: "view"; view: View }
  | { type: "select"; productId: string }
  | { type: "closeDrawer" }
  | { type: "closeConfirmation" }
  | { type: "reset" };

function initial(): State {
  return {
    seq: 0, messages: [], running: false, query: null,
    rows: listOffers(), matched: null, view: "table",
    selectedProductId: null, confirmation: null, spentCents: 0, gen: 0,
  };
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "user": {
      const uid = s.seq, sid = s.seq + 1;
      return {
        ...s, seq: s.seq + 2, running: true,
        messages: [...s.messages, { id: uid, role: "user", text: a.text }, { id: sid, role: "steps", steps: [] }],
      };
    }
    case "step": {
      const msgs = s.messages.slice();
      const last = msgs[msgs.length - 1];
      if (last && last.role === "steps") msgs[msgs.length - 1] = { ...last, steps: [...last.steps, a.step] };
      return { ...s, messages: msgs };
    }
    case "resolveTool": {
      const msgs = s.messages.slice();
      for (let i = msgs.length - 1; i >= 0; i--) {
        const m = msgs[i];
        if (m.role !== "steps") continue;
        const steps = m.steps.slice();
        for (let j = steps.length - 1; j >= 0; j--) {
          const st = steps[j];
          if (st.kind === "tool" && st.running) {
            steps[j] = { ...st, running: false, result: a.result, ms: a.ms };
            msgs[i] = { ...m, steps };
            return { ...s, messages: msgs };
          }
        }
        break;
      }
      return s;
    }
    case "query": return { ...s, query: a.query };
    case "searchResult": return { ...s, rows: a.rows, matched: a.rows.length, gen: s.gen + 1 };
    case "agentMsg": return { ...s, messages: [...s.messages, { id: s.seq, role: "agent", text: a.text }], seq: s.seq + 1 };
    case "buyResult": return { ...s, confirmation: a.confirmation, spentCents: s.spentCents + a.confirmation.totalCents };
    case "done": return { ...s, running: false };
    case "view": return { ...s, view: a.view };
    case "select": return { ...s, selectedProductId: a.productId };
    case "closeDrawer": return { ...s, selectedProductId: null };
    case "closeConfirmation": return { ...s, confirmation: null };
    case "reset": return initial();
    default: return s;
  }
}

export default function App() {
  const [s, dispatch] = useReducer(reducer, undefined, initial);

  const emit: Emit = (e) => {
    if (e.step) dispatch({ type: "step", step: e.step });
    if (e.query) dispatch({ type: "query", query: e.query });
    if (e.resolve) dispatch({ type: "resolveTool", result: e.resolve.result, ms: e.resolve.ms });
  };

  function apply(result: AgentResult) {
    if (result.kind === "search") {
      dispatch({ type: "searchResult", rows: result.rows });
      dispatch({ type: "agentMsg", text: result.summary });
    } else if (result.kind === "buy") {
      dispatch({ type: "agentMsg", text: result.summary });
      dispatch({ type: "buyResult", confirmation: result.confirmation });
    } else {
      dispatch({ type: "agentMsg", text: result.summary });
    }
    dispatch({ type: "done" });
  }

  async function handleSubmit(text: string) {
    if (s.running) return;
    dispatch({ type: "user", text });
    apply(await runAgent(text, emit));
  }

  async function handleBuy(offerId: string) {
    if (s.running) return;
    const row = rowByOffer(offerId);
    const text = row ? `Buy the ${row.product.name} from ${row.dealer.name}` : "Buy this";
    dispatch({ type: "closeDrawer" });
    dispatch({ type: "user", text });
    apply(await runBuy(offerId, emit));
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header spentCents={s.spentCents} onReset={() => dispatch({ type: "reset" })} />

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[380px_1fr]">
        {/* LEFT — agent chat */}
        <div className="hidden lg:flex flex-col min-h-0 border-r border-[color:var(--color-border)]">
          <Panel eyebrow="AGENT · mercato" title="Shopping assistant" className="h-full">
            <ChatPanel messages={s.messages} running={s.running} onSubmit={handleSubmit} />
          </Panel>
        </div>

        {/* RIGHT — the live database */}
        <div className="min-h-0 flex flex-col">
          <DatabaseView
            query={s.query}
            rows={s.rows}
            matched={s.matched}
            running={s.running}
            view={s.view}
            gen={s.gen}
            onView={(v) => dispatch({ type: "view", view: v })}
            onSelect={(productId) => dispatch({ type: "select", productId })}
          />
        </div>
      </div>

      <AnimatePresence>
        {s.selectedProductId && (
          <DealerDrawer
            key="drawer"
            productId={s.selectedProductId}
            busy={s.running}
            onClose={() => dispatch({ type: "closeDrawer" })}
            onBuy={handleBuy}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {s.confirmation && (
          <ConfirmationCard key="confirmation" confirmation={s.confirmation} onClose={() => dispatch({ type: "closeConfirmation" })} />
        )}
      </AnimatePresence>
    </div>
  );
}
