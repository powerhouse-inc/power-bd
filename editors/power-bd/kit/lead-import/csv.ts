/** A table read from CSV text: its first row as headers, then the data rows. */
export type CsvTable = { headers: string[]; rows: string[][] };

/** The separator a CSV uses: the most frequent of comma, semicolon and tab in its first line, outside quotes. */
export function detectSeparator(text: string): string {
  const firstLine: string[] = [];
  let quoted = false;
  for (const ch of text) {
    if (ch === '"') quoted = !quoted;
    else if (!quoted && (ch === "\n" || ch === "\r")) break;
    else if (!quoted) firstLine.push(ch);
  }
  const count = (sep: string) => firstLine.filter((c) => c === sep).length;
  return [",", ";", "\t"].reduce((best, sep) => (count(sep) > count(best) ? sep : best), ",");
}

/**
 * Reads CSV as spreadsheets write it: fields in double quotes may hold the
 * separator, line breaks and doubled quotes (""); lines end in LF, CRLF or
 * CR; a byte-order mark is dropped; empty lines are skipped; short rows are
 * padded to the header's length.
 */
export function parseCsv(text: string, separator = detectSeparator(text)): CsvTable {
  const src = text.startsWith("﻿") ? text.slice(1) : text;
  const records: string[][] = [];
  let field = "";
  let row: string[] = [];
  let quoted = false;
  let i = 0;
  const endRow = () => {
    row.push(field);
    field = "";
    if (row.some((f) => f.trim() !== "")) records.push(row);
    row = [];
  };
  while (i < src.length) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        field += '"';
        i += 2;
        continue;
      }
      if (ch === '"') quoted = false;
      else field += ch;
      i++;
      continue;
    }
    if (ch === '"' && field === "") quoted = true;
    else if (ch === separator) {
      row.push(field);
      field = "";
    } else if (ch === "\r" || ch === "\n") {
      endRow();
      if (ch === "\r" && src[i + 1] === "\n") i++;
    } else field += ch;
    i++;
  }
  if (field !== "" || row.length > 0) endRow();
  const [headers = [], ...rows] = records;
  const width = headers.length;
  return {
    headers: headers.map((h) => h.trim()),
    rows: rows.map((r) => (r.length < width ? [...r, ...Array<string>(width - r.length).fill("")] : r)),
  };
}
