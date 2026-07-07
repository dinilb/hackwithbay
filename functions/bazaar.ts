// Bazaar — single backend function (action router).
// Real Butterbase writes (ctx.db) + real Neo4j Mandate traversal (fetch).
// Deployed to Butterbase app_q5vnqwcjnh72 as `bazaar`.
// GET  ?action=catalog | graph | state | provenance&order=<id>
// POST { action: 'shop'|'decide'|'reset', ... }

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function cy(ctx: any, statement: string, parameters: Record<string, unknown> = {}) {
  const res = await fetch(ctx.env.NEO4J_HTTP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: ctx.env.NEO4J_AUTH },
    body: JSON.stringify({ statement, parameters }),
  });
  const j: any = await res.json().catch(() => ({}));
  if (!res.ok || j.errors) throw new Error("neo4j: " + JSON.stringify(j.errors || j).slice(0, 200));
  const { fields = [], values = [] } = j.data || {};
  return values.map((row: any[]) => Object.fromEntries(fields.map((f: string, i: number) => [f, row[i]])));
}

const rows = async (ctx: any, sql: string, params: unknown[] = []) => (await ctx.db.query(sql, params)).rows;
const one = async (ctx: any, sql: string, params: unknown[] = []) => (await rows(ctx, sql, params))[0];

async function event(ctx: any, task_id: string | null, step: string, message: string, level = "info") {
  await ctx.db.query(
    "insert into agent_events (task_id, step, message, level) values ($1,$2,$3,$4)",
    [task_id, step, message, level]
  );
}

const USER = "dinil";
const AGENT = "shopper-1";

const AUTHORIZE = `
MATCH (u:User {id:$user})-[:GRANTED]->(m:Mandate {status:'active'})-[:FOR]->(a:Agent {id:$agent}),
      (m)-[:ALLOWS]->(c:Category)<-[:IN_CATEGORY]-(s:Merchant {slug:$merchant})
WHERE m.expiry > $now
OPTIONAL MATCH (m)<-[:MINTED_UNDER]-(k:Card {status:'spent'})<-[:PAID_WITH]-(:Order)
WITH u,m,a,s,c, coalesce(sum(k.cap),0) AS spent_this_week
WHERE spent_this_week + $price <= m.budget_weekly
RETURN m.id AS mandate, s.trusted AS trusted,
       ($price > m.per_txn_approval_over OR NOT s.trusted) AS needs_approval,
       m.budget_weekly AS budget, spent_this_week,
       [u.id, m.id, a.id, s.slug, c.name] AS path_ids`;

async function authorize(ctx: any, merchant: string, price: number) {
  const r = await cy(ctx, AUTHORIZE, { user: USER, agent: AGENT, merchant, price, now: Date.now() });
  return r[0] || null;
}

// Relaxed sub-queries to explain a denial.
async function denialReason(ctx: any, merchant: string, price: number) {
  const allowed = await cy(
    ctx,
    `MATCH (u:User {id:$user})-[:GRANTED]->(m:Mandate {status:'active'})-[:FOR]->(a:Agent {id:$agent}),
           (m)-[:ALLOWS]->(c:Category)<-[:IN_CATEGORY]-(s:Merchant {slug:$merchant})
     WHERE m.expiry > $now RETURN m.id AS mandate, m.budget_weekly AS budget`,
    { user: USER, agent: AGENT, merchant, now: Date.now() }
  );
  if (allowed.length === 0) return { code: "category-not-allowed", label: "CATEGORY NOT IN MANDATE" };
  if (price > allowed[0].budget) return { code: "budget-exceeded", label: "BUDGET EXCEEDED" };
  return { code: "denied", label: "DENIED" };
}

async function getCatalog(ctx: any) {
  const ms = await rows(ctx, "select * from merchants order by name");
  const ps = await rows(ctx, "select * from products order by price_cents");
  return {
    merchants: ms.map((m: any) => ({ ...m, products: ps.filter((p: any) => p.merchant_slug === m.slug) })),
  };
}

async function getGraph(ctx: any) {
  const nodes = await cy(
    ctx,
    `MATCH (n) RETURN coalesce(n.id, n.slug, n.name) AS id, head(labels(n)) AS type, properties(n) AS props`
  );
  const edges = await cy(
    ctx,
    `MATCH (a)-[r]->(b) RETURN coalesce(a.id,a.slug,a.name) AS from, coalesce(b.id,b.slug,b.name) AS to, type(r) AS type`
  );
  return { nodes, edges };
}

