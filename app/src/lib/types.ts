export type Product = {
  sku: string; merchant_slug: string; name: string;
  price_cents: number; stock: number; category: string; emoji: string;
};
export type Merchant = {
  slug: string; name: string; category: string; trusted: boolean;
  source: string; blurb: string; products: Product[];
};
export type Catalog = { merchants: Merchant[] };

export type GraphNode = { id: string; type: string; props: Record<string, unknown> };
export type GraphEdge = { from: string; to: string; type: string };
export type Graph = { nodes: GraphNode[]; edges: GraphEdge[] };

export type Card = {
  id: string; pan_last4: string; cap_cents: number; merchant_lock: string;
  status: "active" | "spent" | "void"; mandate_id: string; task_id: string; minted_at: string;
};
export type Order = {
  id: string; sku: string; item: string; total_cents: number; fee_cents: number;
  merchant_slug: string; card_id: string; task_id: string; created_at: string;
};
export type Approval = {
  id: string; task_id: string; sku: string; item: string; merchant_slug: string;
  amount_cents: number; reason: string; status: "pending" | "approved" | "denied"; created_at: string;
};
export type AgentEvent = {
  id: string; task_id: string; step: string; message: string; level: string; created_at: string;
};
export type Task = { id: string; text: string; status: string; created_at: string };

export type State = {
  tasks: Task[]; events: AgentEvent[]; cards: Card[]; orders: Order[]; approvals: Approval[];
};

export type Verdict = "authorized" | "approval" | "denied";
export type ShopResult = {
  verdict: Verdict;
  reason?: { code: string; label: string };
  card?: Card; order?: Order; approval?: Approval;
  fee_cents?: number; task_id: string; path_ids?: string[];
  mandate?: string; product: Product;
};
