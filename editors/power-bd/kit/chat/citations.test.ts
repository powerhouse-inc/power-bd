import type { ChatMessage, ChatPart } from "@powerhousedao/reactor-browser/ai";
import { describe, expect, it } from "vitest";
import {
  citeAnswer,
  citeConversation,
  citedKeys,
  documentsIn,
  knownDocuments,
  sourcesRow,
  vaultKind,
  type CitationSource,
  type CitedDocument,
} from "./citations.js";

const DESK = { documentId: "vi3ugJcBguoZ_dfBHAuX0MaBj77nMYdOUixfnIASNtE", title: "Desk research on Brisa Labs", documentType: "bai/source" };
const BUDGET = { documentId: "B0TdV_B5an-qhVncBEm-PxXHvXO_iQ2JHewClml7OFI", title: "The finance lead holds the reporting budget", documentType: "bai/knowledge-note" };
const LEAD_ID = "CqevbwG4YvnWX2Nm8erZQy_O1vBFAiT0Vl3jXHk_GVw";
const MADE_UP = "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz";
const NOWHERE = "0b0e8a4e-1c1d-4b8e-9a51-6f3e0c2d7a10";
const ORVANE = "AYgaN9fP4_jvrtEevvg91r8A6MaB5mnYvkMZYGGEcpc";

const readsVault = (name: string) => !["getDocument", "getRecentChanges"].includes(name);

/** Where the test vault's documents open; one document cannot be placed. */
const source = (filed: Record<string, { documentType?: string; name?: string }> = {}): CitationSource => ({
  readsVault,
  lookUp: (id) => filed[id],
  hrefFor: (doc: CitedDocument) =>
    doc.documentId === NOWHERE ? undefined : `https://vault.test/d/${doc.driveId ?? "knowledge-vault"}/${doc.documentId}`,
});
const hrefOf = (doc: { documentId: string }) => `https://vault.test/d/knowledge-vault/${doc.documentId}`;

function tool(name: string, result: unknown, args: unknown = {}, state: "done" | "error" = "done"): ChatPart {
  return { type: "tool", toolCallId: `${name}-1`, name, args, state, result };
}
const text = (t: string): ChatPart => ({ type: "text", text: t });
const answer = (...parts: ChatPart[]): ChatMessage => ({ id: "a1", role: "assistant", parts });
const searched = tool("search_vault", { results: [DESK, BUDGET] }, { query: "Brisa" });
const textsOf = (m: ChatMessage) => m.parts.flatMap((p) => (p.type === "text" ? [p.text] : []));

describe("documentsIn: the documents a tool result names", () => {
  it("finds each {documentId, title} at any depth, first mention first, its type filled in later", () => {
    const result = {
      hits: [{ node: { documentId: "a", title: "  A  " } }, { documentId: "b", title: "B", documentType: "bai/moc" }],
      related: [{ documentId: "a", title: "A again", documentType: "bai/knowledge-note" }],
    };
    expect(documentsIn(result)).toEqual([
      { documentId: "a", title: "A", documentType: "bai/knowledge-note" },
      { documentId: "b", title: "B", documentType: "bai/moc" },
    ]);
  });

  it("reads JSON text, skips what has no title, and stops at the limit", () => {
    expect(documentsIn(JSON.stringify([DESK]))).toEqual([DESK]);
    expect(documentsIn("not json")).toEqual([]);
    expect(documentsIn([{ documentId: "x", title: " " }, { documentId: "", title: "T" }, { title: "T" }])).toEqual([]);
    expect(documentsIn([DESK, BUDGET], 1)).toEqual([DESK]);
  });

  it("does not follow values nested past its depth", () => {
    let deep: unknown = DESK;
    for (let i = 0; i < 20; i++) deep = { next: deep };
    expect(documentsIn(deep)).toEqual([]);
  });
});

