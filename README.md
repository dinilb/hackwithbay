# Mercato

**One database of every product and every supplier — pay once, then let your agents buy anything.**

Commerce data (specs, price, reliability, fulfillment time) is scattered and messy across millions of sites. Mercato unifies it into one clean, queryable catalog so an AI agent can **find** a product, **compare** the dealers selling it, **buy** from the one you pick, and **confirm** — with no signup, no Stripe redirect, and no typing a card number more than once. Enter your card **once**; your whole agent stack can buy anything.

> Full build plan and source of truth: [`AGENTS.md`](./AGENTS.md). Visual system: [`design.md`](./design.md).

## The demo (4 beats)

1. **Find** — *"Find me &lt;product X&gt;."* The agent searches visibly, pulling the Mercato database.
2. **Compare** — it presents **4 dealers** of product X (dealer, price, reliability, fulfillment time, photo).
3. **Buy** — *"Buy X from dealer Y."* The order is placed with the card already on file — **no re-entry**.
4. **Confirm** — the agent sends a confirmation back to you.

## Stack

| Layer | Service | Role |
|---|---|---|
| **Catalog + checkout** | **Butterbase** (Postgres, functions, auth, billing, AI gateway, frontend deploy) | The transactional catalog: products, suppliers, offers, orders, and the single card on file. Powers search, ordering, and the deployed web UI. |
| **Graph / memory** | **Neo4j** | Stores **user preferences, agent memory, and supplier information** — brand/price/speed leanings, what the agents learned across sessions, and suppliers as a graph (who fulfills for whom, reliability propagation). Personalizes ranking; never gates a purchase. |
| **Agents** | **RocketRide** | Hosts the **AI agents that handle shopping and purchases** — the search → rank → present → order pipeline. Reads/writes user preferences and memory in Neo4j so behavior improves over time. |

Mercato ships as both an **MCP server** (connect it to Claude, Cursor, etc.) and a **web app**, so you can list, search, compare, and buy products from either surface.

### How the pieces fit

```
User / Agent
    │  "find me X"  ·  "buy X from dealer Y"
    ▼
RocketRide agents  ──reads/writes prefs + memory──►  Neo4j (prefs · memory · supplier graph)
    │  search · rank · narrate · order
    ▼
Butterbase  (Postgres catalog · functions · auth · billing · card-on-file · deployed frontend)
```

## Repo layout

| Path | What |
|---|---|
| `app/` | React + TypeScript + Vite web UI. See [`app/README.md`](./app/README.md) for dev setup. |
| `functions/` | Butterbase serverless functions (`search`, `shop-agent`, `place-order`, `confirm`). |
| `data/` | `catalog.json` seed — products, suppliers, and offers (≥4 dealer offers on the demo product). |
| `scripts/` | Seed + smoke-check scripts, including Neo4j seeding for prefs / memory / supplier graph. |
| `pitch-deck/` | 7-slide browser presentation. See [`pitch-deck/README.md`](./pitch-deck/README.md). |
| `AGENTS.md` | Build plan and source of truth. |
| `design.md` | "Terminal, not toy" visual system. |

## Getting started

```bash
# web app
cd app
npm install
npm run dev
```

Backend config (Butterbase, Neo4j, RocketRide) lives in `.cursor/mcp.json` and `.env` — both gitignored, since they hold secrets. See §3 of [`AGENTS.md`](./AGENTS.md) for the connection reference.

---

*One database + pay once. This is the future of commerce and trade.*
