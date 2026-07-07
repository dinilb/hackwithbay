// Verify the AUTHORIZE traversal for the 3 canonical demo beats.
// Run: node --env-file=.env scripts/verify.mjs
import { cypher } from "./neo4j.mjs";

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

const cases = [
  { label: "tee $12 @ bobs-tshirts (apparel)", p: { user: "dinil", agent: "shopper-1", merchant: "bobs-tshirts", price: 12, now: Date.now() }, expect: "AUTHORIZE (auto)" },
  { label: "hoodie $30 @ bobs-tshirts (apparel)", p: { user: "dinil", agent: "shopper-1", merchant: "bobs-tshirts", price: 30, now: Date.now() }, expect: "APPROVAL (>$25)" },
  { label: "GPU $500 @ pixel-pine (electronics)", p: { user: "dinil", agent: "shopper-1", merchant: "pixel-pine", price: 500, now: Date.now() }, expect: "DENIED (category not allowed)" },
];

for (const c of cases) {
  const rows = await cypher(AUTHORIZE, c.p);
  const verdict = rows.length === 0 ? "DENIED — no row" : rows[0].needs_approval ? "NEEDS APPROVAL" : "AUTHORIZED";
  console.log(`\n• ${c.label}\n    expected: ${c.expect}\n    got:      ${verdict}`, rows[0] ? JSON.stringify(rows[0]) : "");
}
console.log();