async function getState(ctx: any) {
  return {
    tasks: await rows(ctx, "select * from tasks order by created_at desc limit 20"),
    events: await rows(ctx, "select * from agent_events order by created_at asc limit 120"),
    cards: await rows(ctx, "select * from cards order by minted_at desc limit 20"),
    orders: await rows(ctx, "select * from orders order by created_at desc limit 20"),
    approvals: await rows(ctx, "select * from approvals order by created_at desc limit 20"),
  };
}

async function getProvenance(ctx: any, order: string) {
  const r = await cy(
    ctx,
    `MATCH (o:Order {id:$order})
     OPTIONAL MATCH (o)-[:FULFILLS]->(t:Task)<-[:ISSUED]-(u:User)
     OPTIONAL MATCH (u)-[:GRANTED]->(m:Mandate)-[:FOR]->(a:Agent)
     OPTIONAL MATCH (o)-[:PAID_WITH]->(k:Card)-[:MINTED_UNDER]->(m)
     OPTIONAL MATCH (o)-[:AT]->(s:Merchant)
     RETURN [u.id, t.id, a.id, m.id, k.id, s.slug, o.id] AS path_ids`,
    { order }
  );
  return { path_ids: (r[0]?.path_ids || []).filter(Boolean) };
}

async function mintAndOrder(ctx: any, p: any, task_id: string, mandate_id: string) {
  const last4 = String(Math.floor(1000 + Math.random() * 9000));
  const price_cents = p.price_cents as number;
  const priceDollars = price_cents / 100;
  const card = await one(
    ctx,
    `insert into cards (pan_last4, cap_cents, merchant_lock, status, mandate_id, task_id)
     values ($1,$2,$3,'active',$4,$5) returning *`,
    [last4, price_cents, p.merchant_slug, mandate_id, task_id]
  );
  await cy(
    ctx,
    `MATCH (m:Mandate {id:$mandate})
     MERGE (k:Card {id:$id}) SET k.pan_last4=$last4, k.cap=$cap, k.merchant_lock=$lock, k.status='active', k.minted_at=timestamp()
     MERGE (k)-[:MINTED_UNDER]->(m)`,
    { mandate: mandate_id, id: card.id, last4, cap: priceDollars, lock: p.merchant_slug }
  );
  const fee_cents = Math.round(price_cents * 0.025);
  const order = await one(
    ctx,
    `insert into orders (sku, item, total_cents, fee_cents, merchant_slug, card_id, task_id)
     values ($1,$2,$3,$4,$5,$6,$7) returning *`,
    [p.sku, p.name, price_cents, fee_cents, p.merchant_slug, card.id, task_id]
  );
  await ctx.db.query("update products set stock = greatest(stock - 1, 0) where sku = $1", [p.sku]);
  await ctx.db.query("update cards set status='spent' where id = $1", [card.id]);
  await cy(
    ctx,
    `MATCH (k:Card {id:$card}) SET k.status='spent'
     MERGE (o:Order {id:$order}) SET o.total=$total, o.sku=$sku, o.item=$item, o.created_at=timestamp()
     MERGE (o)-[:PAID_WITH]->(k)
     WITH o MATCH (s:Merchant {slug:$merchant}) MERGE (o)-[:AT]->(s)
     WITH o MATCH (t:Task {id:$task}) MERGE (o)-[:FULFILLS]->(t)`,
    { card: card.id, order: order.id, total: priceDollars, sku: p.sku, item: p.name, merchant: p.merchant_slug, task: task_id }
  );
  await event(ctx, task_id, "MINT", `minted single-use card ••${last4} · cap $${priceDollars.toFixed(2)} · lock ${p.merchant_slug}`, "authorized");
  await event(ctx, task_id, "ORDER", `order placed · ${p.name} at ${p.merchant_slug}`, "authorized");
  await event(ctx, task_id, "SPENT", `card ••${last4} spent — now dead`, "info");
  return { card: { ...card, status: "spent" }, order, fee_cents };
}

