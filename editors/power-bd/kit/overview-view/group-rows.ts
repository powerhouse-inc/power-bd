/**
 * A list's rows under their status, in the board's column order, for a list
 * that takes drops like the board. Every status gets its group, empty or not,
 * so each one can take a row. Each group keeps the rows in the list's own
 * order (deadline, name, as the list sorts them). A row whose status is not
 * among the statuses has no group to stand in and is left out; the status
 * lists cover their models' statuses, as their tests check.
 */
export function groupRows<K extends string, R>(
  rows: readonly R[],
  statuses: readonly K[],
  statusOf: (row: R) => K,
): { status: K; rows: R[] }[] {
  const groups = new Map<K, R[]>(statuses.map((s) => [s, []]));
  for (const row of rows) groups.get(statusOf(row))?.push(row);
  return statuses.map((status) => ({ status, rows: groups.get(status) ?? [] }));
}
