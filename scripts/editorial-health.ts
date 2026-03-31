/**
 * Editorial corpus health + governance checks.
 * Run: pnpm editorial:health  (or: npx tsx scripts/editorial-health.ts)
 *
 * Exit 1 if validation errors; warnings still exit 0 unless STRICT_EDITORIAL_HEALTH=1.
 */

import { EDITORIAL_ARTICLES } from "../lib/content/articlesData";
import {
  getExpectedSecondaryCtaLabel,
  validateEditorialCorpus,
} from "../lib/content/validateEditorial";

const strict = process.env.STRICT_EDITORIAL_HEALTH === "1";

function main() {
  const { issues, health, ok } = validateEditorialCorpus(EDITORIAL_ARTICLES);

  console.log("\n=== HLI editorial health ===\n");
  console.log(`Articles: ${health.articleCount}`);
  console.log(`Missing hero images: ${health.missingHeroImages.length}${health.missingHeroImages.length ? ` → ${health.missingHeroImages.join(", ")}` : ""}`);
  console.log(`Missing reviewers: ${health.missingReviewers.length}`);
  console.log(
    `Placeholder-only references (no URLs): ${health.placeholderReferencesOnly.length}${health.placeholderReferencesOnly.length ? ` → ${health.placeholderReferencesOnly.join(", ")}` : ""}`
  );
  console.log(`Invalid related links: ${health.invalidRelatedLinks.length}`);
  console.log(`Duplicate titles: ${health.duplicateTitles.length}`);
  console.log(`Duplicate descriptions: ${health.duplicateDescriptions.length}`);
  console.log(`Duplicate full-taxonomy fingerprints: ${health.taxonomyFingerprintsToReview.length}`);
  if (health.sharedTagsTop.length) {
    console.log("\nShared tags (review for over-clustering):");
    for (const row of health.sharedTagsTop.slice(0, 12)) {
      console.log(`  • ${row.tag} (${row.count}): ${row.slugs.join(", ")}`);
    }
  }

  const warnings = issues.filter((i) => i.severity === "warning");
  const errors = issues.filter((i) => i.severity === "error");

  if (warnings.length) {
    console.log(`\nWarnings (${warnings.length}):`);
    for (const w of warnings) {
      console.log(`  [${w.code}] ${w.slug ? `${w.slug}: ` : ""}${w.message}`);
    }
  }

  if (errors.length) {
    console.log(`\nErrors (${errors.length}):`);
    for (const e of errors) {
      console.log(`  [${e.code}] ${e.slug ? `${e.slug}: ` : ""}${e.message}`);
    }
  } else {
    console.log("\nNo validation errors.");
  }

  console.log("\n=== CTA intent (secondary label vs ctaType) ===\n");
  for (const a of EDITORIAL_ARTICLES) {
    const secondary = getExpectedSecondaryCtaLabel(a.ctaType);
    console.log(`  ${a.slug}`);
    console.log(`    ctaType: ${a.ctaType} → secondary: "${secondary}"`);
  }

  console.log("\n=== Canonical path (expected) ===\n");
  for (const a of EDITORIAL_ARTICLES) {
    console.log(`  /insights/${a.slug}`);
  }

  const warnExit = strict && warnings.length > 0 ? 1 : 0;
  const exitCode = ok ? warnExit : 1;
  if (exitCode !== 0) {
    process.exit(exitCode);
  }
  console.log("\nEditorial health check passed.\n");
}

main();