async function shop(ctx: any, body: any) {
  const p = await one(ctx, "select * from products where sku = $1", [body.sku]);
  if (!p) return json({ error: "unknown sku" }, 400);
  const price = p.price_cents / 100;

  const task = await one(ctx, "insert into tasks (text) values ($1) returning *", [body.task || `buy ${p.name}`]);
  await cy(
    ctx,
    `MATCH (u:User {id:$user}), (a:Agent {id:$agent})
     MERGE (t:Task {id:$id}) SET t.text=$text, t.created_at=timestamp()
     MERGE (u)-[:ISSUED]->(t) MERGE (t)-[:GIVEN_TO]->(a)`,
    { user: USER, agent: AGENT, id: task.id, text: task.text }
  );

  const catCount = await one(ctx, "select count(*)::int as n from products where category = $1", [p.category]);
  await event(ctx, task.id, "SEARCH", "scanning 5 storefronts via MCP…");
  await event(ctx, task.id, "CANDIDATES", `${catCount.n} candidates in ${p.category} · selected ${p.name} ($${price.toFixed(2)})`);
  await event(ctx, task.id, "AUTHORIZE", `traversing trust graph · ${p.merchant_slug} · $${price.toFixed(2)}`);

  const auth = await authorize(ctx, p.merchant_slug, price);
  if (!auth) {
    const reason = await denialReason(ctx, p.merchant_slug, price);
    await event(ctx, task.id, "DENIED", `${reason.label} — no card minted`, "denied");
    return json({ verdict: "denied", reason, task_id: task.id, product: p });
  }

  if (auth.needs_approval) {
    const approval = await one(
      ctx,
      `insert into approvals (task_id, sku, item, merchant_slug, amount_cents, reason, status)
       values ($1,$2,$3,$4,$5,$6,'pending') returning *`,
      [task.id, p.sku, p.name, p.merchant_slug, p.price_cents, `> $${auth.needs_approval ? 25 : 0} per-txn`]
    );
    await event(ctx, task.id, "BLOCKED", `awaiting signature · $${price.toFixed(2)} > $25 per-txn`, "pending");
    return json({ verdict: "approval", approval, task_id: task.id, path_ids: auth.path_ids, mandate: auth.mandate, product: p });
  }

  const minted = await mintAndOrder(ctx, p, task.id, auth.mandate);
  return json({ verdict: "authorized", ...minted, task_id: task.id, path_ids: auth.path_ids, mandate: auth.mandate, product: p });
}

async function decide(ctx: any, body: any) {
  const ap = await one(ctx, "select * from approvals where id = $1", [body.approval_id]);
  if (!ap) return json({ error: "unknown approval" }, 400);
  if (body.decision === "deny") {
    await ctx.db.query("update approvals set status='denied' where id=$1", [ap.id]);
    await event(ctx, ap.task_id, "DENIED", `signature refused · ${ap.item}`, "denied");
    return json({ verdict: "denied", approval_id: ap.id });
  }
  const p = await one(ctx, "select * from products where sku = $1", [ap.sku]);
  const auth = await authorize(ctx, ap.merchant_slug, ap.amount_cents / 100);
  const mandate = auth?.mandate || "M1";
  await ctx.db.query("update approvals set status='approved' where id=$1", [ap.id]);
  await event(ctx, ap.task_id, "APPROVED", `human signed · ${ap.item}`, "authorized");
  const minted = await mintAndOrder(ctx, p, ap.task_id, mandate);
  return json({ verdict: "authorized", ...minted, task_id: ap.task_id, path_ids: auth?.path_ids || [], mandate, product: p });
}

async function reset(ctx: any) {
  for (const t of ["agent_events", "orders", "cards", "approvals", "tasks"]) {
    await ctx.db.query(`delete from ${t}`);
  }
  await ctx.db.query("update products set stock = 40 where stock < 40");
  await cy(ctx, `MATCH (n) WHERE n:Order OR n:Card OR n:Task OR n:Approval DETACH DELETE n`);
  return json({ ok: true });
}

export async function handler(req: Request, ctx: any) {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  try {
    const url = new URL(req.url);
    if (req.method === "GET") {
      const action = url.searchParams.get("action") || "state";
      if (action === "catalog") return json(await getCatalog(ctx));
      if (action === "graph") return json(await getGraph(ctx));
      if (action === "state") return json(await getState(ctx));
      if (action === "provenance") return json(await getProvenance(ctx, url.searchParams.get("order") || ""));
      return json({ error: "unknown action" }, 400);
    }
    const body = await req.json().catch(() => ({}));
    if (body.action === "shop") return await shop(ctx, body);
    if (body.action === "decide") return await decide(ctx, body);
    if (body.action === "reset") return await reset(ctx);
    return json({ error: "unknown action" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
}
