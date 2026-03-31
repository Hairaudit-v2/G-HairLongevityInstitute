import type { EditorialHubSlug } from "@/lib/content/types";

export const HUB_PATH: Record<EditorialHubSlug, string> = {
  conditions: "/conditions",
  "blood-markers": "/blood-markers",
  treatments: "/treatments",
  "hair-loss-causes": "/hair-loss-causes",
};

export const HUB_LABEL: Record<EditorialHubSlug, string> = {
  conditions: "Conditions",
  "blood-markers": "Blood markers",
  treatments: "Treatments",
  "hair-loss-causes": "Hair loss causes",
};

export const HUB_DESCRIPTION: Record<EditorialHubSlug, string> = {
  conditions:
    "Clinical context for scalp and hair presentations — educational, not a substitute for individual assessment.",
  "blood-markers":
    "How common blood tests relate to hair biology and when results merit discussion with your clinician.",
  treatments:
    "Evidence-framed treatment themes and planning considerations from a biology-first perspective.",
  "hair-loss-causes":
    "Patterns, drivers, and how cause-informed planning supports better long-term outcomes.",
};

/** Stable topic keys for “popular topics” and filters (values are display labels). */
export const POPULAR_TOPIC_KEYS = [
  { key: "ferritin", label: "Ferritin & iron" },
  { key: "thyroid", label: "Thyroid" },
  { key: "androgens", label: "Androgens & DHT" },
  { key: "shedding", label: "Shedding (telogen effluvium)" },
  { key: "scalp-inflammation", label: "Scalp inflammation" },
  { key: "blood-tests", label: "Blood tests & interpretation" },
] as const;
