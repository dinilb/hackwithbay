// Seed the Neo4j Mandate trust graph. Idempotent (wipes demo graph, re-seeds).
// Run: node --env-file=.env scripts/seed-graph.mjs
import { readFile } from "node:fs/promises";
import { cypher } from "./neo4j.mjs";

const catalog = JSON.parse(await readFile(new URL("../data/catalog.json", import.meta.url)));
const EXPIRY = Date.now() + 30 * 24 * 60 * 60 * 1000; // +30 days (epoch ms)

const CONSTRAINTS = [
  "CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE",
  "CREATE CONSTRAINT agent_id IF NOT EXISTS FOR (a:Agent) REQUIRE a.id IS UNIQUE",
  "CREATE CONSTRAINT mandate_id IF NOT EXISTS FOR (m:Mandate) REQUIRE m.id IS UNIQUE",
  "CREATE CONSTRAINT merchant_slug IF NOT EXISTS FOR (s:Merchant) REQUIRE s.slug IS UNIQUE",
  "CREATE CONSTRAINT category_name IF NOT EXISTS FOR (c:Category) REQUIRE c.name IS UNIQUE",
  "CREATE CONSTRAINT card_id IF NOT EXISTS FOR (k:Card) REQUIRE k.id IS UNIQUE",
  "CREATE CONSTRAINT order_id IF NOT EXISTS FOR (o:Order) REQUIRE o.id IS UNIQUE",
  "CREATE CONSTRAINT task_id IF NOT EXISTS FOR (t:Task) REQUIRE t.id IS UNIQUE",
];

async function main() {
  console.log("→ wiping existing graph");
  await cypher("MATCH (n) DETACH DELETE n");

  console.log("→ constraints");
  for (const c of CONSTRAINTS) await cypher(c);

  const categories = [...new Set(catalog.merchants.map((m) => m.category))];
  const merchants = catalog.merchants.map((m) => ({
    slug: m.slug, name: m.name, category: m.category, trusted: m.trusted, source: m.source,
  }));

  console.log("→ user + agent + categories");
  await cypher(
    `MERGE (u:User {id:'dinil'}) SET u.name='Dinil'
     MERGE (a:Agent {id:'shopper-1'}) SET a.name='Shopper Agent'
     WITH u, a
     UNWIND $categories AS cat MERGE (:Category {name:cat})`,
    { categories }
  );

  console.log("→ mandates + grants + allows (apparel, consumables)");
  await cypher(
    `MATCH (u:User {id:'dinil'}), (a:Agent {id:'shopper-1'})
     MERGE (m1:Mandate {id:'M1'})
       SET m1.budget_weekly=50, m1.per_txn_approval_over=25, m1.expiry=$expiry, m1.status='active', m1.label='Wardrobe'
     MERGE (m2:Mandate {id:'M2'})
       SET m2.budget_weekly=20, m2.per_txn_approval_over=25, m2.expiry=$expiry, m2.status='active', m2.label='Pantry'
     MERGE (u)-[:GRANTED]->(m1) MERGE (m1)-[:FOR]->(a)
     MERGE (u)-[:GRANTED]->(m2) MERGE (m2)-[:FOR]->(a)
     WITH m1, m2
     MATCH (ap:Category {name:'apparel'}), (co:Category {name:'consumables'})
     MERGE (m1)-[:ALLOWS]->(ap)
     MERGE (m2)-[:ALLOWS]->(co)`,
    { expiry: EXPIRY }
  );

  console.log("→ merchants + IN_CATEGORY");
  await cypher(
    `UNWIND $merchants AS mm
     MERGE (s:Merchant {slug:mm.slug})
       SET s.name=mm.name, s.trusted=mm.trusted, s.source=mm.source, s.category=mm.category
     WITH s, mm MATCH (c:Category {name:mm.category})
     MERGE (s)-[:IN_CATEGORY]->(c)`,
    { merchants }
  );

  const counts = await cypher(
    `MATCH (u:User) WITH count(u) AS users
     MATCH (m:Mandate) WITH users, count(m) AS mandates
     MATCH (s:Merchant) WITH users, mandates, count(s) AS merchants
     MATCH (c:Category) RETURN users, mandates, merchants, count(c) AS categories`
  );
  console.log("✓ seeded:", counts[0]);
}

main().catch((e) => { console.error("SEED FAILED:", e.message); process.exit(1); });
