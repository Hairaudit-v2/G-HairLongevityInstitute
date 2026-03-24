import { mapResponsesToAdaptiveAnswers } from "../mapResponsesToAdaptiveAnswers";
import { evaluateAdaptiveIntake } from "@/src/lib/longevity/intake/adaptiveTriageEngine";
import type { PathwayId } from "@/src/lib/longevity/intake/adaptiveTypes";

import type {
  SyntheticCaseMismatch,
  SyntheticPatientCase,
  SyntheticSingleCaseResult,
  SyntheticSuiteRunResult,
  SyntheticSuiteSummary,
} from "./types";

const SHELL_PATHWAY_IDS = new Set<PathwayId>(["mixed_pattern", "unclear_pattern"]);

function normalizePrimaryExpected(
  p: PathwayId | PathwayId[]
): PathwayId[] {
  return Array.isArray(p) ? p : [p];
}

function concreteScoresSorted(
  scores: { pathwayId: PathwayId; score: number }[]
): { pathwayId: PathwayId; score: number }[] {
  return scores
    .filter((s) => !SHELL_PATHWAY_IDS.has(s.pathwayId))
    .sort((a, b) => b.score - a.score);
}

function narrowMarginAndGap(
  scores: { pathwayId: PathwayId; score: number }[]
): { narrow: boolean; gap: number | null; top: PathwayId | null; second: PathwayId | null } {
  const c = concreteScoresSorted(scores);
  if (c.length < 2) return { narrow: false, gap: null, top: c[0]?.pathwayId ?? null, second: null };
  const gap = c[0]!.score - c[1]!.score;
  return {
    narrow: gap <= 2 && c[0]!.score > 0,
    gap,
    top: c[0]!.pathwayId,
    second: c[1]!.pathwayId,
  };
}

export function evaluateSyntheticPatientCase(
  c: SyntheticPatientCase
): SyntheticSingleCaseResult {
  const adaptiveAnswers = mapResponsesToAdaptiveAnswers(c.responses);
  const engine = evaluateAdaptiveIntake(adaptiveAnswers);
  const triage = engine.triage;
  const scores = engine.pathwayScores.map((s) => ({
    pathwayId: s.pathwayId,
    score: s.score,
  }));

  const acceptPrimary = normalizePrimaryExpected(c.expected.primary_pathway);
  const primary_ok = acceptPrimary.includes(triage.primary_pathway);

  const needSec = c.expected.secondary_pathways_include ?? [];
  const missingSecondaries = needSec.filter((id) => !triage.secondary_pathways.includes(id));
  const secondary_ok = missingSecondaries.length === 0;

  const needFlags = c.expected.clinician_flags_include ?? [];
  const missingFlags = needFlags.filter((f) => !triage.clinician_attention_flags.includes(f));
  const flags_ok = missingFlags.length === 0;

  const needRed = c.expected.red_flags_include ?? [];
  const missingRed = needRed.filter((f) => !triage.red_flags.includes(f));
  const red_ok = missingRed.length === 0;

  const needBlood = c.expected.bloodwork_include ?? [];
  const missingBlood = needBlood.filter((b) => !triage.bloodwork_considerations.includes(b));
  const blood_ok = missingBlood.length === 0;

  const mismatches: SyntheticCaseMismatch[] = [];
  if (!primary_ok) {
    mismatches.push({
      kind: "primary_pathway",
      detail: `expected one of [${acceptPrimary.join(", ")}], got ${triage.primary_pathway}`,
    });
  }
  for (const m of missingSecondaries) {
    mismatches.push({
      kind: "secondary_pathway",
      detail: `missing secondary ${m}`,
    });
  }
  for (const m of missingFlags) {
    mismatches.push({ kind: "clinician_flag", detail: `missing flag ${m}` });
  }
  for (const m of missingRed) {
    mismatches.push({ kind: "red_flag", detail: `missing red flag ${m}` });
  }
  for (const m of missingBlood) {
    mismatches.push({ kind: "bloodwork", detail: `missing bloodwork ${m}` });
  }

  const hasExpectationsBeyondPrimary =
    needSec.length > 0 || needFlags.length > 0 || needRed.length > 0 || needBlood.length > 0;
  const allSecondaryChecks = secondary_ok && flags_ok && red_ok && blood_ok;
  const passed = primary_ok && (!hasExpectationsBeyondPrimary || allSecondaryChecks);
  const failed = !primary_ok;
  const partial = primary_ok && hasExpectationsBeyondPrimary && !allSecondaryChecks;

  const { narrow, gap, top, second } = narrowMarginAndGap(scores);

  return {
    case: c,
    primary_ok,
    secondary_ok,
    flags_ok,
    red_ok,
    blood_ok,
    passed,
    partial,
    failed,
    mismatches,
    actual: {
      primary_pathway: triage.primary_pathway,
      secondary_pathways: triage.secondary_pathways,
      clinician_attention_flags: triage.clinician_attention_flags,
      red_flags: triage.red_flags,
      bloodwork_considerations: triage.bloodwork_considerations,
      pathway_scores: scores,
    },
    narrow_margin_top2: narrow,
    score_gap_top2: gap,
  };
}

