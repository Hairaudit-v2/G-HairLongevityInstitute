/**
 * Developer harness: map questionnaire-style payloads → adaptive answers → v2 triage.
 * Usage: npx tsx scripts/run-synthetic-patient-suite.ts [--json]
 */

import {
  formatSyntheticSuiteReport,
  runSyntheticPatientSuite,
} from "../lib/longevity/intake/syntheticPatients/runSyntheticPatientSuite";
import { SYNTHETIC_PATIENT_CASES } from "../lib/longevity/intake/syntheticPatients/syntheticCases";

const json = process.argv.includes("--json");
const run = runSyntheticPatientSuite(SYNTHETIC_PATIENT_CASES);

if (json) {
  console.log(JSON.stringify(run, null, 2));
} else {
  console.log(formatSyntheticSuiteReport(run));
}
