/**
 * Citations in the agent's answers, shown as the vault's own chat shows them.
 * The vault's tools ask the model to cite each document it answers from as
 * `[[documentId]]`. The reader sees a numbered chip there and, under the
 * answer, "From the vault": each document by number, kind and title, opening
 * it in the vault app. A marker naming a document id that no vault document
 * the conversation knows has (a BD record, an id the model made up) is left
 * out of the text; any other marker that names nothing (a wiki link quoted
 * from a note) is left as its words.
 *
 * Pure: the conversation and where documents open come in, the messages to
 * show go out. Only what is shown changes; the model's history keeps its
 * markers. The chips come through the stack's markdown: an inline chip is a
 * link around one inline code, the row an h6, a list of links and a line
 * (styled in design-system/components.css, Chat).
 */
import type { ChatMessage, ChatPart } from "@powerhousedao/reactor-browser/ai";

/** A document an answer can cite, as the vault's tools name it. */
export interface CitedDocument {
  documentId: string;
  title: string;
  documentType?: string;
  /** The vault the tool read, when the model named one. */
  driveId?: string;
}

/** What the conversation's citations are resolved against. */
export interface CitationSource {
  /** Whether a tool reads the vault; only its results name citable documents. */
  readsVault: (toolName: string) => boolean;
  /** What the vault's copy says of a document: its type, and the name it is filed under. */
  lookUp: (documentId: string) => { documentType?: string; name?: string } | undefined;
  /** Where a vault document opens; undefined when it cannot be placed. */
  hrefFor: (document: CitedDocument) => string | undefined;
}

/** Most values one result is walked through for documents. */
const MAX_WALK = 20_000;
const MAX_DEPTH = 12;
/** Longest title kept for a document a long result named. */
const MAX_TITLE = 200;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** A tool result as the model got it: a value, or JSON text. */
function parsed(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}

/**
 * Every document a value names, as the vault's tools give them: an object
 * with a `documentId` and a `title`, at any depth, the first mention first.
 */
export function documentsIn(value: unknown, limit = Number.POSITIVE_INFINITY): CitedDocument[] {
  const found = new Map<string, CitedDocument>();
  let walked = 0;
  const walk = (v: unknown, depth: number) => {
    if (found.size >= limit || walked++ > MAX_WALK || depth > MAX_DEPTH) return;
    if (Array.isArray(v)) {
      for (const item of v) walk(item, depth + 1);
      return;
    }
    if (!isRecord(v)) return;
    const { documentId, title, documentType } = v;
    if (typeof documentId === "string" && documentId && typeof title === "string" && title.trim()) {
      const known = found.get(documentId);
      const type = typeof documentType === "string" && documentType ? { documentType } : {};
      if (!known) found.set(documentId, { documentId, title: title.trim().slice(0, MAX_TITLE), ...type });
      else if (!known.documentType) found.set(documentId, { ...known, ...type });
    }
    for (const child of Object.values(v)) walk(child, depth + 1);
  };
  walk(parsed(value), 0);
  return [...found.values()];
}

type ToolPart = Extract<ChatPart, { type: "tool" }>;

/** The vault a tool call read, when the model named one. */
function driveOf(part: ToolPart): string | undefined {
  const driveId = isRecord(part.args) ? part.args.driveId : undefined;
  return typeof driveId === "string" && driveId ? driveId : undefined;
}

const harvests = new WeakMap<CitationSource["readsVault"], WeakMap<ChatMessage, CitedDocument[]>>();

/** The documents one message's vault tools named; each message is walked once. */
function harvest(message: ChatMessage, readsVault: CitationSource["readsVault"]): CitedDocument[] {
  let byMessage = harvests.get(readsVault);
  if (!byMessage) harvests.set(readsVault, (byMessage = new WeakMap()));
  let docs = byMessage.get(message);
  if (!docs) {
    docs = message.parts
      .filter((p): p is ToolPart => p.type === "tool" && p.state === "done" && readsVault(p.name))
      .flatMap((p) => {
        const driveId = driveOf(p);
        return documentsIn(p.result).map((d) => (driveId ? { ...d, driveId } : d));
      });
    byMessage.set(message, docs);
  }
  return docs;
}

/** Every document the conversation's vault tools named, by id; the first mention wins, a type fills in. */
export function knownDocuments(
  messages: readonly ChatMessage[],
  readsVault: CitationSource["readsVault"],
): Map<string, CitedDocument> {
  const known = new Map<string, CitedDocument>();
  for (const message of messages)
    for (const doc of harvest(message, readsVault)) {
      const before = known.get(doc.documentId);
      if (!before) known.set(doc.documentId, doc);
      else if (!before.documentType && doc.documentType)
        known.set(doc.documentId, { ...before, documentType: doc.documentType });
    }
  return known;
}