function emptyTagStats(): SyntheticSuiteSummary["by_tag_weak"] {
  return {};
}

export function runSyntheticPatientSuite(
  cases: SyntheticPatientCase[]
): SyntheticSuiteRunResult {
  const results = cases.map(evaluateSyntheticPatientCase);

  const summary: SyntheticSuiteSummary = {
    total: results.length,
    passed: 0,
    partial: 0,
    failed: 0,
    primary_mismatches: [],
    missing_secondaries: [],
    missing_clinician_flags: [],
    missing_red_flags: [],
    missing_bloodwork: [],
    narrow_margin_cases: [],
    by_tag_weak: emptyTagStats(),
  };

  for (const r of results) {
    if (r.passed) summary.passed++;
    else if (r.failed) summary.failed++;
    else if (r.partial) summary.partial++;

    if (!r.primary_ok) {
      summary.primary_mismatches.push({
        id: r.case.id,
        label: r.case.label,
        expected: normalizePrimaryExpected(r.case.expected.primary_pathway).join(" | "),
        actual: r.actual.primary_pathway,
      });
    }
    const needSec = r.case.expected.secondary_pathways_include ?? [];
    const missS = needSec.filter((id) => !r.actual.secondary_pathways.includes(id));
    if (missS.length) {
      summary.missing_secondaries.push({ id: r.case.id, label: r.case.label, missing: missS });
    }
    const needF = r.case.expected.clinician_flags_include ?? [];
    const missF = needF.filter((f) => !r.actual.clinician_attention_flags.includes(f));
    if (missF.length) {
      summary.missing_clinician_flags.push({ id: r.case.id, label: r.case.label, missing: missF });
    }
    const needR = r.case.expected.red_flags_include ?? [];
    const missR = needR.filter((f) => !r.actual.red_flags.includes(f));
    if (missR.length) {
      summary.missing_red_flags.push({ id: r.case.id, label: r.case.label, missing: missR });
    }
    const needB = r.case.expected.bloodwork_include ?? [];
    const missB = needB.filter((b) => !r.actual.bloodwork_considerations.includes(b));
    if (missB.length) {
      summary.missing_bloodwork.push({ id: r.case.id, label: r.case.label, missing: missB });
    }

    if (r.narrow_margin_top2 && r.score_gap_top2 != null && r.actual.pathway_scores.length) {
      const c = concreteScoresSorted(r.actual.pathway_scores);
      if (c[0] && c[1]) {
        summary.narrow_margin_cases.push({
          id: r.case.id,
          label: r.case.label,
          gap: r.score_gap_top2,
          top: c[0].pathwayId,
          second: c[1].pathwayId,
        });
      }
    }

    const tags = r.case.tags ?? [];
    for (const t of tags) {
      if (!summary.by_tag_weak[t]) {
        summary.by_tag_weak[t] = { failed: 0, partial: 0, ids: [] };
      }
      if (r.failed) {
        summary.by_tag_weak[t].failed++;
        summary.by_tag_weak[t].ids.push(r.case.id);
      } else if (r.partial) {
        summary.by_tag_weak[t].partial++;
        if (!summary.by_tag_weak[t].ids.includes(r.case.id)) {
          summary.by_tag_weak[t].ids.push(r.case.id);
        }
      }
    }
  }

  return { results, summary };
}

