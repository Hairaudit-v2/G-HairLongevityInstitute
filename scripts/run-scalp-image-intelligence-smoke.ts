/**
 * Run: npx tsx scripts/run-scalp-image-intelligence-smoke.ts
 */

import { runScalpImageIntelligenceSmokeTests } from "../lib/longevity/scalpImageIntelligence.smoke-test";

const results = runScalpImageIntelligenceSmokeTests();
let failed = 0;
for (const r of results) {
  if (!r.passed) {
    failed += 1;
    console.error(`FAIL: ${r.name}`, r.message ?? "");
  } else {
    console.log(`ok: ${r.name}`);
  }
}
if (failed > 0) {
  console.error(`\n${failed}/${results.length} failed`);
  process.exit(1);
}
console.log(`\nAll ${results.length} scalp image intelligence smoke tests passed.`);
