/** Matching and ranking: every typed word must be found; a title match comes first. Pure. */
import { highlight, type Segment } from "../lead-view/highlight.js";
import type { Entry, Field } from "./types.js";

/** One letter without its case or accents. It may come out as none, or as several. */
const fold = (char: string) =>
  char
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");

/** A text without case or accents, for comparing. */
export function normalise(text: string): string {
  return fold(text);
}

/** The words of a query, normalised, each once. */
export function queryWords(query: string): string[] {
  return [...new Set(normalise(query).split(/\s+/).filter(Boolean))];
}

export type Hit = {
  entry: Entry;
  /** 0: the title starts with the query; 1: every word is in the title; 2: a word was found elsewhere. */
  rank: 0 | 1 | 2;
  /** The field that matched, when it is not the title and not already on the row. */
  field: Field | null;
};

/** Whether the row already shows this text, as its tag or in its quiet line. */
const onTheRow = (entry: Entry, field: Field) =>
  entry.tag?.label === field.text ||
  (entry.detail?.includes(field.text) ?? false);

function hitFor(entry: Entry, words: readonly string[]): Hit | null {
  const title = normalise(entry.title);
  const outside = words.filter((w) => !title.includes(w));
  if (outside.length === 0)
    return {
      entry,
      rank: title.startsWith(words.join(" ")) ? 0 : 1,
      field: null,
    };
  const texts = entry.fields.map((f) => normalise(f.text));
  if (!outside.every((w) => texts.some((t) => t.includes(w)))) return null;
  // The first field holding each word still to find; one the row shows needs no naming.
  const holders = outside.map(
    (w) => entry.fields[texts.findIndex((t) => t.includes(w))],
  );
  const field = holders.find((f) => !onTheRow(entry, f)) ?? null;
  return { entry, rank: 2, field };
}

/** The entries that hold every word of the query, best first. Nothing for an empty query. */
export function search(entries: readonly Entry[], query: string): Hit[] {
  const words = queryWords(query);
  if (words.length === 0) return [];
  return entries
    .flatMap((e) => hitFor(e, words) ?? [])
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        (b.entry.changedAt ?? "").localeCompare(a.entry.changedAt ?? "") ||
        a.entry.title.localeCompare(b.entry.title, "en", {
          sensitivity: "base",
        }),
    );
}

/** `text` normalised, with the place in `text` each normalised letter came from. */
function folded(text: string): { folded: string; at: number[] } {
  let out = "";
  const at: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const letters = fold(text[i]);
    out += letters;
    for (let n = 0; n < letters.length; n++) at.push(i);
  }
  return { folded: out, at };
}

/** Where the typed words stand in `text`, as offsets in `text` itself. */
function ranges(text: string, words: readonly string[]) {
  const { folded: hay, at } = folded(text);
  const found: { start: number; end: number }[] = [];
  for (const word of words)
    for (
      let i = hay.indexOf(word);
      i !== -1;
      i = hay.indexOf(word, i + word.length)
    )
      found.push({ start: at[i], end: at[i + word.length - 1] + 1 });
  return found;
}

/** `text` cut into plain and matched pieces, for showing what was found. */
export function marks(text: string, words: readonly string[]): Segment[] {
  return highlight(text, ranges(text, words));
}

/**
 * A long text cut to about `max` letters around the first typed word found in
 * it, with "…" where it was cut. A short text is kept whole.
 */
export function excerpt(
  text: string,
  words: readonly string[],
  max = 80,
): string {
  if (text.length <= max) return text;
  const first = ranges(text, words).sort((a, b) => a.start - b.start).at(0);
  const lead = Math.floor(max / 4);
  let start = first && first.start > lead ? first.start - lead : 0;
  if (start + max > text.length) start = text.length - max;
  const end = start + max;
  // Move the cuts to word edges, inwards, so no word shows in half.
  const from = start === 0 ? 0 : text.indexOf(" ", start) + 1;
  const to = end === text.length ? end : text.lastIndexOf(" ", end);
  const cut = text.slice(from, to > from ? to : end).trim();
  return `${start === 0 ? "" : "…"}${cut}${end === text.length ? "" : "…"}`;
}