/** Plain-text report for CLI / logs. */
export function formatSyntheticSuiteReport(run: SyntheticSuiteRunResult): string {
  const s = run.summary;
  const lines: string[] = [];
  lines.push("=== HLI synthetic patient suite ===");
  lines.push(`Total: ${s.total} | Pass: ${s.passed} | Partial: ${s.partial} | Fail: ${s.failed}`);
  lines.push("");
  if (s.primary_mismatches.length) {
    lines.push("--- Primary pathway mismatches ---");
    for (const m of s.primary_mismatches) {
      lines.push(`  ${m.id}: ${m.label}`);
      lines.push(`    expected: ${m.expected} | actual: ${m.actual}`);
    }
    lines.push("");
  }
  if (s.missing_secondaries.length) {
    lines.push("--- Missing expected secondaries ---");
    for (const m of s.missing_secondaries) {
      lines.push(`  ${m.id}: missing [${m.missing.join(", ")}]`);
    }
    lines.push("");
  }
  if (s.missing_clinician_flags.length) {
    lines.push("--- Missing clinician attention flags ---");
    for (const m of s.missing_clinician_flags) {
      lines.push(`  ${m.id}: missing [${m.missing.join(", ")}]`);
    }
    lines.push("");
  }
  if (s.missing_red_flags.length) {
    lines.push("--- Missing red flags ---");
    for (const m of s.missing_red_flags) {
      lines.push(`  ${m.id}: missing [${m.missing.join(", ")}]`);
    }
    lines.push("");
  }
  if (s.missing_bloodwork.length) {
    lines.push("--- Missing bloodwork considerations ---");
    for (const m of s.missing_bloodwork) {
      lines.push(`  ${m.id}: missing [${m.missing.join(", ")}]`);
    }
    lines.push("");
  }
  if (s.narrow_margin_cases.length) {
    lines.push(`--- Narrow margin (gap ≤2) cases (${s.narrow_margin_cases.length}) ---`);
    for (const n of s.narrow_margin_cases.slice(0, 25)) {
      lines.push(`  ${n.id}: gap=${n.gap} ${n.top} vs ${n.second}`);
    }
    if (s.narrow_margin_cases.length > 25) {
      lines.push(`  ... +${s.narrow_margin_cases.length - 25} more`);
    }
    lines.push("");
  }

  const themeMatchers: { label: string; test: (tags: string[] | undefined) => boolean }[] = [
    {
      label: "Postpartum overlap",
      test: (t) => !!t?.some((x) => x.startsWith("postpartum")),
    },
    {
      label: "Inflammatory + shedding",
      test: (t) => !!t?.some((x) => x === "inflammatory_shedding" || x === "inflammatory"),
    },
    {
      label: "Androgen exposure / TRT",
      test: (t) => !!t?.some((x) => x === "trt" || x === "androgen_exposure"),
    },
    {
      label: "Traction vs diffuse TE",
      test: (t) =>
        !!t?.some((x) => x.includes("traction") || x.includes("te_overlap") || x === "breakage_vs_te"),
    },
    {
      label: "Uncertainty / mixed margin",
      test: (t) =>
        !!t?.some((x) => x.includes("uncertainty") || x === "mixed_margin" || x === "severity_mismatch"),
    },
    {
      label: "Tagged weak_spot probes",
      test: (t) => !!t?.includes("weak_spot"),
    },
  ];
  const narrowThemed = run.results.filter((r) => r.narrow_margin_top2);
  if (narrowThemed.length) {
    lines.push("--- Narrow margins by calibration theme (case ids) ---");
    for (const { label, test } of themeMatchers) {
      const ids = narrowThemed.filter((r) => test(r.case.tags)).map((r) => r.case.id);
      if (ids.length) lines.push(`  ${label}: ${ids.join(", ")}`);
    }
    lines.push("");
  }

  lines.push("--- By tag (failed / partial counts) ---");
  const tagKeys = Object.keys(s.by_tag_weak).sort();
  let anyTagFail = false;
  for (const t of tagKeys) {
    const w = s.by_tag_weak[t];
    if (w.failed || w.partial) {
      anyTagFail = true;
      lines.push(
        `  ${t}: fail=${w.failed} partial=${w.partial} ids=${w.ids.slice(0, 8).join(",")}${w.ids.length > 8 ? "…" : ""}`
      );
    }
  }
  if (!anyTagFail) {
    lines.push("  (no failures)");
  }
  return lines.join("\n");
}
