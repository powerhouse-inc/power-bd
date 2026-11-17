/** Counting and filtering investor rows, for the tabs and the list filter. */

export type StateFilter =
  | "ALL"
  | "LISTED"
  | "SHORTLISTED"
  | "EXCLUDED"
  | "ENGAGED";

interface RowLike {
  state: string;
  sourceList?: string | null;
}

export function countByState(
  rows: readonly RowLike[],
): Record<StateFilter, number> {
  const counts: Record<StateFilter, number> = {
    ALL: rows.length,
    LISTED: 0,
    SHORTLISTED: 0,
    EXCLUDED: 0,
    ENGAGED: 0,
  };
  for (const r of rows) counts[r.state as Exclude<StateFilter, "ALL">]++;
  return counts;
}

export function filterRows<T extends RowLike>(
  rows: readonly T[],
  state: StateFilter,
  sourceList: string | null,
): T[] {
  return rows.filter(
    (r) =>
      (state === "ALL" || r.state === state) &&
      (sourceList === null || r.sourceList === sourceList),
  );
}

export function sourceLists(rows: readonly RowLike[]): string[] {
  return [
    ...new Set(rows.map((r) => r.sourceList).filter((s): s is string => !!s)),
  ].sort();
}
