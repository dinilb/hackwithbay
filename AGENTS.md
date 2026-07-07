# AGENTS.md — Mercato: Build Plan

> **Supersedes the old "Bazaar + Mandate" plan.** Scoped mandates, single-use virtual cards, approval gates, and provenance paths are **cut** — they contradict the new pitch's core promise (*pay once, then buy frictionlessly*). **Neo4j and RocketRide are core to the stack:** Neo4j stores **user preferences, agent memory, and supplier information**; RocketRide **hosts the AI agents that handle shopping and purchases**. This doc is the source of truth; `design.md`'s visual system still applies (just rename Bazaar → Mercato in copy). See §13 for what maps over from the old code.

**The product:** **Mercato** — a universal database of *every product and every supplier*. Commerce data (specs, price, reliability, fulfillment time) is scattered and messy across millions of sites; Mercato unifies it into one clean, queryable catalog so an AI agent can **find** a product, **compare** the dealers selling it, **buy** from the one you pick, and **confirm** — with no signup, no Stripe redirect, and no typing a card number more than once. Enter your card **once**; your whole agent stack can buy anything.

**Everything below serves one demo.** The job is *communication*: judges must instantly get the **problem** (commerce data is fragmented; agents can't really shop) and the **vision** (one database + pay-once = the future of agentic commerce). Optimize every choice for legibility on screen.

---

## 1. The one demo we optimize for (4 beats)

1. **Find.** You: *"Find me &lt;product X&gt;."* The agent searches — **visibly**. It shows itself scanning, pulling the Mercato database. *We must visualize this on screen.*
2. **Compare.** The agent presents **4 dealers** of product X — dealer name, **price**, **reliability**, **fulfillment time**, product photo.
3. **Buy.** You: *"Buy X from dealer Y."* The agent places the order, paying with the card already on file — **no re-entry**.
4. **Confirm.** The agent sends a **confirmation** back to you.

That's the whole thing. Clear, easy to communicate, obvious value.

## 2. Two things to say out loud to judges

1. **The database.** Product/supplier data lives across millions of sites — specs, fulfillment, reliability, price, all messy. Mercato is *the* database of every product and supplier, so an agent sees **exactly what it can and can't buy**, and comparing/deciding becomes trivial.
2. **Pay once.** No signup, no Stripe, no re-entering a card per purchase. Enter card details **once** → your agent stack buys whatever you want.

Closing line: *"One database + pay once. This is the future of commerce and trade."*

---

## 3. Reference (verified live)

| Thing | Value |
|---|---|
| Butterbase | MCP connected (Claude Code + Cursor). Existing app `app_pt7r9bbyxewe` (inbox-recall) is STALE — **create/confirm a fresh app `mercato` in Phase 1** (frontend URL must not say inbox-recall). |
| LLM calls | Butterbase AI gateway, `claude-sonnet-4-6`. Use the latest capable Claude model. The shopping/purchase agents themselves run on **RocketRide** (§8). |
| Submission | paste in Claude Code: `Submit my project to the hackathon. Submission code: ENJOY0707. Hackathon slug: HackwithBay-0707` |
| Billing promo | `ENJOY0707` at dashboard → Billing |
| Neo4j (**core**) | Live at `POST https://9d7c9060.databases.neo4j.io/db/neo4j/query/v2` · basic auth `neo4j`/`$NEO4J_PASSWORD` (.env). Stores **user preferences, agent memory, and supplier information** (§12). |
| RocketRide (**core**) | Hosts the **AI agents that handle shopping and purchases** — the search → rank → present → order pipeline (§8). |

### 3.1 MCP servers (Cursor) — verified connected

Config in `.cursor/mcp.json` (gitignored — secrets; do NOT commit). Credentials mirrored in `.env` (gitignored). Reload Cursor / toggle in **Settings → MCP & Integrations** after editing.

| Server | Transport | Endpoint / command | Auth | Notes |
|---|---|---|---|---|
| `butterbase` | http | `https://api.butterbase.ai/mcp` | header `Authorization: Bearer $BUTTERBASE_API_KEY` | Key `bb_sk_...` in `.env`. **Primary backend** for Mercato: catalog DB, functions, auth, AI gateway, billing, frontend deploy. |
| `rocketride` | stdio | `/Users/cs/.local/bin/rocketride-mcp` (pipx, v1.3.0) | env `ROCKETRIDE_URI=https://api.rocketride.ai` + `ROCKETRIDE_APIKEY=rr_...` | **Core.** Hosts the **AI shopping/purchase agents** — the search→rank→present→order pipeline (§8). Needs Python 3.10+ (installed via pipx). |
| `neo4j` | stdio | `neo4j-mcp` (`/opt/homebrew/bin/neo4j-mcp`, v1.5.3) | env `NEO4J_URI`/`NEO4J_USERNAME`/`NEO4J_PASSWORD`/`NEO4J_DATABASE` | **Core.** Stores **user preferences, agent memory, and supplier information** (§12). Cursor does NOT expand `${VAR}` — inline literals in `mcp.json`. |

---

## 4. The database IS the product (Butterbase Postgres)

The entire pitch is "one database of every product and supplier," so the schema is the star of the show. Apply via `manage_schema`, seed from `data/catalog.json`.

| Table | Shape | Why |
|---|---|---|
| `products` | `{id, name, category, brand, specs jsonb, image_url, description}` | The **canonical product** — one row per real-world item ("RTX-class GPU", "plain white tee"). |
| `suppliers` | `{id, name, reliability int 0–100, avg_fulfillment_days, rating, logo}` | A **dealer/supplier**. |
| `offers` | `{id, product_id, supplier_id, price_cents, stock, fulfillment_days, reliability}` | A specific dealer selling a specific product. **"4 dealers of product X" = 4 offers joined to the same `product_id`.** This is the heart of the compare beat. |
| `orders` | `{id, offer_id, product_id, supplier_id, qty, total_cents, status, confirmation_code, created_at}` | Placed orders. |
| `payment_methods` | `{id, user_id, brand, last4, status}` | The card on file, entered **once** (test mode). Orders charge against it — the whole point is zero re-entry. |
| `agent_events` | `{id, session_id, step, message, created_at}` | The search-narration feed the UI streams ("scanning 40 suppliers… 12 offers for 'X'… ranking by price × reliability…"). |

**Seeding rule (`data/catalog.json`):** enough products that a search returns a believable result, and **at least one product with ≥4 dealer offers** spanning clear trade-offs — *cheapest-but-slow*, *fastest-but-pricey*, *most-reliable*, *best-value* — so the 4-dealer comparison beat is instantly legible. Emoji/hosted image per product (zero image-sourcing effort).

**Where data lives:** Butterbase Postgres is the **transactional catalog** (products, offers, orders, payment). **Neo4j** is the **graph layer** — it stores **user preferences, agent memory, and supplier information** (relationships, reliability signals, who fulfills for whom) so the shopping agents can personalize and remember across sessions (§12).

---

## 5. Functions (Butterbase serverless, TS via `deploy_function`)

- **`search`** — `POST {query}` → matches `products` on name/category/specs, joins `offers` → returns products + their offers. Powers the visible search.
- **`shop-agent`** — `POST {message, session_id}` (the "Find me X" NL task). This is the **AI shopping agent hosted on RocketRide** (§8) →
  ① write `agent_events` `"searching…"` steps →
  ② call `search` →
  ③ read the user's **preferences + agent memory from Neo4j** to bias ranking, then the LLM ranks and selects the **top 4 dealer offers** for the best-matching product, each with a one-line reason →
  ④ return `{product, offers:[4], narration}`, and write what it learned back to **agent memory in Neo4j**. Streams events so the UI can *visualize* the search (beat 1).
- **`place-order`** — `POST {offer_id, qty}` → validate stock → charge the card **on file** (test mode, **no re-entry**) → decrement stock → write `orders` row with a `confirmation_code` → return the receipt (beat 3).
- **`confirm`** — deliver the confirmation to the user: in-app receipt + optional email via Butterbase (beat 4).

**Pay-once is enforced in `place-order`:** it never asks for card details — it reads the single `payment_methods` row. Line for judges: *"the agent didn't ask me for a card — I entered it once."*

---

## 6. UI — one screen, built to communicate

Single page. Follow `design.md` (**Terminal, not toy** — paper/ink/mono, color = state, structure over shadow).

- **Ask box** (top): "Find me anything…" + 2–3 preset chips (the demo query).
- **Search feed** (streams `agent_events`): the agent narrating as a system log — `SEARCHING · SCANNING 40 SUPPLIERS · 12 OFFERS · RANKING`. This satisfies the *"visualize the search"* requirement (beat 1).
- **Dealer cards** (the hero, beat 2): 4 cards for product X — photo, dealer name, **price**, **reliability**, **fulfillment time**, one-line "why," and a **Buy from &lt;dealer&gt;** button.
- **Confirmation** (beat 4): on buy → confirmation card/toast with the code. *"Paid with card on file •4242 — no re-entry."*
- **Wallet chip** (header, optional): shows the single card on file, so the pay-once story is visible *before* the buy.

Polling ~2s for the feed; render dealer cards as soon as `shop-agent` returns.

---

## 7. Build order

| # | Focus (backend) | Focus (UI) | Done when |
|---|---|---|---|
| 1 | Butterbase app `mercato` · `products`/`suppliers`/`offers`/`orders`/`payment_methods`/`agent_events` schema · seed `catalog.json` (≥1 product w/ 4 offers) | Vite scaffold · ask box + search feed shell · dealer-card component | `search "X"` returns product + ≥4 offers |
| 2 | `search` · `shop-agent` (LLM ranks top-4) · `place-order` (card on file) · `confirm` | wire feed → dealer cards → Buy → confirmation | full 4-beat flow works end-to-end |
| 3 | seed polish · confirmation email · billing promo redeem | design polish (design.md tokens) · deploy frontend · wallet chip | deployed URL runs the demo clean |
| 4 | RocketRide hosts the shopping/purchase agents (§8) · Neo4j stores user prefs + agent memory + suppliers (§12), wired into ranking | extra product coverage | agents run on RocketRide, reading/writing Neo4j |
| 5 | reset → **rehearse runbook ×2** → backup screen-recording → **SUBMIT** | — | submission confirmed |

## 8. RocketRide — the AI shopping/purchase agents (core)

**RocketRide hosts the AI agents that handle shopping and purchases.** The `shop-agent` search → rank → present flow and the `place-order` purchase flow run as managed RocketRide agents/endpoints the app calls in production (per `.claude/rules/rocketride.md` — read `.rocketride/docs/` before writing any RocketRide code). The agents read/write **user preferences and memory in Neo4j** (§12) so they personalize and remember across sessions.

*Fallback (if RocketRide is flaky under demo pressure):* the same logic can run inline as a Butterbase function — keep that path working as a safety net, but RocketRide is the intended home.

## 9. Smoke checks (`scripts/smoke.mjs`)

1. `search "X"` → returns the product + **≥4 offers**.
2. `shop-agent "find me X"` → exactly **4 ranked dealer offers** with reasons + narration events written.
3. `place-order` on a chosen offer → `orders` row + `confirmation_code`, stock decremented, **card read from `payment_methods` (no re-entry path)**.
4. `confirm` → confirmation retrievable/visible in UI.
5. UI E2E: type query → feed streams → 4 dealer cards render → click Buy → confirmation shows.

## 10. Demo runbook (~90s)

1. **(15s)** *"Commerce data is scattered across millions of sites — price, reliability, fulfillment, all messy. Mercato is one database of every product and every supplier. And I entered my card once — that's it."*
2. **(25s)** Type *"find me &lt;X&gt;"* → the feed narrates the search **live** → the agent pulls the database.
3. **(25s)** 4 dealer cards appear — price, reliability, fulfillment, photo. *"The agent sees exactly what it can buy, and compares for me."*
4. **(15s)** *"Buy X from &lt;dealer Y&gt;."* → order placed with the card on file — **no signup, no Stripe, no card entry**.
5. **(10s)** Confirmation arrives. Close: *"One database + pay once. This is the future of commerce and trade."*

Record a backup video before the submission window.

## 11. Risks & cuts

**Cut order (under demo pressure):** freeform tasks (chips only) → confirmation email (in-app receipt suffices) → design polish. If RocketRide or Neo4j is flaky live, **degrade** rather than remove — fall back to the inline Butterbase path for the agents and skip the personalization read — but they are core to the stack story, not first-to-cut.
**Never cut:** the 4 beats (find → compare-4-dealers → buy → confirm), the visible search feed, the pay-once (card-on-file) beat, and the submission.
**Risks:** LLM ranking flakiness → constrain output to strict JSON (`{offers:[{offer_id, reason}]}`) and cap at 4; search returning <4 offers → seed guarantees ≥4 on the demo product; RocketRide/Neo4j downtime → inline fallback keeps the demo alive; clock → cut per order above.

---

## 12. Neo4j — user preferences, agent memory & supplier information (core)

**Neo4j is the graph layer of the stack.** It stores three things:

1. **User preferences** — brand/price/speed/reliability leanings the agent uses to bias ranking (e.g. "prefers fastest fulfillment", "avoids brand Z").
2. **Agent memory** — what the shopping agents learned across sessions: past queries, chosen dealers, order history, so behavior improves over time instead of starting cold each run.
3. **Supplier information** — suppliers as a graph: who fulfills for whom, distributor → reseller chains, reliability propagation, and how suppliers connect to products through offers — so the agent can justify *why* a dealer ranks where it does.

It must never gate a purchase (that would break pay-once) — it **informs and personalizes** ranking, it doesn't block. The RocketRide agents (§8) read preferences + memory before ranking and write memory back after each task.

## 13. Migration note — old `Bazaar/Mandate` code → Mercato

The existing `app/` and `functions/` were built for the old trust-graph pitch. Reuse what maps; drop the rest.

| Old asset | New role |
|---|---|
| `TaskBox.tsx` | → **Ask box** ("Find me anything…"). |
| `AgentFeed.tsx` | → **Search feed** (streams `agent_events`). Keep the system-log voice. |
| `Store.tsx` / catalog rendering | → **Dealer cards** (repurpose the product-card layout). |
| `Receipts.tsx` | → **Confirmation** card/toast. |
| `functions/bazaar.ts` | → split into `search` / `shop-agent` / `place-order` / `confirm`. |
| `data/catalog.json` | → reshape to `products` + `suppliers` + `offers` (≥4 offers on the demo product). |
| `VirtualCard.tsx`, `ApprovalCard.tsx` | **Drop** — mandate/approval era, contradicts pay-once. |
| `GraphCanvas.tsx` | *(optional)* repurpose to visualize the Neo4j supplier/memory graph (§12) if time allows; not required for the 4 beats. |
| `scripts/neo4j.mjs`, `seed-graph.mjs` | **Reuse** — Neo4j is core (§12): seed user prefs, agent memory, and the supplier graph. |

`design.md` (the "Terminal, not toy" system) still applies verbatim — just update the product name in copy to **Mercato**.