/** The kind the vault names a document by on its chips; none for a note. */
export function vaultKind(documentType: string | undefined): string | null {
  switch (documentType) {
    case undefined:
    case "bai/knowledge-note":
      return null;
    case "bai/moc":
      return "MoC";
    case "bai/research-claim":
      return "claim";
    case "bai/wbs":
      return "WBS";
    case "powerhouse/scopeofwork":
      return "scope";
    default:
      return documentType.replace(/^bai\//, "");
  }
}

/** A marker as models write it: `[[id]]`, `[[id#anchor]]`, `[[id|label]]`, `[[[id]]]`, or a title. */
const MARKER = / ?\[\[\[?([^[\]\n]+?)\]\]\]?/g;
/** The same document's chip twice or more in a row, as a marker repeated with another anchor leaves it. */
const REPEATED_CHIP = /( \[`\d+`\]\([^)\s]*\))(?:\s*\1)+/g;

/** A marker's document: its id or title, without an anchor or a label. */
function keyOf(label: string): string {
  return label.split("|")[0].split("#")[0].trim();
}

/** A marker's words, as a wiki link shows them: its label, else its target. */
function wordsOf(label: string): string {
  const bar = label.indexOf("|");
  const shown = bar === -1 ? "" : label.slice(bar + 1).trim();
  return shown || keyOf(label);
}

/** A document id: the reactor's 43-character ids, or a UUID. */
const DOCUMENT_ID = /^(?:[A-Za-z0-9_-]{43}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

/** The ids an answer's markers name, in order (titles included). */
export function citedKeys(text: string): string[] {
  return [...text.matchAll(MARKER)].map((m) => keyOf(m[1]));
}

/** Text for inside a markdown link: one line, with markdown's own characters escaped. */
function escaped(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[\\`*_[\]<>~]/g, (c) => `\\${c}`);
}

/** An href markdown keeps whole: spaces, brackets and angle brackets percent-encoded. */
const safeHref = (href: string) =>
  href.replace(/[\s()<>]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")}`);

/** The vault document a marker names, or undefined when it names none. */
function resolve(
  label: string,
  known: ReadonlyMap<string, CitedDocument>,
  titles: ReadonlyMap<string, CitedDocument>,
  source: CitationSource,
): CitedDocument | undefined {
  const key = keyOf(label);
  let doc = known.get(key) ?? titles.get(key.toLowerCase());
  const filed = source.lookUp(doc?.documentId ?? key);
  if (!doc && filed?.name) doc = { documentId: key, title: filed.name };
  if (!doc) return undefined;
  const documentType = doc.documentType ?? filed?.documentType;
  if (documentType?.startsWith("powerbd/")) return undefined;
  return documentType ? { ...doc, documentType } : doc;
}

interface Cited {
  n: number;
  doc: CitedDocument;
  href: string;
}

/** How many times the answer asked the vault. */
function searchesIn(message: ChatMessage, readsVault: CitationSource["readsVault"]): number {
  return message.parts.filter((p) => p.type === "tool" && readsVault(p.name)).length;
}

/** "From the vault": each cited document by number, kind and title, and how many searches found them. */
export function sourcesRow(cited: readonly Cited[], searches: number): string {
  const chips = cited.map(({ n, doc, href }) => {
    const kind = vaultKind(doc.documentType);
    return `- [\`${n}\`${kind ? ` \`${kind}\`` : ""} *${escaped(doc.title)}*](${safeHref(href)})`;
  });
  const found =
    searches > 0 ? ["", `Found with ${searches} ${searches === 1 ? "search" : "searches"} of the vault.`] : [];
  return ["###### From the vault", "", ...chips, ...found].join("\n");
}

/**
 * One message as it is shown: each marker a numbered chip, the same number
 * for the same document, and, once the answer has ended, the row under it.
 */
export function citeAnswer(
  message: ChatMessage,
  known: ReadonlyMap<string, CitedDocument>,
  source: CitationSource,
  ended: boolean,
): ChatMessage {
  if (message.role !== "assistant") return message;
  const titles = new Map([...known.values()].map((d) => [d.title.toLowerCase(), d]));
  const cited = new Map<string, Cited>();
  const parts: ChatPart[] = message.parts.map((part) => {
    if (part.type !== "text" || !part.text.includes("[[")) return part;
    const text = part.text.replace(MARKER, (marker: string, label: string) => {
      const doc = resolve(label, known, titles, source);
      const href = doc && source.hrefFor(doc);
      if (!doc || !href)
        return DOCUMENT_ID.test(keyOf(label)) ? "" : `${marker.startsWith(" ") ? " " : ""}${escaped(wordsOf(label))}`;
      let entry = cited.get(doc.documentId);
      if (!entry) cited.set(doc.documentId, (entry = { n: cited.size + 1, doc, href }));
      return ` [\`${entry.n}\`](${safeHref(entry.href)})`;
    });
    return { ...part, text: text.replace(REPEATED_CHIP, "$1") };
  });
  // Only an answer with a marker changes; a row needs a citation, so a marker too.
  if (parts.every((part, i) => part === message.parts[i])) return message;
  if (ended && cited.size > 0)
    parts.push({ type: "text", text: sourcesRow([...cited.values()], searchesIn(message, source.readsVault)) });
  return { ...message, parts };
}

/** The conversation as it is shown; the answer still coming gets its row once it ends. */
export function citeConversation(
  messages: readonly ChatMessage[],
  source: CitationSource,
  streaming: boolean,
): ChatMessage[] {
  const known = knownDocuments(messages, source.readsVault);
  const last = messages.length - 1;
  return messages.map((m, i) => citeAnswer(m, known, source, !(streaming && i === last)));
}
