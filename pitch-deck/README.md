# Mercato Pitch Deck

7-slide browser presentation. Follows `design.md` — paper/ink palette, mono labels, color = state only, blueprint grid, terminal voice.

## Open

```bash
open pitch-deck/index.html
```

**→** / **Space** = next · **←** = back · **⌘⌃F** = fullscreen

## Slides

| # | Title | Content |
|---|---|---|
| 1 | Title | Mercato — one database, pay once |
| 2 | Problem | Scattered commerce data |
| 3 | Vision | Find → compare 4 dealers → buy → confirm |
| 4 | What we built | Catalog + agent checkout |
| 5 | Demo | Animated mockup (search feed, index graph, 4 dealer cards, confirmation) |
| 6 | Surfaces | MCP tools + web dashboard |
| 7 | **Stack** | Architecture flow + detailed Butterbase / Neo4j / RocketRide cards |

## Presenting slide 7

Walk left-to-right on the architecture bar, then read each stack card:

1. **Butterbase** — "The catalog and checkout live here. Postgres holds products, suppliers, offers. Functions handle search and orders. Auth, billing, AI gateway, deployed frontend."
2. **Neo4j** — "Memory and relationships, not rows. It stores your preferences, the agents' memory across sessions, and supplier information as a graph — who fulfills for whom, reliability propagation — so ranking gets personal and gets smarter over time."
3. **RocketRide** — "The AI agents that handle shopping and purchases run on RocketRide — search, rank, narrate, order — as managed agents the app calls in production, reading and writing memory in Neo4j."

Close: *"One database + pay once."*

## Tips

- Slides 1–4 + 6: ~90 seconds before live demo
- Slide 5: backup if live demo fails (replays on revisit)
- Slide 7: use after live demo or as technical deep-dive for judges
