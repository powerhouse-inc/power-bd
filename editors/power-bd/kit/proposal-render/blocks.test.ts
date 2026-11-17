import { describe, expect, it } from "vitest";
import type { ProposalState } from "document-models/proposal";
import { emptyProposal, workedExample } from "../proposal-totals/fixtures.js";
import { blocksToMarkdown, type DocBlock } from "./blocks.js";
import {
  proposalBlocks,
  renderProposal,
  type RenderNames,
} from "./proposal-render.js";

const names: RenderNames = {
  clientName: "Northwind Ltd",
  recipientName: "Ada Example",
  contractingEntityTitle: "Acme Contracting BV",
};

const sec = (
  id: string,
  kind: ProposalState["sections"][number]["kind"],
  title: string | null = null,
  body: string | null = null,
) => ({ id, kind, title, body, positioningId: null });

const kinds = (blocks: DocBlock[]) => blocks.map((b) => b.kind);
const of = <K extends DocBlock["kind"]>(blocks: DocBlock[], kind: K) =>
  blocks.filter((b): b is Extract<DocBlock, { kind: K }> => b.kind === kind);

describe("proposalBlocks", () => {
  it("opens with the title, the parties and the contents", () => {
    const blocks = proposalBlocks(
      emptyProposal({
        title: "Briefing Platform",
        sections: [sec("s1", "PROSE", "About us", "We build **things**.")],
      }),
      names,
    );
    expect(blocks.slice(0, 3)).toEqual([
      { kind: "title", text: "Briefing Platform" },
      {
        kind: "fields",
        rows: [
          { label: "Code", value: "BRI" },
          {
            label: "Prepared for",
            value: "Northwind Ltd, attention Ada Example",
          },
          { label: "Contracting entity", value: "Acme Contracting BV" },
        ],
      },
      { kind: "contents", items: [{ id: "s1", title: "About us" }] },
    ]);
    expect(blocks.slice(3)).toEqual([
      { kind: "heading", level: 2, text: "About us", id: "s1" },
      {
        kind: "prose",
        source: "We build **things**.",
        parts: [
          {
            kind: "paragraph",
            spans: [
              { text: "We build " },
              { text: "things", strong: true },
              { text: "." },
            ],
          },
        ],
      },
    ]);
  });

  it("leaves the code out of the parties when there is none", () => {
    const [, fields] = proposalBlocks(emptyProposal({ code: null }), names);
    expect(fields).toMatchObject({
      rows: [{ label: "Prepared for" }, { label: "Contracting entity" }],
    });
  });

  const priced: ProposalState = {
    ...workedExample(),
    validUntil: "2027-01-31T00:00:00.000Z",
    packages: workedExample().packages.map((p, i) => ({
      ...p,
      targetDate: i === 0 ? "2027-03-01T00:00:00.000Z" : null,
    })),
    sections: [
      sec("pr", "PRICING"),
      sec("sh", "SCHEDULE"),
      sec("ac", "ACCEPTANCE"),
    ],
  };
  const blocks = proposalBlocks(priced, names);

  it("marks package rows and the total in a price table, with amounts to the right", () => {
    const table = of(blocks, "table")[0];
    expect(table.header).toEqual(["Code", "Item", "Price"]);
    expect(table.numeric).toEqual([2]);
    expect(table.codes).toEqual([0]);
    expect(table.rows[0].role).toBe("group");
    expect(table.rows[1].role).toBeUndefined();
    expect(table.rows.at(-1)).toEqual({
      cells: ["", "Total", "€16,000.00"],
      role: "total",
    });
  });

  it("gives payment steps as a table under their own heading", () => {
    const at = blocks.findIndex(
      (b) => b.kind === "heading" && b.text === "Payments",
    );
    expect(blocks[at]).toMatchObject({ level: 4 });
    expect(blocks[at + 1]).toMatchObject({
      kind: "table",
      header: ["Payment", "When", "Amount"],
      numeric: [2],
    });
  });

  it("shows stored dates as days", () => {
    const schedule = of(blocks, "table").find(
      (t) => t.header[1] === "Target date",
    );
    expect(schedule?.rows[0].cells[1]).toBe("2027-03-01");
    expect(of(blocks, "fields").at(-1)?.rows[0]).toEqual({
      label: "Valid until",
      value: "2027-01-31",
    });
  });

  it("gives one tick box per option and blanks to sign", () => {
    const ticks = of(blocks, "ticks")[0];
    expect(ticks.items).toHaveLength(priced.options.length);
    expect(ticks.items[0][0]).toEqual({
      text: priced.options[0].label,
      strong: true,
    });
    expect(of(blocks, "fields").at(-1)?.rows.slice(1)).toEqual([
      { label: "Signed for Northwind Ltd by Ada Example", value: null },
      { label: "Signed for Acme Contracting BV", value: null },
    ]);
  });

  it("gives a figure as its caption, file reference and type", () => {
    const withFigure = proposalBlocks(
      emptyProposal({
        sections: [sec("s", "PROSE", "Screens")],
        figures: [
          {
            id: "f",
            anchorKind: "SECTION",
            anchorId: "s",
            caption: null,
            file: {
              ref: "attachment://v1:x",
              name: "x.png",
              type: "image/png",
            },
          },
        ],
      }),
      names,
    );
    expect(withFigure.at(-1)).toEqual({
      kind: "figure",
      caption: "x.png",
      ref: "attachment://v1:x",
      type: "image/png",
    });
  });

  it("never gives an empty list, table or text", () => {
    const bare = proposalBlocks(
      emptyProposal({
        sections: [
          sec("a", "SCOPE"),
          sec("b", "ASSUMPTIONS"),
          sec("c", "DELIVERABLES"),
          sec("d", "PRICING"),
          sec("e", "SCHEDULE"),
          sec("f", "TERMS"),
          sec("g", "ANNEXES"),
        ],
      }),
      names,
    );
    expect(kinds(bare.slice(3))).toEqual(Array(7).fill("heading"));
  });
});

describe("blocksToMarkdown", () => {
  it("is what renderProposal returns", () => {
    const state = emptyProposal({ sections: [sec("s", "PROSE", "One", "x")] });
    expect(blocksToMarkdown(proposalBlocks(state, names))).toBe(
      renderProposal(state, names),
    );
  });
  it("writes each kind of block", () => {
    expect(
      blocksToMarkdown([
        { kind: "title", text: "T" },
        {
          kind: "fields",
          rows: [
            { label: "A", value: "1" },
            { label: "B", value: null },
          ],
        },
        { kind: "contents", items: [{ id: "x", title: "One" }] },
        { kind: "heading", level: 3, text: "H" },
        { kind: "paragraph", text: "P" },
        {
          kind: "list",
          items: [[{ text: "k", strong: true }, { text: " v" }]],
        },
        { kind: "ticks", items: [[{ text: "pick" }]] },
        {
          kind: "table",
          header: ["H1", "H2"],
          numeric: [1],
          rows: [
            { cells: ["a|b", "line\nbreak"] },
            { cells: ["", "9"], role: "total" },
          ],
        },
        {
          kind: "figure",
          caption: "C",
          ref: "attachment://v1:r",
          type: "image/png",
        },
      ]),
    ).toBe(
      [
        "# T",
        "A: 1  \nB: ____________",
        "## Contents\n\n1. One",
        "### H",
        "P",
        "- **k** v",
        "- [ ] pick",
        "| H1 | H2 |\n| --- | --- |\n| a\\|b | line break |\n| | **9** |",
        "![C](attachment://v1:r)",
      ].join("\n\n") + "\n",
    );
  });
});
