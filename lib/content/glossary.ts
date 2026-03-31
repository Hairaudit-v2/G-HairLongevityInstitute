export type GlossaryEntry = {
  slug: string;
  term: string;
  shortDefinition: string;
};

/** Curated in-app glossary; expand as editorial volume grows */
export const GLOSSARY: GlossaryEntry[] = [
  {
    slug: "ferritin",
    term: "Ferritin",
    shortDefinition:
      "A blood protein reflecting iron stores; often discussed alongside hair shedding when stores are low — interpretation is clinical context–dependent.",
  },
  {
    slug: "telogen-effluvium",
    term: "Telogen effluvium",
    shortDefinition:
      "A pattern of increased hair shedding often linked to physiological stressors, illness, or nutritional shifts; diagnosis belongs with a clinician.",
  },
  {
    slug: "dht",
    term: "DHT (dihydrotestosterone)",
    shortDefinition:
      "An androgen metabolite relevant to androgenetic patterning in susceptible follicles; one factor among many in hair biology.",
  },
];

export function getGlossaryBySlug(slug: string): GlossaryEntry | undefined {
  return GLOSSARY.find((g) => g.slug === slug);
}

export function glossaryPath(slug: string): string {
  return `/insights/glossary/${slug}`;
}
