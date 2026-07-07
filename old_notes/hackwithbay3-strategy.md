# HackwithBay 3.0 — Strategy & Notes

**Event Link:** https://luma.com/sv61aqlg?tk=9Gb1Jd

**Date:** July 7, 2026 | 9:30 AM – 5:30 PM
**Location:** AWS Builder Loft, 525 Market St, San Francisco, CA 94105 — **2nd floor**
**Theme:** "Building Graph-Aware Agentic Applications with Butterbase, Neo4j, and RocketRide Cloud"
**Duration:** 8 hours
**Organizers:** Devnovate, Aviral, AWS Builder Loft, Sahar Mor (Bond AI), Jugal Bhatt, .Agent Community, Butterbase Events, Mansi More, RocketRide, Joe Maionchi

---

## DAY-OF CRITICAL LOGISTICS

### Entry (action required before arriving)
1. **Complete AWS Portal registration:** http://events.builder.aws.com/d/hdz47p — MUST be done to access the building
2. **Bring valid physical ID** — required at the door
3. Head directly to the **2nd floor**

### Schedule
| Time | Event |
|------|-------|
| 9:30 AM | Doors open |
| 9:40 AM | Check-in opens |
| **9:55 AM** | **Arrival deadline — do not be late** |
| **10:15 AM** | **Workshop via Zoom** (join link in Discord/WhatsApp) |
| 9:30 AM – 5:30 PM | Full event window (per organizer blast — authoritative) |

> **Time discrepancy:** Luma event page lists end time as 18:30 (6:30 PM) in the header and 7:00 PM in the description. Organizer blast explicitly says 5:30 PM. Plan for 5:30 PM cutoff; treat anything after as a bonus buffer.

### Live communications
- **WhatsApp group** for live announcements: https://chat.whatsapp.com/GCgUI0Z469GJtyTrdq03o5?mode=gi_t
- **Discord** for Butterbase support: `#butterbase-support` channel

---

## Official Problem Statement

**Full theme:** Building Graph-Aware Agentic Applications with Butterbase, Neo4j, and RocketRide Cloud

> The next generation of AI applications isn't just conversational — it understands relationships. Agents that reason over connected data, run production-grade pipelines in the cloud, and ship with zero DevOps overhead.

### Mandatory Requirements (ALL THREE required — missing any = disqualification risk)

| Tool | What is required |
|------|-----------------|
| **Butterbase** | Build and deploy your product backend on Butterbase — **database, auth, and payment must all be in active use** |
| **Neo4j** | Model at least one core domain as a property graph; agent must **actively query or traverse it** (Cypher, graph algorithms, relationship-based retrieval) — not use it as a key-value store |
| **RocketRide Cloud** | Deploy your pipeline/workflow to RocketRide Cloud (not just local/Docker) so it runs as a **managed production endpoint** your app calls |

### Optional Bonus Tracks

| Tool | What earns the bonus |
|------|---------------------|
| **Daytona** | Give your agent a live sandbox to execute generated code, run tests, or perform multi-step build tasks autonomously |
| **Cognee** | Give your agent AI memory — remember, recall, optionally improve & forget — using Cognee Open Source |

### Judging Warning
> "Integrations that feel bolted on rather than load-bearing will be scored down." Deep integration into the core product experience is what wins.

---

## Submission Instructions

### How to submit (critical — do this before judging closes)

1. Connect to Butterbase before starting: sign up at https://dashboard.butterbase.ai
2. Promo code at billing: `ENJOY0707` (ALL CAPS)
3. **Final submission:** Paste this exact command into your AI agent:
   ```
   Submit my project to the hackathon. Submission code: ENJOY0707. Hackathon slug: HackwithBay-0707
   ```
4. Also prepare: repo link, project description (problem + graph model + integrations), working prototype

