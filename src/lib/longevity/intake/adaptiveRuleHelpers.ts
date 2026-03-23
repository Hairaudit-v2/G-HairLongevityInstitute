import type { AdaptiveFacts, RuleCondition } from "./adaptiveTypes";

function toArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

export function includesAny(value: unknown, expected: unknown[]): boolean {
  const arr = toArray(value);
  return expected.some((item) => arr.includes(item));
}

export function matchCondition(condition: RuleCondition, facts: AdaptiveFacts): boolean {
  const actual = facts[condition.fact];
  const expected = condition.value;

  switch (condition.operator) {
    case "eq":
      return actual === expected;
    case "neq":
      return actual !== expected;
    case "in":
      return Array.isArray(expected) ? expected.includes(actual) : false;
    case "not_in":
      return Array.isArray(expected) ? !expected.includes(actual) : false;
    case "gt":
      return typeof actual === "number" && typeof expected === "number" && actual > expected;
    case "gte":
      return typeof actual === "number" && typeof expected === "number" && actual >= expected;
    case "lt":
      return typeof actual === "number" && typeof expected === "number" && actual < expected;
    case "lte":
      return typeof actual === "number" && typeof expected === "number" && actual <= expected;
    case "includes":
      return toArray(actual).includes(expected);
    case "exists":
      return actual !== undefined && actual !== null && actual !== "";
    default:
      return false;
  }
}

export function matchesAll(conditions: RuleCondition[] | undefined, facts: AdaptiveFacts): boolean {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every((condition) => matchCondition(condition, facts));
}

export function dedupeStrings<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values));
}
