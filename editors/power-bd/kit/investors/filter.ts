/** Filtering investor rows, for the list's source-list filter. */

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
