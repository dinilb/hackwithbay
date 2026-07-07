# Recall — the memory layer for your company's inbox

**HackwithBay 3.0 · July 7, 2026 · Due 4:30 PM**

## One-liner
Recall is an AI agent that reads a company's inbound email — bug reports, feature requests, customer threads, sales pitches, press requests — and builds a living knowledge graph of the business in Neo4j: customers, people, bugs, promises, deadlines, deals. Then it does what stateless email tools can't: clusters duplicate bugs, weighs feature requests by revenue, catches promises you're about to break, flags churn before it happens, and tells you which strangers are worth your time.

## The thesis
Every email tool demoed today summarizes one message and forgets it. But a company's inbox isn't a list of messages — it's a **stream of updates to a world model**: this bug is the same one two other customers hit; this "quick question" is from the account renewing in 8 days; this feature request is the fourth this month, and three came from your top-revenue tier. Recall treats each email as a belief update to a graph, and the graph — not the text — is what it reasons over. Email is the first input; the same memory layer later ingests Slack, tickets, and CRM, and any AI agent can plug into it.

## The demo world
A fictional 4-person SaaS startup, **Driftlane** (checkout & webhook infrastructure). Its founder inbox contains ~35 scripted emails across the arcs below — plus live-injected emails during the demo. Everything the agent does with them (research, traversal, clustering, drafting) is real.

## What it does (the five sentences)
1. Reads your company's inbound email and builds a living knowledge graph of the business — customers, people, companies, bugs, feature requests, commitments, renewals — stored in Neo4j.
2. It doesn't summarize-and-forget: every email updates memory — this report is the *same bug* as two others, this promise is now *overdue*, this sender's account renews in *8 days*.
3. When a stranger emails, it researches them live, attaches a dossier to the graph, and verdicts whether they're worth your time — cold SEO spam scores low; the journalist who covers your space scores high.
4. It acts on the graph: drafts replies that cite your own promises, raises churn-critical alerts, and answers "what should we build next?" by traversing revenue-weighted request clusters — not by searching text.
5. Email is the bootstrap: the graph is designed to become your company's memory layer that any agent can query.

## Flagship examples (all in the demo corpus)

**1. The churn-critical chain (hero moment — live injected).**
Acme's CTO escalates: *"Webhooks are STILL failing — this is blocking ~$40k/day of orders. We're evaluating alternatives."* A summarizer says: "angry customer email." Recall traverses: this is the **same bug** three customers reported this week → you **promised Acme a fix by July 3** (overdue 4 days) → Acme's **renewal is July 15** → Acme is your **#1 account ($4.2k MRR)**. One red card: **"Churn-critical: reply in the next hour"** — with a drafted response that owns the missed promise, quotes it exactly, and gives a status. Four hops, four different threads, impossible without the graph.

**2. Bug clustering (entity resolution on autopilot).**
Three customers describe the same webhook timeout in completely different words. Recall resolves them into **one Bug node with three REPORTS edges** — the graph shows one problem, not three tickets. "What's actually broken?" becomes a one-hop query.

**3. Revenue-weighted roadmap.**
"What should we build next?" → traversal clusters four feature-request emails into "Slack alerts," sums the MRR of the requesting accounts, and answers: *"Slack alerts — requested by 3 accounts worth $6.1k MRR, including one renewing this month."* Product prioritization as a Cypher query.

**4. The stranger verdict (live injected).**
A cold email arrives from a founder at a real YC startup pitching a dev tool. Recall researches them live — YC directory, their site — sprouts a dossier subgraph, cross-references memory, and verdicts: *"Worth a reply: W26, building agent infra, overlaps your webhook roadmap."* Meanwhile yesterday's SEO-agency pitch sits at score 12/100: *"template outbound, no mutual context."*

**5. Broken-promise radar.**
"What did we promise and miss?" → every commitment extracted from sent replies ("we'll ship retry logic by July 3") is a node with a due date and status; overdue ones glow. Companies break their own promises silently — Recall doesn't let you.

**6. The account wiki (stretch).**
Click Acme's node → an auto-written account page from its graph neighborhood: health, open bugs, promises made, renewal date, key contacts, full history. The graph rendered as an encyclopedia of your business.

## Demo script (~2 min)
1. **Assemble (25s):** "Process inbox" → 35 emails stream through the RocketRide Cloud pipeline; the Driftlane world-graph builds itself live; sales spam visibly classified and parked.
2. **Cluster + roadmap (25s):** three bug reports collapse into one node; ask "what should we build next?" → revenue-weighted answer with the path highlighted.
3. **Hero beat (35s):** inject the Acme CTO escalation → traversal animates across 4 hops → churn-critical card + drafted reply quoting the July 3 promise. Punchline: *"Every email tool you saw today summarizes. Summaries forget. Recall remembers."*
4. **Stranger beat (20s):** inject the YC founder cold email → live research → dossier sprouts → verdict card.
5. **Close (15s):** ask "what did we promise and miss?" → overdue promises glow. Stack callout: Neo4j traversal (every answer is a path), RocketRide Cloud managed pipeline, Butterbase auth + DB + AI gateway + billing.

## Why this wins the judging sheet
- **Neo4j (PM is a judge):** entity resolution (bug clustering), 4-hop cross-thread reasoning, revenue-weighted traversal, temporal promise tracking — the graph is the product, nothing key-value. It's their "agent memory / GraphRAG" story on data every judge understands.
- **Butterbase:** auth, Postgres (email log, memory feed, action queue, dossiers), AI gateway for every LLM call, billing (Free: 1 inbox, 100 emails / Pro: unlimited + auto-research + account wikis) — all enforced in code, all visible. Partner prize: $200.
- **RocketRide Cloud:** classify → fetch-context → extract → research → graph-update → decide, deployed as the managed endpoint every email flows through.
- **Theme fit:** "Thoughtful Agents for Productivity" — a chief of staff for the founder inbox.
- **Novel in the room:** presenter-coached teams will demo stateless email summaries; they're the foil. Nobody else will show cross-email reasoning.
- **Market story for the hiring judges:** support/inbox intelligence is a real category (Front, Plain, Pylon) and agent memory is YC-thesis territory — Recall's graph memory is the differentiated wedge into both.

## What it does NOT do today (scope shield)
- No live email provider connector (corpus + inject; Gmail/Outlook OAuth is roadmap).
- No mass outreach. Nothing auto-sends — the agent drafts, the human approves.
- Slack/tickets/CRM ingestion: roadmap slide, one line.