describe("knownDocuments: what the conversation's vault tools named", () => {
  it("keeps only the vault's finished results, with the vault the model named", () => {
    const messages = [
      answer(
        tool("getDocument", { documentId: "lead-1", title: "Cosylab" }),
        tool("search_vault", { documentId: "failed", title: "F" }, {}, "error"),
        tool("read_document", DESK, { documentId: DESK.documentId, driveId: "other-vault" }),
      ),
      answer(tool("search_vault", { ...DESK, title: "A later title" }), tool("keyword_search", { ...BUDGET, documentType: undefined })),
      answer(tool("search_vault", BUDGET)),
    ];
    const known = knownDocuments(messages, readsVault);
    expect([...known.keys()]).toEqual([DESK.documentId, BUDGET.documentId]);
    expect(known.get(DESK.documentId)).toEqual({ ...DESK, driveId: "other-vault" });
    expect(known.get(BUDGET.documentId)).toEqual(BUDGET);
    expect(knownDocuments(messages, readsVault)).toEqual(known);
  });
});

describe("vaultKind: the kind on a chip, as the vault names it", () => {
  it.each([
    [undefined, null],
    ["bai/knowledge-note", null],
    ["bai/source", "source"],
    ["bai/moc", "MoC"],
    ["bai/research-claim", "claim"],
    ["bai/wbs", "WBS"],
    ["powerhouse/scopeofwork", "scope"],
    ["bai/tension", "tension"],
    ["other/type", "other/type"],
  ])("%s → %s", (type, kind) => {
    expect(vaultKind(type)).toBe(kind);
  });
});

describe("citedKeys", () => {
  it("reads every form of marker models write", () => {
    expect(citedKeys("a [[x]] b [[y#item-3]] c [[z|Label]] d [[[w]]] e [[A title]]")).toEqual(["x", "y", "z", "w", "A title"]);
  });
});

describe("citeAnswer: an answer's markers as numbered chips", () => {
  const known = knownDocuments([answer(searched)], readsVault);

  it("numbers each document by its first mention, the same number each time, a space before it", () => {
    const shown = citeAnswer(
      answer(searched, text(`Reports are assembled by hand[[${DESK.documentId}]]. The finance lead holds the budget [[${BUDGET.documentId}#p2]] [[${BUDGET.documentId}]], as the research says [[${DESK.documentId}|desk]].`)),
      known,
      source(),
      false,
    );
    expect(textsOf(shown)).toEqual([
      `Reports are assembled by hand [\`1\`](${hrefOf(DESK)}). The finance lead holds the budget [\`2\`](${hrefOf(BUDGET)}), as the research says [\`1\`](${hrefOf(DESK)}).`,
    ]);
  });

  it("finds a document cited by its title, and one in triple brackets", () => {
    const shown = citeAnswer(answer(text(`See [[desk research on brisa labs]] and [[[${BUDGET.documentId}]]].`)), known, source(), false);
    expect(textsOf(shown)[0]).toBe(`See [\`1\`](${hrefOf(DESK)}) and [\`2\`](${hrefOf(BUDGET)}).`);
  });

  it("leaves out what it cannot open: an unknown id, a BD record, a document it cannot place", () => {
    const shown = citeAnswer(
      answer(text(`Cosylab [[${LEAD_ID}]], made up [[${MADE_UP}]], nowhere [[${NOWHERE}]].`)),
      known,
      source({ [LEAD_ID]: { documentType: "powerbd/lead", name: "Cosylab" }, [NOWHERE]: { name: "Somewhere" } }),
      true,
    );
    expect(textsOf(shown)).toEqual(["Cosylab, made up, nowhere."]);
  });

  it("keeps the words of a marker that names no document, as a wiki link quoted from a note", () => {
    const shown = citeAnswer(
      answer(text("As [[Ars Contexta]] argues, [[methodology#atomic|atomic notes]] link [[well]].")),
      known,
      source(),
      true,
    );
    expect(textsOf(shown)).toEqual(["As Ars Contexta argues, atomic notes link well."]);
    expect(textsOf(citeAnswer(answer(text("[[Ars Contexta|]] says so.")), known, source(), true))).toEqual(["Ars Contexta says so."]);
  });

  it("titles a document no result named by the name the vault files it under", () => {
    const shown = citeAnswer(answer(text(`The call [[${ORVANE}]].`)), new Map(), source({ [ORVANE]: { name: "orvane-source", documentType: "bai/source" } }), true);
    expect(textsOf(shown)).toEqual([
      `The call [\`1\`](${hrefOf({ documentId: ORVANE })}).`,
      `###### From the vault\n\n- [\`1\` \`source\` *orvane-source*](${hrefOf({ documentId: ORVANE })})`,
    ]);
  });

  it("adds the row once the answer has ended, with how many searches found it", () => {
    const ended = citeAnswer(
      answer(searched, tool("read_document", DESK), tool("getRecentChanges", {}), text(`Here [[${DESK.documentId}]] and [[${BUDGET.documentId}]].`)),
      known,
      source(),
      true,
    );
    expect(textsOf(ended).at(-1)).toBe(
      [
        "###### From the vault",
        "",
        `- [\`1\` \`source\` *Desk research on Brisa Labs*](${hrefOf(DESK)})`,
        `- [\`2\` *The finance lead holds the reporting budget*](${hrefOf(BUDGET)})`,
        "",
        "Found with 2 searches of the vault.",
      ].join("\n"),
    );
    expect(ended.parts.at(-1)).toEqual({ type: "text", text: textsOf(ended).at(-1) });
  });

  it("leaves a message without markers, and the person's own, as they are", () => {
    const plain = answer(searched, text("No vault needed."));
    expect(citeAnswer(plain, known, source(), true)).toBe(plain);
    const mine: ChatMessage = { id: "u1", role: "user", parts: [text(`[[${DESK.documentId}]]`)] };
    expect(citeAnswer(mine, known, source(), true)).toBe(mine);
  });
});

