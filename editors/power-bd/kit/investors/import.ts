/** Turns pasted lines ("name, website, list it came from") into rows for one ADD_ROWS action. */

export interface ImportRow {
  id: string;
  name: string;
  website?: string;
  sourceList?: string;
}

export interface SkippedLine {
  /** 1-based line number in the pasted text. */
  line: number;
  text: string;
}

export interface ImportResult {
  rows: ImportRow[];
  skipped: SkippedLine[];
}

/**
 * Blank lines are ignored. A line without a name, or whose name repeats an
 * earlier line of the same paste, is skipped and reported. Parts are split on
 * a tab, or on the first two commas; the third part keeps its own commas.
 */
export function parseImport(text: string, newId: () => string): ImportResult {
  const rows: ImportRow[] = [];
  const skipped: SkippedLine[] = [];
  const seen = new Set<string>();
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const parts = raw.includes("\t")
      ? raw.split("\t")
      : [...raw.split(",", 2), raw.split(",").slice(2).join(",")];
    const [name = "", website = "", sourceList = ""] = parts.map((p) =>
      p.trim(),
    );
    const key = name.toLowerCase();
    if (!name || seen.has(key)) {
      skipped.push({ line: i + 1, text: line });
      return;
    }
    seen.add(key);
    const row: ImportRow = { id: newId(), name };
    if (website) row.website = website;
    if (sourceList) row.sourceList = sourceList;
    rows.push(row);
  });
  return { rows, skipped };
}