### What to submit
- Working prototype (live or local demo)
- Source code repository link
- Project description: problem, graph model built in Neo4j, how Butterbase and RocketRide Cloud are integrated
- Pitch deck/video (optional)

---

## Technology Primers

### Butterbase — Backend for AI Builders
AI-optimized Backend-as-a-Service: automates database provisioning, auth, APIs, and file storage. Includes an **AI model gateway** for unified access to GPT, Claude, and Gemini — no separate API keys or rate limits per provider.

### Neo4j — Native Graph Database
Stores data as nodes and relationships. Built-in graph algorithms: shortest path, centrality, community detection. Query with Cypher. Ideal for anything relational-at-heart: social graphs, org charts, fraud rings, recommendation engines, knowledge graphs, dependency trees, supply chains.

### RocketRide Cloud — Managed AI Pipeline Runtime
Open-source AI pipeline builder with C++ core, built visually in VS Code. Supports 13+ LLM providers, 8+ vector databases, multi-agent orchestration. Pipelines are portable JSON — build locally, one-click deploy to cloud.rocketride.ai. Gives you a shareable live endpoint for the demo.

### Daytona (Optional) — Sandboxes for Agents
Secure, stateful sandboxes — full composable computers with their own filesystem and kernel. Agent can install dependencies, write files, run/test code, and resume where it left off. Ideal when your agent needs to do something computational, not just talk about it.

### Cognee (Optional) — AI Memory for Agents
Capture context and/or upload documents; Cognee turns it into an AI Brain accessible from agents, apps, and users across multiple sessions. Use Cognee Open Source for this hackathon. Configures with Neo4j: https://github.com/topoteretes/cognee#step-1-install-cognee

---

## Suggested Problem Tracks

| Track | Problem | Solution Summary |
|-------|---------|-----------------|
| 1. Codebase Knowledge Graph Agent | Engineers can't see how a change ripples through a large codebase | Neo4j: files/functions/dependencies as graph. RocketRide: static-analysis pipeline. Butterbase: user sessions + query history. Daytona: sandbox to run/verify refactors |
| 2. Fraud & Anomaly Ring Detector | Fraud rings hide inside transactions that look fine in isolation | Neo4j: accounts/devices/transactions graph + community detection. RocketRide: streaming scoring pipeline. Butterbase: case management + auth |
| 3. Personalized Learning Path Agent | Students get generic courses that ignore what they know | Neo4j: knowledge graph of concepts + prerequisites. RocketRide: adaptive-questioning pipeline. Butterbase: learner progress + profiles. Daytona: sandbox for auto-graded coding exercises |
| 4. Enterprise Org & Expertise Finder | "Who knows about X?" gets lost across large orgs | Neo4j: people/teams/projects/skills graph. RocketRide: ingestion pipeline over docs/Slack/tickets. Butterbase: auth + profiles + search backend |
| 5. Supply Chain Risk Navigator | Single supplier failure can cascade invisibly | Neo4j: multi-tier supplier graph + centrality. RocketRide: risk-scoring pipeline. Butterbase: dashboards + alerting |
| 6. Research Citation & Idea Explorer | Researchers lose track of how papers and ideas connect | Neo4j: citation + co-authorship graph. RocketRide: summarization pipeline. Butterbase: saved collections + notes. Daytona: sandbox to reproduce experiments |
| 7. Recommendation Engine with Reasoning | Black-box recommendations users don't trust | Neo4j: product/user/interaction graph for explainable path-based recs. RocketRide: embedding pipeline. Butterbase: catalog + AI gateway |
| 8. Autonomous Incident Responder | On-call engineers manually piece together root cause | Neo4j: service dependency graph. RocketRide: anomaly-detection pipeline. Butterbase: incident history. Daytona: sandbox to reproduce + test a fix |
| 9. Compliance & Contract Relationship Mapper | Legal teams can't see how clauses and obligations interconnect | Neo4j: clauses/parties/obligations graph. RocketRide: document ingestion pipeline. Butterbase: secure storage + review workflow |
| 10. Open Innovation | Any problem where relationships matter more than rows | Any domain — bring your own idea |

