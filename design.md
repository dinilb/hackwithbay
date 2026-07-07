# Bazaar — Design System

> **Codename:** `Bazaar Terminal`
> **Owner:** Design (Chief Designer)
> **Status:** v0.1 — Foundation locked, components in progress
> **Applies to:** the Bazaar marketplace dashboard, the 5 storefronts, and every Mandate surface (graph, cards, approvals, receipts).

---

## 0. What this document is

This is the single source of truth for how Bazaar looks, feels, and reads. It's organized into the four pillars every mature design system uses:

1. **Foundations** — the visual language (tokens: color, type, space, motion, texture).
2. **Components** — the building blocks (buttons, cards, the graph, the virtual card, the feed…).
3. **Patterns** — how components combine to solve product problems (the dashboard, the authorize→mint flow).
4. **Governance** — voice, accessibility, contribution, changelog.

Read the **Principles** and **Foundations** first — they decide everything downstream.

---

## 1. Design principles

Bazaar is *"Amazon for AI agents"* and **Mandate** is its trust-graph checkout. The product moves money on behalf of autonomous agents and proves *why* every charge happened. The design must earn the trust that implies. It should read as **financial-grade infrastructure drawn by an engineer** — not a chatbot, not a toy.

### 1.1 The North Star: "Terminal, not toy"
Think Swiss editorial poster × engineering blueprint × Bloomberg terminal. Big confident type, hairline structure, monospace data, and **color that only ever means something.**

### 1.2 The five rules

1. **Anti-AI-cliché, on purpose.** No purple/cyan gradients, no glassmorphism, no glowing orbs, no `✨`, no "everything is a rounded pill." Those signals now read as generic AI slop and *undermine* a trust product. We go the opposite way: paper, ink, grid, mono.
2. **Color = state, never decoration.** The interface is monochrome. The only chromatic color in the entire app is **signal color** that maps 1:1 to Mandate semantics — <span style="color:#15803D">**green = authorized/minted**</span>, <span style="color:#DC2626">**red = denied**</span>, <span style="color:#D97706">**amber = needs approval**</span>. If a pixel is colored, a judge should be able to say what it means.
3. **The graph is the brand.** The Neo4j trust graph is the hero object *and* the background texture. Marketing "particles" and the live graph are the same visual language — nodes, hairline edges, animated paths.
4. **Machine voice.** The agent narrates like a system log, not a friendly assistant. `SEARCHING 5 STORES · 3 CANDIDATES · AUTHORIZING · BLOCKED — NEEDS APPROVAL`. Precision beats personality.
5. **Structure over shadow.** Depth comes from borders, background steps, and whitespace — not drop shadows or blur. Sharp corners on structure signal engineering rigor.

### 1.3 Adjectives (the vibe in words)
Precise · editorial · technical · confident · quiet · auditable · fast.
**Not:** playful · glossy · dreamy · magical · gradient-y.

---

## 2. Foundations

Tokens follow a **three-tier architecture**: **primitive** (raw values) → **semantic** (intent) → **component** (per-element overrides). Only ever reference *semantic* tokens in product code; primitives are the palette, semantics are the API.

### 2.1 Color