describe("sourcesRow", () => {
  it("escapes a title's markdown and an address's spaces and brackets, and says one search", () => {
    const doc = { documentId: "d", title: "Q3 [draft] *plan*_v2 `x`\nnext", documentType: "bai/source" };
    expect(sourcesRow([{ n: 1, doc, href: "https://vault.test/d/v (1)/d" }], 1)).toBe(
      [
        "###### From the vault",
        "",
        "- [`1` `source` *Q3 \\[draft\\] \\*plan\\*\\_v2 \\`x\\` next*](https://vault.test/d/v%20%281%29/d)",
        "",
        "Found with 1 search of the vault.",
      ].join("\n"),
    );
  });
});

describe("citeConversation", () => {
  it("resolves markers against the whole conversation, and keeps the row back while the answer is still coming", () => {
    const messages: ChatMessage[] = [
      { id: "u1", role: "user", parts: [text("What did the research say?")] },
      { ...answer(searched, text(`Hand-built reports [[${DESK.documentId}]].`)), id: "a1" },
      { id: "u2", role: "user", parts: [text("And the budget?")] },
      { ...answer(text(`The finance lead [[${BUDGET.documentId}]].`)), id: "a2" },
    ];
    const streaming = citeConversation(messages, source(), true);
    expect(textsOf(streaming[1]).at(-1)).toContain("###### From the vault");
    expect(textsOf(streaming[3])).toEqual([`The finance lead [\`1\`](${hrefOf(BUDGET)}).`]);
    const ended = citeConversation(messages, source(), false);
    expect(textsOf(ended[3]).at(-1)).toBe(
      `###### From the vault\n\n- [\`1\` *The finance lead holds the reporting budget*](${hrefOf(BUDGET)})`,
    );
    expect(ended[0]).toBe(messages[0]);
  });
});

describe("citations: odd shapes the tools and the model give", () => {
  it("takes an empty type as none, and arguments without a vault as the Settings vault", () => {
    expect(documentsIn({ documentId: "a", title: "A", documentType: "" })).toEqual([{ documentId: "a", title: "A" }]);
    expect(documentsIn([DESK, { ...DESK, documentType: "bai/moc" }])).toEqual([DESK]);
    const known = knownDocuments(
      [answer(tool("search_vault", DESK, "not an object"), tool("read_document", BUDGET, { driveId: "" }))],
      readsVault,
    );
    expect(known.get(DESK.documentId)).toEqual(DESK);
    expect(known.get(BUDGET.documentId)).toEqual(BUDGET);
  });
});