---

## Winning Project Concept: "KnowledgeLoop" — A Self-Improving Productivity Agent

A productivity agent that ingests a user's tools (emails, docs, tasks) into a Neo4j knowledge graph, reasons over relationships, executes subtasks in Daytona sandboxes (bonus), uses Cognee for persistent memory (bonus), and continuously improves its own task graph.

**Why this wins:**
- Theme alignment: directly addresses "Thoughtful Agents for Productivity" + graph-aware agents
- All 3 mandatory tools deeply integrated (not bolted on)
- Both bonus tracks covered (Daytona + Cognee) = potential bonus prizes on top of main prize
- Butterbase AI gateway replaces need for separate Nebius/OpenAI keys
- RocketRide Cloud deployment = shareable live link for judges, no localhost screen-sharing

---

## Technical Architecture

```
User Input / Data Sources
         ↓
  [Butterbase AI Gateway]    ← Unified LLM access (GPT, Claude, Gemini) — no separate API keys
  [Butterbase Auth/DB]       ← User sessions, query history, app data
         ↓
  [Neo4j Knowledge Graph]    ← Nodes: Task, Person, Document, Deadline, Project
         ↓                       Cypher queries + graph algorithms for relationship traversal
  [Agent Reasoning Layer]    ← RocketRide pipeline (multi-agent workflow)
         ↓
  [Cognee AI Memory]         ← Cross-session memory (optional bonus)
         ↓
  [Daytona Sandboxes]        ← Safe code/tool execution for agent actions (optional bonus)
         ↓
  [RocketRide Cloud]         ← Managed production endpoint; shareable live link for demo
         ↓
  [Butterbase Storage/API]   ← Result persistence + frontend layer
```

---

## 8-Hour Time Plan (5:30 PM hard cutoff)

### Hour 1 (9:30–10:30) — Setup (do this before building anything)
- Complete AWS building entry: http://events.builder.aws.com/d/hdz47p
- **Butterbase first:** sign up at dashboard.butterbase.ai, redeem `ENJOY0707`, provision DB + auth + AI gateway
- **Join 10:15 AM Workshop** via Zoom
- Bootstrap Neo4j Aura free tier — sketch graph schema before writing code
- Get RocketRide VS Code extension installed; log in to cloud.rocketride.ai (get credits from Discord)
- Daytona + Cognee accounts if using bonus tracks

### Hour 2 (10:30–11:30) — Graph Model + Data Pipeline
- Define Neo4j schema: node types (`Task`, `Person`, `Document`, `Deadline`, `Project`)
- Ingest sample data into Neo4j
- Write Cypher queries for relationship traversal
- Verify graph is query-able and returns meaningful relationships

### Hour 3 (11:30–12:30) — RocketRide Pipeline (build locally first)
- Build AI pipeline in RocketRide VS Code extension
- Wire pipeline to Neo4j (graph retrieval tool) and Butterbase AI gateway (LLM calls)
- Test pipeline end-to-end locally before deploying to cloud

### Hour 4 (12:30–1:30) — RocketRide Cloud Deployment (+ lunch)
- Deploy pipeline to cloud.rocketride.ai — mandatory, local-only does not satisfy requirement
- Confirm you have a live production endpoint URL
- Daytona integration if on bonus track: route agent code execution through sandboxes

### Hour 5 (1:30–2:30) — Butterbase Deep Integration
- Ensure database, auth, AND payment/billing are all in active use
- Butterbase AI gateway handling all LLM calls (not a separate provider)
- Cognee integration if on bonus track: configure with Neo4j for cross-session memory

### Hour 6 (2:30–3:30) — Polish Core Experience
- Verify all 3 mandatory integrations feel load-bearing (not bolted on)
- Write the project description: problem + graph model + how integrations work
- Record 60-second demo video as backup

