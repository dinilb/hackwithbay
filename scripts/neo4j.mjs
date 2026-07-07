// Minimal Neo4j HTTP Query API v2 client. Run scripts with: node --env-file=.env scripts/<x>.mjs
const URI = process.env.NEO4J_URI || "neo4j+s://9d7c9060.databases.neo4j.io";
const USER = process.env.NEO4J_USERNAME || "neo4j";
const PASS = process.env.NEO4J_PASSWORD;
const DB = process.env.NEO4J_DATABASE || "neo4j";

const host = URI.replace(/^neo4j\+s:\/\//, "").replace(/^neo4j:\/\//, "").replace(/^https?:\/\//, "");
const ENDPOINT = `https://${host}/db/${DB}/query/v2`;
const AUTH = "Basic " + Buffer.from(`${USER}:${PASS}`).toString("base64");

export async function cypher(statement, parameters = {}) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: AUTH },
    body: JSON.stringify({ statement, parameters }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.errors) {
    throw new Error(`Cypher failed [${res.status}]: ${JSON.stringify(json.errors || json)}\n  ${statement.slice(0, 120)}`);
  }
  const { fields = [], values = [] } = json.data || {};
  return values.map((row) => Object.fromEntries(fields.map((f, i) => [f, row[i]])));
}

export async function run(statements) {
  for (const [stmt, params] of statements) await cypher(stmt, params);
}
