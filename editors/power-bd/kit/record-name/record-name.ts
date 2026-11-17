/** The name a record goes by, read from its state, and when its entry in the team's space lags behind it. */

/** The field of its state each kind of record is named by. The single records (settings, playbook, investor list) have none. */
const NAMED_BY: Partial<Record<string, string>> = {
  "powerbd/lead": "name",
  "powerbd/opportunity": "name",
  "powerbd/contact": "name",
  "powerbd/decision": "question",
  "powerbd/proposal": "title",
};

const field = (from: unknown, key: string): unknown =>
  typeof from === "object" && from !== null
    ? (from as Record<string, unknown>)[key]
    : undefined;

/** A record's title from its state (`{ global }`); null when the kind has none or it is still empty. */
export function recordTitle(
  documentType: string | undefined,
  state: unknown,
): string | null {
  const key = documentType ? NAMED_BY[documentType] : undefined;
  if (!key) return null;
  const value = field(field(state, "global"), key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * The name to give a record's entry: its title, when a name it is stored under
 * (the entry's, the document's) differs from it. Null when all are in step.
 */
export function nameToSync(
  title: string | null,
  names: readonly (string | null | undefined)[],
): string | null {
  if (!title) return null;
  return names.some((n) => n != null && n !== title) ? title : null;
}