### Hour 7 (3:30–4:30) — Demo Prep
- Stress test the golden path end-to-end
- Confirm RocketRide Cloud endpoint is live and accessible
- Prepare pitch: problem → graph model → mandatory integrations → bonus features → impact
- Have submission command ready

### Hour 8 (4:30–5:30) — Submit + Demo
- **Submit:** paste into AI agent: `Submit my project to the hackathon. Submission code: ENJOY0707. Hackathon slug: HackwithBay-0707`
- Lead with live RocketRide endpoint — no localhost screen-sharing
- Name each mandatory integration explicitly during demo
- Make Butterbase visible on screen

---

## Pitch Script (90 seconds)

> "Knowledge workers spend 40% of their day searching for context. KnowledgeLoop is a productivity agent that builds a live knowledge graph of your work — using **Neo4j** to store relationships between tasks, people, and docs with Cypher-powered traversal. When you ask it a question, it doesn't scan rows — it traverses the graph to surface connected context. All LLM calls run through the **Butterbase AI gateway**, with your user data and sessions backed by Butterbase auth and storage. The entire pipeline is deployed on **RocketRide Cloud** — a managed production endpoint, not localhost — so you can try it live right now at this link. Agents that need to act — write a script, run a test — get their own **Daytona** sandbox. And every session is remembered via **Cognee** AI memory. The agent doesn't just answer — it learns."

---

## Judging Strategy

| Likely Criterion | How to Score |
|---|---|
| Theme alignment | Graph-aware agent + Productivity = direct match |
| Mandatory tool depth | All 3 deeply woven in — not bolted on |
| Neo4j graph model | Non-trivial Cypher + graph algorithms (not key-value) |
| Production deployment | RocketRide Cloud live endpoint (not local) |
| Butterbase completeness | DB + auth + payment all active |
| Demo quality | Live shareable link + graph traversal visualization |
| Bonus tracks | Daytona + Cognee = extra prize eligibility |

---

## Setup Checklist (do in order)

- [ ] Complete AWS Portal entry: http://events.builder.aws.com/d/hdz47p (before arriving)
- [ ] Bring valid physical ID
- [ ] Arrive by 9:55 AM — go to 2nd floor
- [ ] Join WhatsApp for live updates: https://chat.whatsapp.com/GCgUI0Z469GJtyTrdq03o5?mode=gi_t
- [ ] **Butterbase:** sign up at dashboard.butterbase.ai → redeem `ENJOY0707` in billing → provision DB + auth + AI gateway
- [ ] **Neo4j:** spin up Aura free tier → sketch graph schema before writing pipeline code
- [ ] **RocketRide:** install VS Code extension → build pipeline locally → deploy to cloud.rocketride.ai (get credits from Discord rep on-site or https://discord.com/invite/PMXrtenMsY)
- [ ] Join 10:15 AM Workshop via Zoom
- [ ] (Optional) Daytona: sign up for sandbox access if agent needs to execute/test code
- [ ] (Optional) Cognee: install open source, configure with Neo4j per https://github.com/topoteretes/cognee#step-1-install-cognee

## Key Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Butterbase "payment in active use" unclear | Clarify with their rep at 10:15 AM workshop or in Discord `#butterbase-support` |
| RocketRide Cloud deployment fails | Build pipeline locally first, test fully, then deploy — don't skip local testing |
| Neo4j graph feels like key-value store | Must have Cypher traversal + at least one relationship query — document this in pitch |
| Submission command fails | Test the Butterbase MCP connection in Hour 1; ask `#butterbase-support` if issues |
| Building entry blocked | Complete http://events.builder.aws.com/d/hdz47p before arriving; bring physical ID |
| Opsera/Nebius less relevant | Neither is in the official problem statement — deprioritize unless time permits |
| Demo breaks at judging | Have RocketRide live link + recorded 60s backup video |
