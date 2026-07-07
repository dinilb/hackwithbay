import type { Catalog, Graph, State, ShopResult } from "./types";

export const API_BASE =
  (import.meta.env.VITE_BAZAAR_API as string | undefined) ||
  "https://api.butterbase.ai/v1/app_q5vnqwcjnh72/fn/bazaar";

async function get<T>(action: string, params: Record<string, string> = {}): Promise<T> {
  const q = new URLSearchParams({ action, ...params });
  const res = await fetch(`${API_BASE}?${q}`);
  if (!res.ok) throw new Error(`${action} ${res.status}`);
  return res.json();
}
async function post<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${body.action} ${res.status}`);
  return res.json();
}

export const api = {
  catalog: () => get<Catalog>("catalog"),
  graph: () => get<Graph>("graph"),
  state: () => get<State>("state"),
  provenance: (order: string) => get<{ path_ids: string[] }>("provenance", { order }),
  shop: (task: string, sku: string) => post<ShopResult>({ action: "shop", task, sku }),
  decide: (approval_id: string, decision: "approve" | "deny") =>
    post<ShopResult>({ action: "decide", approval_id, decision }),
  reset: () => post<{ ok: boolean }>({ action: "reset" }),
};

export const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
