import { runSyntheticPatientSuite } from "./runSyntheticPatientSuite";
import { SYNTHETIC_PATIENT_CASES } from "./syntheticCases";

export type SyntheticPatientSuiteSmokeResult = { name: string; passed: boolean; message?: string };

const MIN_CASES = 50;

/** Ensures the suite is wired and runnable; does not require all expectations to pass (calibration may surface mismatches). */
export function runSyntheticPatientSuiteSmokeTests(): SyntheticPatientSuiteSmokeResult[] {
  const results: SyntheticPatientSuiteSmokeResult[] = [];

  results.push({
    name: `synthetic suite has at least ${MIN_CASES} cases`,
    ...(() => {
      try {
        if (SYNTHETIC_PATIENT_CASES.length < MIN_CASES) {
          throw new Error(`expected ≥${MIN_CASES}, got ${SYNTHETIC_PATIENT_CASES.length}`);
        }
        return { passed: true as const };
      } catch (e) {
        return { passed: false as const, message: e instanceof Error ? e.message : String(e) };
      }
    })(),
  });

  results.push({
    name: "synthetic suite runner completes without throw",
    ...(() => {
      try {
        const run = runSyntheticPatientSuite(SYNTHETIC_PATIENT_CASES);
        if (run.summary.total !== SYNTHETIC_PATIENT_CASES.length) {
          throw new Error(`summary.total ${run.summary.total} !== cases ${SYNTHETIC_PATIENT_CASES.length}`);
        }
        return { passed: true as const };
      } catch (e) {
        return { passed: false as const, message: e instanceof Error ? e.message : String(e) };
      }
    })(),
  });

  return results;
}
