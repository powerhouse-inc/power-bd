/** A run of text in the rendered document, with how it is set. */
export type Span = {
  text: string;
  strong?: true;
  em?: true;
  code?: true;
  /** A web or mail address the text links to. */
  href?: string;
};

/** A piece of a text a person wrote: what the preview shows for its markdown. */
export type ProsePart =
  | { kind: "paragraph"; spans: Span[] }
  | { kind: "heading"; level: 3 | 4; spans: Span[] }
  | { kind: "list"; ordered: boolean; items: Span[][] };

const INLINE =
  /\*\*(.+?)\*\*|\*([^*\s][^*]*?)\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;
const SAFE_LINK = /^(https?:\/\/|mailto:)/i;

/** The spans of one text: strong, emphasis, code and links; everything else as written. */
export function parseInline(text: string): Span[] {
  const spans: Span[] = [];
  const plain = (s: string) => {
    if (s === "") return;
    const last = spans.at(-1);
    if (last && Object.keys(last).length === 1) last.text += s;
    else spans.push({ text: s });
  };
  let at = 0;
  for (const m of text.matchAll(INLINE)) {
    plain(text.slice(at, m.index));
    at = m.index + m[0].length;
    const [, strong, em, code, label, href]: (string | undefined)[] = m;
    if (strong) spans.push({ text: strong, strong: true });
    else if (em) spans.push({ text: em, em: true });
    else if (code) spans.push({ text: code, code: true });
    else if (label && href && SAFE_LINK.test(href))
      spans.push({ text: label, href });
    else if (label) plain(label);
  }
  plain(text.slice(at));
  return spans;
}

const HEADING = /^(#{1,6})\s+(.*)$/;
const BULLET = /^\s*[-*+]\s+(.*)$/;
const NUMBER = /^\s*\d+[.)]\s+(.*)$/;

/**
 * The paragraphs, lists and headings of a text written as markdown. A section's
 * title is the document's level 2, so a heading in its text starts at level 3.
 */
export function parseProse(text: string): ProsePart[] {
  const parts: ProsePart[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flush = () => {
    if (paragraph.length > 0)
      parts.push({ kind: "paragraph", spans: parseInline(paragraph.join("\n")) });
    if (list)
      parts.push({
        kind: "list",
        ordered: list.ordered,
        items: list.items.map(parseInline),
      });
    paragraph = [];
    list = null;
  };
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trimEnd();
    if (line.trim() === "") {
      flush();
      continue;
    }
    const heading = HEADING.exec(line);
    if (heading) {
      flush();
      parts.push({
        kind: "heading",
        level: heading[1].length > 3 ? 4 : 3,
        spans: parseInline(heading[2]),
      });
      continue;
    }
    const bullet = BULLET.exec(line);
    const item = bullet ?? NUMBER.exec(line);
    if (item) {
      const ordered = !bullet;
      if (!list || list.ordered !== ordered) {
        flush();
        list = { ordered, items: [] };
      }
      list.items.push(item[1]);
      continue;
    }
    if (list && /^\s/.test(line)) {
      list.items[list.items.length - 1] += ` ${line.trim()}`;
      continue;
    }
    if (list) flush();
    paragraph.push(line.trim());
  }
  flush();
  return parts;
}
