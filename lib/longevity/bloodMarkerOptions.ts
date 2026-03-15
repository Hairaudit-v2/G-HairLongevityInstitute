/**
 * Blood marker options for UI: grouped by category for searchable/selectable marker entry.
 * Derived from registry; use for Add/Edit marker forms in Trichologist workspace.
 */

import { getAllMarkerDefinitions } from "./bloodMarkerRegistry";

export type MarkerOption = {
  key: string;
  label: string;
  defaultUnit: string;
};

export type MarkerOptionGroup = {
  category: string;
  options: MarkerOption[];
};

/** Grouped options by category for dropdown/select. Categories in display order. */
const CORE_CATEGORY_ORDER = [
  "Iron / oxygen delivery",
  "Thyroid",
  "Nutritional / follicular support",
  "Inflammation / metabolic stress",
  "Hormonal / androgen-related",
  "Protein / systemic support",
];

const ADDITIONAL_CATEGORY_ORDER = [
  "Additional markers / haematology",
  "Additional markers / liver",
  "Additional markers / kidney",
];

export const MOST_USED_MARKER_KEYS = [
  "ferritin",
  "vitamin_d_25oh",
  "tsh",
  "free_t4",
  "free_t3",
  "vitamin_b12",
  "folate",
  "zinc",
  "crp",
  "hba1c",
  "total_testosterone",
  "shbg",
  "dheas",
  "prolactin",
  "lh",
  "fsh",
  "estradiol",
  "progesterone",
] as const;

let _cached: MarkerOptionGroup[] | null = null;

/**
 * Options grouped by category for the Add/Edit blood marker form.
 * Use when rendering a select or searchable list; prefer registry key as value, display label.
 */
export function getBloodMarkerOptionsByCategory(): MarkerOptionGroup[] {
  if (_cached) return _cached;
  const defs = getAllMarkerDefinitions();
  const mostUsedSet = new Set<string>(MOST_USED_MARKER_KEYS);
  const byCategory = new Map<string, MarkerOption[]>();
  const mostUsed: MarkerOption[] = [];

  for (const d of defs) {
    const option = { key: d.key, label: d.label, defaultUnit: d.defaultUnit };
    if (mostUsedSet.has(d.key)) {
      mostUsed.push(option);
      continue;
    }
    const list = byCategory.get(d.category) ?? [];
    list.push(option);
    byCategory.set(d.category, list);
  }

  const coreGroups = CORE_CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((category) => ({
    category: `Core hair markers — ${category}`,
    options: byCategory.get(category)!.sort((a, b) => a.label.localeCompare(b.label)),
  }));

  const additionalGroups = ADDITIONAL_CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((category) => ({
    category: `Additional markers — ${category.replace("Additional markers / ", "")}`,
    options: byCategory.get(category)!.sort((a, b) => a.label.localeCompare(b.label)),
  }));

  _cached = [
    {
      category: "Most used",
      options: mostUsed
        .slice()
        .sort(
          (a, b) =>
            MOST_USED_MARKER_KEYS.indexOf(a.key as (typeof MOST_USED_MARKER_KEYS)[number]) -
            MOST_USED_MARKER_KEYS.indexOf(b.key as (typeof MOST_USED_MARKER_KEYS)[number])
        ),
    },
    ...coreGroups,
    ...additionalGroups,
  ];
  return _cached;
}

/** Flat list of all options (key, label, defaultUnit) for search/filter. */
export function getAllMarkerOptions(): MarkerOption[] {
  return getBloodMarkerOptionsByCategory().flatMap((g) => g.options);
}

/** Resolve display label for a key (for consistency with registry). */
export { getDisplayLabel } from "./bloodMarkerRegistry";
