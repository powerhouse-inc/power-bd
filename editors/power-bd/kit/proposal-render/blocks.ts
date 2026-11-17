import type { FileRef } from "document-models/proposal";
import { parseProse, type ProsePart, type Span } from "./prose.js";

export type { ProsePart, Span } from "./prose.js";

export type TableRow = {
  cells: string[];
  /** A package's own row heads its deliverables; the total closes the table. */
  role?: "group" | "total";
};

/**
 * One block of the rendered proposal. The markdown export and the preview are
 * both made from these, so they cannot disagree.
 */
export type DocBlock =
  | { kind: "title"; text: string }
  /** Label and value lines; a value of null is a blank to fill in by hand. */
  | { kind: "fields"; rows: { label: string; value: string | null }[] }
  | { kind: "contents"; items: { id: string; title: string }[] }
  | { kind: "heading"; level: 2 | 3 | 4; text: string; id?: string }
  /** A text a person wrote, kept as written (`source`) and read as markdown (`parts`). */
  | { kind: "prose"; source: string; parts: ProsePart[] }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: Span[][] }
  /** One tick box per item, for the client to choose. */
  | { kind: "ticks"; items: Span[][] }
  | {
      kind: "table";
      header: string[];
      rows: TableRow[];
      /** The columns that hold amounts or dates, set to the right. */
      numeric: number[];
      /** The columns that hold codes, kept as narrow as their codes. */
      codes?: number[];
    }
  /** A picture, by the reference of its file and the type the proposal keeps for it. */
  | { kind: "figure"; caption: string; ref: FileRef["ref"]; type: string };

export const prose = (source: string): DocBlock => ({
  kind: "prose",
  source,
  parts: parseProse(source),
});

const cell = (text: string) =>
  text.replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ");

const spanText = (spans: Span[]) =>
  spans.map((s) => (s.strong ? `**${s.text}**` : s.text)).join("");

function tableText(header: string[], rows: TableRow[]): string {
  const line = (cells: string[]) =>
    `|${cells.map((c) => (c === "" ? " " : ` ${c} `)).join("|")}|`;
  return [
    line(header),
    line(header.map(() => "---")),
    ...rows.map((r) =>
      line(
        r.cells.map((c) =>
          r.role === "total" && c !== "" ? `**${cell(c)}**` : cell(c),
        ),
      ),
    ),
  ].join("\n");
}

/** One block as markdown; a figure points at its file by reference. */
export function blockText(block: DocBlock): string {
  switch (block.kind) {
    case "title":
      return `# ${block.text}`;
    case "fields":
      return block.rows
        .map((r) => `${r.label}: ${r.value ?? "____________"}`)
        .join("  \n");
    case "contents":
      return (
        "## Contents\n\n" +
        block.items.map((s, i) => `${i + 1}. ${s.title}`).join("\n")
      );
    case "heading":
      return `${"#".repeat(block.level)} ${block.text}`;
    case "prose":
      return block.source;
    case "paragraph":
      return block.text;
    case "list":
      return block.items.map((i) => `- ${spanText(i)}`).join("\n");
    case "ticks":
      return block.items.map((i) => `- [ ] ${spanText(i)}`).join("\n");
    case "table":
      return tableText(block.header, block.rows);
    case "figure":
      return `![${block.caption}](${block.ref})`;
  }
}

/** The blocks as one markdown document. */
export function blocksToMarkdown(blocks: readonly DocBlock[]): string {
  return blocks.map(blockText).join("\n\n") + "\n";
}
