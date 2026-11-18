/**
 * Confidential items stay out of the chat (K3, FR-17.4): what a tool returns
 * is cleaned before the model reads it. Leads and opportunities keep their
 * confidential items under `confidentialItems`; wherever that key turns up in
 * a result, its items are replaced by how many were withheld.
 *
 * A filtered read returns the filter's match without the key around it, so a
 * filter on a BD record must start at one named field other than those items
 * (`$.global.nextSteps…`). Anything that could reach them, a wildcard, a
 * descent or a quoted name with escapes, is refused before the model sees it.
 */

/** What stands where confidential items were withheld. */
export const WITHHELD_NOTE =
  "Confidential items stay out of the chat. People read them on the record in Power BD.";

const FILTER_REFUSED =
  "Refused: this filter could reach a BD record's confidential items, which stay out of the chat. Start the filter at one named field, such as $.global.nextSteps, or read the record without a filter.";

/** `$.global.<field>` or `$['global']['<field>']`, and the field's name. */
const FIELD_START =
  /^\$(?:\.(?:global|local)|\[\s*(['"])(?:global|local)\1\s*\])(?:\.([A-Za-z_$][\w$-]*)|\[\s*(['"])([A-Za-z_$][\w$-]*)\3\s*\])(?=$|[.[])/;

/** What stands in for confidential items in a tool result. */
export interface Withheld {
  withheld: number | null;
  note: string;
}

/** A tool's result, MCP envelope or plain value, with confidential items withheld. */
export function redactToolResult(args: Record<string, unknown>, raw: unknown): unknown {
  if (!isEnvelope(raw)) return withhold(raw);
  if (filterMayReachConfidential(args.filter) && readsBdRecord(raw.structuredContent)) {
    return { isError: true, content: [{ type: "text", text: `Error: ${FILTER_REFUSED}` }] };
  }
  return {
    ...raw,
    ...(raw.structuredContent !== undefined
      ? { structuredContent: withhold(raw.structuredContent) }
      : {}),
    content: raw.content.map((part) =>
      isTextPart(part) ? { ...part, text: withholdInText(part.text) } : part,
    ),
  };
}

/** Whether a read's filter could select a record's confidential items. */
function filterMayReachConfidential(filter: unknown): boolean {
  if (typeof filter !== "string" || filter.trim() === "") return false;
  const start = FIELD_START.exec(filter.trim());
  if (!start) return true;
  // The field is the dotted name or the quoted one; the other group is unmatched.
  return (start[2] || start[4]) === "confidentialItems";
}

/** Whether a result is a read of a BD record: a document view of a `powerbd/` type. */
function readsBdRecord(result: unknown): boolean {
  return (
    isObject(result) &&
    Object.values(result).some(
      (view) =>
        isObject(view) &&
        typeof view.documentType === "string" &&
        view.documentType.startsWith("powerbd/"),
    )
  );
}

interface Envelope {
  content: unknown[];
  structuredContent?: unknown;
  isError?: boolean;
}

function isEnvelope(value: unknown): value is Envelope {
  return isObject(value) && Array.isArray(value.content);
}

function isTextPart(part: unknown): part is { type: "text"; text: string } {
  return isObject(part) && part.type === "text" && typeof part.text === "string";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** JSON text is cleaned like the value it holds; prose is left as it is. */
function withholdInText(text: string): string {
  try {
    const parsed: unknown = JSON.parse(text);
    return parsed !== null && typeof parsed === "object"
      ? JSON.stringify(withhold(parsed))
      : text;
  } catch {
    return text;
  }
}

function withhold(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withhold);
  if (!isObject(value)) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) =>
      key === "confidentialItems" ? [key, withheld(child)] : [key, withhold(child)],
    ),
  );
}

function withheld(items: unknown): unknown {
  if (Array.isArray(items) && items.length === 0) return items;
  const note: Withheld = { withheld: countOf(items), note: WITHHELD_NOTE };
  return note;
}

/** How many items there were: a list's length, or the `count` a summary gives. */
function countOf(items: unknown): number | null {
  if (Array.isArray(items)) return items.length;
  return isObject(items) && typeof items.count === "number" ? items.count : null;
}