#### Base theme: **Light "Paper"**
Warm bone background, near-black warm ink. This is the default and the one that most separates us from the AI-app crowd. (A dark `Terminal` mode is specified in §2.8 as a future/optional theme; token names stay identical so it's a swap, not a rewrite.)

#### Primitive tokens

**Paper (backgrounds / surfaces)**
| Token | Hex | Use |
|---|---|---|
| `paper-0` | `#FAF9F5` | Raised surfaces, cards |
| `paper-50` | `#F5F4EF` | **App background (default)** |
| `paper-100` | `#EDECE4` | Sunken areas, hover fills |
| `paper-200` | `#E2E0D6` | Pressed / active fills |

**Ink (text / lines / nodes)** — warm neutrals, never pure blue-black.
| Token | Hex | Use |
|---|---|---|
| `ink-900` | `#0A0A0A` | Primary text, display type, graph nodes |
| `ink-800` | `#1A1A18` | Headings on paper |
| `ink-700` | `#3A3A36` | Secondary text |
| `ink-500` | `#6B6A62` | Muted text, captions |
| `ink-400` | `#8A8981` | Mono labels, disabled text |
| `ink-300` | `#B8B7B0` | Hairline borders (default) |
| `ink-200` | `#D4D3CB` | Subtle borders, grid major lines |

**Signal — Green (AUTHORIZED / MINTED / paid)**
| Token | Hex |
|---|---|
| `green-600` | `#15803D` |
| `green-500` | `#22C55E` |
| `green-100` | `#DCFCE7` |

**Signal — Red (DENIED / void / error)**
| Token | Hex |
|---|---|
| `red-600` | `#DC2626` |
| `red-500` | `#EF4444` |
| `red-100` | `#FEE2E2` |

**Signal — Amber (PENDING APPROVAL / warning)**
| Token | Hex |
|---|---|
| `amber-600` | `#D97706` |
| `amber-500` | `#F59E0B` |
| `amber-100` | `#FEF3C7` |

#### Semantic tokens (reference these in code)
| Semantic | → Primitive | Meaning |
|---|---|---|
| `color-bg` | `paper-50` | Page background |
| `color-surface` | `paper-0` | Cards, panels |
| `color-surface-sunken` | `paper-100` | Wells, feed background |
| `color-border` | `ink-300` | Default hairline |
| `color-border-strong` | `ink-800` | Emphasis border (active card) |
| `color-text` | `ink-900` | Body/primary text |
| `color-text-muted` | `ink-500` | Secondary text |
| `color-text-label` | `ink-400` | Mono micro-labels |
| `color-authorized` | `green-600` | Authorized path, minted card, "paid" |
| `color-authorized-bright` | `green-500` | Animated stroke / live pulse |
| `color-denied` | `red-600` | Denied edge, void state |
| `color-pending` | `amber-600` | Approval pending, awaiting human |
| `color-focus` | `ink-900` | Focus ring (2px, 2px offset) |

#### State → color contract (memorize this)
| Product state | Color | Where it appears |
|---|---|---|
| Auto-approved / authorized | `color-authorized` | Graph path draws green; feed line green tick |
| Card minted / active | `color-authorized` | VirtualCard border + `ACTIVE` chip |
| Card spent | `ink-400` (grays out) | Card desaturates; `SPENT` stamp in `ink-900` |
| Needs approval | `color-pending` | ApprovalCard border; graph node ringed amber |
| Denied | `color-denied` | Failing edge flashes red; feed line red |

> **Contrast:** `ink-900` on `paper-50` ≈ 18:1 (AAA). Signal colors are used for **strokes, large labels, chips, and borders** — when signal color carries text meaning, pair it with a word/icon (never color alone — see §7.2). Body text is always `ink`.

### 2.2 Typography

Three families, all free and web-ready. This layered type system — **oversized grotesk display + tracked-out mono labels** — is the single biggest reason the app reads "technical" instead of "AI."

| Role | Family | Source | Fallback |
|---|---|---|---|
| Display | **Clash Display** | Fontshare | `"Inter", system-ui, sans-serif` |
| Text / UI | **General Sans** | Fontshare | `system-ui, sans-serif` |
| Mono / data / labels | **Geist Mono** | Vercel / npm | `"JetBrains Mono", ui-monospace, monospace` |

#### Type scale (composite tokens — bundle size + line-height + weight + tracking)
| Token | Size | Line | Weight | Tracking | Family | Use |
|---|---|---|---|---|---|---|
| `display-hero` | `clamp(3.5rem, 9vw, 8rem)` | `0.95` | 600 | `-0.02em` | Display | Landing headline ("commerce for agents") |
| `display-1` | `3.5rem` / 56px | `1.0` | 600 | `-0.02em` | Display | Section heroes |
| `heading-1` | `2.25rem` / 36px | `1.1` | 600 | `-0.01em` | Display | Page titles |
| `heading-2` | `1.5rem` / 24px | `1.15` | 550 | `-0.01em` | Text | Panel titles |
| `heading-3` | `1.125rem` / 18px | `1.2` | 550 | `0` | Text | Card titles |
| `body-lg` | `1.125rem` / 18px | `1.5` | 400 | `0` | Text | Lead paragraphs |
| `body` | `1rem` / 16px | `1.5` | 400 | `0` | Text | Default body |
| `body-sm` | `0.875rem` / 14px | `1.45` | 400 | `0` | Text | Secondary |
| `data` | `0.8125rem` / 13px | `1.4` | 450 | `0` | **Mono** | Prices, IDs, card digits, feed |
| `label` | `0.6875rem` / 11px | `1` | 500 | `0.12em` | **Mono** | UPPERCASE micro-labels, tags, stat captions |

**Rules**
- **Numbers are always mono + tabular** (`font-variant-numeric: tabular-nums`). Prices, budgets, caps, last-4, timestamps — everything financial aligns in columns.
- `label` is always UPPERCASE, tracked out. It's the "engineering annotation" from the reference (`THROUGHPUT INCREASE / LINEAR`).
- Display is used **sparingly and huge** — one hero moment per screen. Don't scatter big type.
- Never use display font below 18px; never use body font for data readouts.

### 2.3 Spacing & layout

**4px base grid.** Reference semantic space, not raw pixels.
| Token | px | | Token | px |
|---|---|---|---|---|
| `space-0` | 0 | | `space-6` | 24 |
| `space-1` | 4 | | `space-8` | 32 |
| `space-2` | 8 | | `space-10` | 40 |
| `space-3` | 12 | | `space-12` | 48 |
| `space-4` | 16 | | `space-16` | 64 |
| `space-5` | 20 | | `space-24` | 96 |

**Grid & containers**
- 12-column grid, 24px gutters.
- `container-max`: 1440px; content max for reading: 720px.
- Page margins: 24px (mobile) → 48px (desktop).

**Breakpoints**
| Name | Min width |
|---|---|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1440px |

The main dashboard is a **desktop-first 3-column layout** (§6.1); below `lg` it stacks.

### 2.4 Radius, borders, elevation

**Radius** — deliberate tension: **structure is sharp, actions are pills.**
| Token | Value | Use |
|---|---|---|
| `radius-none` | `0` | **Panels, cards, the graph frame, storefront cards** (engineering feel) |
| `radius-sm` | `2px` | Inputs, tags, chips |
| `radius-md` | `6px` | The VirtualCard, media |
| `radius-full` | `9999px` | **CTA buttons only**, status dots, avatars |

**Borders** — the primary way we build structure.
- Default hairline: `1px solid color-border` (`ink-300`).
- Emphasis: `1px solid color-border-strong` (`ink-800`) for the active/focused panel.
- State borders: `1.5px` in the relevant signal color.

**Elevation** — mostly flat. Depth = borders + `paper` steps. Shadows are rare.
| Token | Value | Use |
|---|---|---|
| `shadow-none` | none | Everything by default |
| `shadow-overlay` | `0 8px 24px rgba(10,10,10,0.10)` | Modals, popovers **only** |

> No blur, no glow, no glassmorphism. If it needs to "float," give it a border and a `paper-0` fill.

### 2.5 Texture & motifs

These are what make it feel *built*, not generated. Cheap to implement, high payoff.

- **Blueprint grid:** full-bleed background grid. Minor lines 8px, major lines 80px, drawn in `ink-200` at ~4% opacity. Sits behind everything.
- **Crop / registration marks:** small L-shaped ticks at the corners of hero panels and the graph frame (engineering-drawing device).
- **Mono coordinate chips:** tiny `label`-style tags annotating regions (`GRAPH · TRUST LAYER`, `FEED · shopper-1`).
- **Particle constellation:** the marketing background swirl is the *same node/edge language* as the live graph — dotted nodes, faint hairline links. Ties brand texture to the real product.
- **Hairline dividers** between list rows and sections — never heavy rules.

### 2.6 Motion

Restrained and **data-driven**. Motion explains state changes; it never decorates.

**Duration tokens**
| Token | ms | Use |
|---|---|---|
| `dur-instant` | 0 | Reduced-motion / immediate |
| `dur-fast` | 120 | Hover, press, tag toggles |
| `dur-base` | 200 | Panel/state transitions |
| `dur-slow` | 320 | Card mint reveal, modal |
| `dur-draw` | 700 | **Graph path draw-on** |

**Easing tokens**
| Token | Curve | Use |
|---|---|---|
| `ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Most transitions |
| `ease-entrance` | `cubic-bezier(0, 0, 0, 1)` | Elements entering |
| `ease-exit` | `cubic-bezier(0.3, 0, 1, 1)` | Elements leaving |
| `ease-mechanical` | `linear` | Terminal type-on, ticking numbers |

**Signature motions**
- **Path draw:** on authorize, the winning path strokes on in `color-authorized-bright` over `dur-draw`, then settles to `color-authorized`.
- **Denial flash:** failing edge blinks `color-denied` twice (`dur-fast` ×2) then fades to a dashed red.
- **Card mint:** VirtualCard scales in from 98%→100% + fades over `dur-slow`; digits type on with `ease-mechanical`.
- **Status stamp:** `SPENT` stamps over the card (scale 108%→100%, `dur-fast`), card desaturates to `ink`.
- **Number tick:** stat/budget numbers count up with `ease-mechanical`.

> **Reduced motion:** honor `prefers-reduced-motion`. Disable path-draw, particles, stamp, and tick — swap to instant opacity changes. State must remain fully legible without motion.

### 2.7 Iconography

- **Lucide** line icons, `1.5px` stroke, on a 20/24px grid, colored `ink` (state icons take signal color).
- Semantic use only; decorative icons are avoided.
- **Emoji is reserved exclusively for product art in storefronts** (per product spec) — never in UI chrome. This keeps the UI serious while product listings stay lively and zero-cost.

### 2.8 Optional dark "Terminal" mode (future)

Same token *names*, swapped values via `[data-theme="terminal"]`: `color-bg → #0B0B0C`, `color-surface → #141414`, `color-text → #EDEBE3`, borders → `#2A2A28`. Signal colors shift one step brighter (`green-500`, `red-500`, `amber-500`) and graph edges gain a subtle outer stroke to read as "glow" without bloom. Reads as a trading desk at night. **Not in scope for v0.1** — documented so nothing we build blocks it.

---

## 3. Component: Buttons

**Purpose:** trigger an action. One primary action per view.

**Variants**
- **Primary** — `radius-full`, `ink-900` fill, `paper-0` text, optional trailing arrow. (The Optimus "Start free trial" pill.)
- **Secondary** — `radius-full`, transparent fill, `1px ink-300` border, `ink-900` text.
- **Ghost** — no border, `ink-700` text, hover fill `paper-100`.
- **Signal** — for decisive actions: `Approve` = green fill, `Deny` = red outline. Used only in ApprovalCard.

**Sizes:** `sm` (h32, `body-sm`), `md` (h40, `body`), `lg` (h48, `body-lg`).

**Anatomy:** `[ optional icon ][ label ][ optional trailing arrow ]`, padding `space-5` x / `space-3` y.

**States:** default → hover (fill/opacity shift, `dur-fast`) → active (`paper-200` / scale 0.98) → focus (`2px color-focus` ring, `2px` offset) → disabled (`ink-400` text, no fill, `not-allowed`) → loading (mono `…` or spinner, label stays).

**Do / Don't**
- ✅ One primary pill per screen; verbs in the label (`Approve`, `Buy`, `Start`).
- ❌ Don't stack multiple filled primaries. ❌ Don't put pills on structural panels — pills are for actions only.

---

## 4. Component: Panel / Card

**Purpose:** group related content. The base container for the whole app.

**Anatomy:** `radius-none`, `color-surface` fill, `1px color-border`, header row (`label` eyebrow + `heading-3` title + optional corner crop marks), body, optional hairline-divided footer. Padding `space-6`.

**States:** default → active (border → `color-border-strong`) → state-flagged (`1.5px` signal border when the panel represents a pending/denied/authorized thing).

**Do / Don't**
- ✅ Sharp corners, hairline borders, generous padding, one eyebrow label.
- ❌ No drop shadows, no rounded corners, no gradient fills.

---

## 5. Signature components (the product's face)

### 5.1 GraphCanvas — the hero
The live Neo4j trust graph on `color-bg`. This is where the demo lands.

- **Nodes:** `ink-900` filled circles; label in `label` mono beneath. Users/Agents/Mandates/Merchants differentiated by size + a mono type-tag, not color.
- **Edges:** `1px ink-300` hairlines at rest.
- **Garden merchants:** clustered tightly, connected by hairlines to their category → mandate.
- **Untrusted / web merchants:** rendered **outside** the cluster, `ink-400` **dashed** stroke — visibly "not in the garden."
- **Authorize:** winning path draws on in `color-authorized-bright` → settles `color-authorized` (`dur-draw`). Nodes on the path get a thin green ring.
- **Deny:** the failing edge flashes `color-denied` and stays dashed-red; a mono callout names the reason (`CATEGORY NOT IN MANDATE`).
- **Cards:** appear as small nodes; **gray to `ink-300`** when spent.
- **Provenance:** clicking a receipt highlights its full path (user→task→agent→mandate→card→order) in `color-authorized`, dims everything else to 15% opacity.
- Frame the canvas with crop marks + a `GRAPH · TRUST LAYER` coordinate chip.

### 5.2 VirtualCard — spec sheet, not a skeuomorph
Renders a minted single-use card as an **engineering spec card**, not a glossy credit card.

- `radius-md`, `paper-0`, `1.5px color-authorized` border when active.
- Wordmark: `MANDATE · TEST` (`label`). Big mono `data` PAN with only last-4 emphasized (`•••• 7391`).
- Fields printed as labeled rows: `CAP $30.00` · `LOCK bobs-tshirts` · `EXP +30:00`.
- Status chip: `ACTIVE` (green) → on spend, a `SPENT` stamp strikes across at ~8° and the whole card desaturates to `ink`. `VOID` (red) on expiry.
- Always visibly test-mode.

### 5.3 AgentFeed — system log
The agent's narration. **A terminal, not a chat.**

- `color-surface-sunken` well, mono `data` text, hairline-divided rows.
- Each row: `HH:MM:SS  STEP  message` — e.g. `13:42:07  SEARCH   scanning 5 storefronts…`.
- Step tokens are UPPERCASE and colored by state (`AUTHORIZE` green when passed, `BLOCKED` amber, `DENIED` red).
- New lines type on with `ease-mechanical`; auto-scroll to newest.
- ❌ No avatars, no speech bubbles, no "Hi! I'm your shopping assistant."

### 5.4 ApprovalCard
- Panel with `1.5px color-pending` border, `AWAITING SIGNATURE` eyebrow.
- Shows the request: item, merchant, price (mono), and *why approval is needed* (`> $25 per-txn` or `untrusted merchant`).
- Actions: **Approve** (green signal button) / **Deny** (red outline). Decision resolves the blocked path in the graph live.

### 5.5 Receipt / provenance line
- Printed-receipt aesthetic: mono, hairline top/bottom, `PAID WITH SINGLE-USE CARD •7391 (NOW DEAD)`.
- Includes the platform take-rate line: `BAZAAR FEE 2.5% · TEST`.
- Click → highlights provenance path in the graph (§5.1).

### 5.6 Storefront product card
- `radius-none`, `1px color-border`. Big emoji as product art on `paper-0`.
- `heading-3` product name, `label` category tag, mono `data` price (right-aligned, tabular).
- Store header uses `display-1` for the store name — each of the 5 stores is the same template, different content.

### 5.7 StatBlock (from the reference)
- Huge `display-1` mono/tabular number + two-line `label` caption (`THROUGHPUT INCREASE / LINEAR`).
- Used for budget/spend readouts. Numbers tick up on mount.

### 5.8 PlanBadge / Tag / Chip
- `radius-sm` (chips) or `radius-full` (status dots), `label` type.
- Plan badge: `FREE` (ink outline) / `PRO` (green fill). Category/preset chips are outline, fill `paper-100` on hover.

---

## 6. Patterns

### 6.1 The dashboard (primary screen)
Desktop 3-column, framed by the blueprint grid:
- **Header:** wordmark `Bazaar — commerce for agents · Mandate inside`, 5 store chips, PlanBadge, login.
- **Left:** `TaskBox` ("Tell your agent what to buy…" + 3 preset chips) above the `AgentFeed`.
- **Center:** `GraphCanvas` (the hero, largest region).
- **Right:** `ApprovalCards` → `VirtualCard` showcase → `Receipts`.
- Everything polls ~2s; state changes animate per §2.6.

Below `lg`: stack as Feed → Graph → Approvals/Card/Receipts.

### 6.2 The authorize → mint → order flow (the money moment)
State choreography, all mirrored in graph + feed + right rail:
1. **Task issued** → feed `SEARCH`; task node appears.
2. **Candidates found** → feed lists SKUs.
3. **Authorizing** → path attempts to draw.
4a. **Auto (≤ threshold):** path draws **green** → card mints (VirtualCard scale-in) → order → card stamps `SPENT` → receipt.
4b. **Needs approval:** path pauses at an **amber** node; ApprovalCard appears; on **Approve** it completes 4a; on **Deny** the edge goes **red**.
4c. **Denied (policy):** failing edge flashes **red**, reason chip shown, **no card node is ever created** (say this out loud in the demo).

### 6.3 Universal states
Every data surface defines: **loading** (mono `…` skeleton hairlines, no spinners-of-doom), **empty** (mono hint, e.g. `NO ORDERS YET`), **error** (`color-denied` line + retry), **denied** (reason-first, never a dead end).

---

## 7. Content & accessibility (governance, pt. 1)

### 7.1 Voice & tone
- **System-log register.** Terse, present-tense, machine-precise. Uppercase state words.
- Examples: `AUTHORIZED` · `MINTED $12.00` · `DENIED — CATEGORY NOT IN MANDATE` · `AWAITING SIGNATURE`.
- ✅ "Blocked — needs approval (> $25)." ❌ "Oops! Looks like this needs a quick sign-off 😊".
- Money is always mono, `$` prefixed, 2 decimals, tabular.

### 7.2 Accessibility
- **Contrast:** body/UI text pairs target WCAG AA (≥4.5:1); large display ≥3:1. `ink` on `paper` clears AAA.
- **Never color-alone:** because color carries meaning here, every signal color is paired with a **word and/or icon** (`✓ AUTHORIZED`, `✕ DENIED`, `● PENDING`). Color-blind users must read state from text.
- **Focus:** visible `2px color-focus` ring, `2px` offset, on every interactive element. Full keyboard operability for buttons, chips, approve/deny, store nav.
- **Motion:** respect `prefers-reduced-motion` (§2.6).
- **Targets:** ≥40×40px interactive hit area.
- **Graph a11y:** provide a text/list fallback of the same authorization result for screen readers; the graph is an enhancement, not the only channel.

---

## 8. Implementation notes

### 8.1 Token source of truth (CSS custom properties)
Define primitives + semantics on `:root`; product code references semantics only.

```css
:root {
  /* primitive — paper */
  --paper-0: #FAF9F5;  --paper-50: #F5F4EF;  --paper-100: #EDECE4;  --paper-200: #E2E0D6;
  /* primitive — ink */
  --ink-900: #0A0A0A;  --ink-800: #1A1A18;  --ink-700: #3A3A36;  --ink-500: #6B6A62;
  --ink-400: #8A8981;  --ink-300: #B8B7B0;  --ink-200: #D4D3CB;
  /* primitive — signal */
  --green-600: #15803D; --green-500: #22C55E; --green-100: #DCFCE7;
  --red-600:   #DC2626; --red-500:   #EF4444; --red-100:   #FEE2E2;
  --amber-600: #D97706; --amber-500: #F59E0B; --amber-100: #FEF3C7;

  /* semantic */
  --color-bg: var(--paper-50);
  --color-surface: var(--paper-0);
  --color-surface-sunken: var(--paper-100);
  --color-border: var(--ink-300);
  --color-border-strong: var(--ink-800);
  --color-text: var(--ink-900);
  --color-text-muted: var(--ink-500);
  --color-text-label: var(--ink-400);
  --color-authorized: var(--green-600);
  --color-authorized-bright: var(--green-500);
  --color-denied: var(--red-600);
  --color-pending: var(--amber-600);
  --color-focus: var(--ink-900);

  /* type */
  --font-display: "Clash Display", "Inter", system-ui, sans-serif;
  --font-sans: "General Sans", system-ui, sans-serif;
  --font-mono: "Geist Mono", "JetBrains Mono", ui-monospace, monospace;

  /* radius */
  --radius-none: 0; --radius-sm: 2px; --radius-md: 6px; --radius-full: 9999px;

  /* motion */
  --dur-fast: 120ms; --dur-base: 200ms; --dur-slow: 320ms; --dur-draw: 700ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-mechanical: linear;
}
```

### 8.2 Tailwind theme extension (sketch)
Map the same tokens so utilities stay on-system.

```js
// tailwind.config — theme.extend
export default {
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-sunken": "var(--color-surface-sunken)",
        border: "var(--color-border)",
        "border-strong": "var(--color-border-strong)",
        text: "var(--color-text)",
        "text-muted": "var(--color-text-muted)",
        "text-label": "var(--color-text-label)",
        authorized: "var(--color-authorized)",
        denied: "var(--color-denied)",
        pending: "var(--color-pending)",
      },
      fontFamily: {
        display: ["Clash Display", "Inter", "system-ui", "sans-serif"],
        sans: ["General Sans", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: { none: "0", sm: "2px", md: "6px", full: "9999px" },
      letterSpacing: { label: "0.12em" },
    },
  },
};
```

### 8.3 Fonts
- Clash Display + General Sans: Fontshare CSS (`api.fontshare.com`), self-host for the demo to avoid a network dependency.
- Geist Mono: `npm i geist` (or self-host woff2).
- Preload the display weight used in the hero; enable `tabular-nums` globally on `.font-mono`.

### 8.4 Anti-pattern checklist (reject in review)
Purple/blue/cyan gradient · glassmorphism/backdrop-blur · glowing box-shadows · sparkle/`✨` iconography · all-rounded pills on panels · chat bubbles/assistant avatars · emoji in UI chrome · non-mono numbers in financial readouts · color used without an accompanying label.

---

## 9. Governance

- **Versioning:** semver on this doc. Foundations changes = minor; token value changes = patch; breaking token renames = major.
- **Source of truth:** this file → `:root` CSS variables → Tailwind theme. Components consume semantic tokens only; no hard-coded hex in components.
- **Contribution:** propose new tokens/components against §1 principles + §8.4 checklist. New color must justify itself as *state*, or it doesn't ship.
- **Changelog:**

| Version | Date | Change |
|---|---|---|
| v0.1 | 2026-07-07 | Initial system: `Bazaar Terminal`, light Paper base, three-tier tokens, foundations + signature components. |
