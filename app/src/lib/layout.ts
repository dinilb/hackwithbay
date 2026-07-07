// Deterministic, hand-authored layout for the trust graph (design.md §5.1).
// A designed blueprint reads far more intentional than a random force layout.

export const VIEW = { w: 1120, h: 640 };

export type NodeType = "User" | "Agent" | "Mandate" | "Category" | "Merchant";
export type NodeMeta = { x: number; y: number; type: NodeType; label: string; tag: string; allowed?: boolean };

export const NODES: Record<string, NodeMeta> = {
  dinil:        { x: 110, y: 200, type: "User",     label: "Dinil",        tag: "USER" },
  "shopper-1":  { x: 110, y: 400, type: "Agent",    label: "shopper-1",    tag: "AGENT" },

  M1:           { x: 340, y: 210, type: "Mandate",  label: "Wardrobe",     tag: "MANDATE · $50/wk" },
  M2:           { x: 340, y: 430, type: "Mandate",  label: "Pantry",       tag: "MANDATE · $20/wk" },

  apparel:      { x: 585, y: 170, type: "Category", label: "apparel",      tag: "CATEGORY", allowed: true },
  consumables:  { x: 585, y: 450, type: "Category", label: "consumables",  tag: "CATEGORY", allowed: true },

  "bobs-tshirts": { x: 880, y: 150, type: "Merchant", label: "Bob's T-Shirts",     tag: "MERCHANT · MCP" },
  "daily-grind":  { x: 880, y: 450, type: "Merchant", label: "Daily Grind",        tag: "MERCHANT · MCP" },

  // Unmandated garden — present, MCP-native, but no mandate reaches them.
  outdoor:      { x: 470, y: 588, type: "Category", label: "outdoor",     tag: "CATEGORY", allowed: false },
  electronics:  { x: 690, y: 588, type: "Category", label: "electronics", tag: "CATEGORY", allowed: false },
  books:        { x: 910, y: 588, type: "Category", label: "books",       tag: "CATEGORY", allowed: false },

  "peak-supply":  { x: 470, y: 500, type: "Merchant", label: "Peak Supply",  tag: "MERCHANT · MCP" },
  "pixel-pine":   { x: 690, y: 500, type: "Merchant", label: "Pixel & Pine", tag: "MERCHANT · MCP" },
  "paper-trail":  { x: 910, y: 500, type: "Merchant", label: "Paper Trail",  tag: "MERCHANT · MCP" },
};

export const NODE_R: Record<NodeType, number> = {
  User: 13, Agent: 13, Mandate: 11, Category: 8, Merchant: 12,
};

export type Preset = {
  label: string; sku: string; task: string;
  merchant: string; expect: "auto" | "approval" | "denied";
};

export const PRESETS: Preset[] = [
  { label: "Plain tee · under $15", sku: "sku_bobs-tshirts_1", task: "buy me a plain white tee under $15", merchant: "bobs-tshirts", expect: "auto" },
  { label: "Graphite hoodie · $30", sku: "sku_bobs-tshirts_7", task: "get the graphite hoodie", merchant: "bobs-tshirts", expect: "approval" },
  { label: "RTX-class GPU · $500", sku: "sku_pixel-pine_8", task: "buy me a $500 GPU for training", merchant: "pixel-pine", expect: "denied" },
];
