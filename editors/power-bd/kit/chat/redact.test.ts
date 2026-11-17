import { describe, expect, it } from "vitest";
import { redactToolResult } from "./redact.js";

const SECRET = "The Quillfeather board privately prefers the rival bid from Marnoble";

/** A reactor read as the tool returns it: the MCP envelope, JSON in its text. */
function envelope(result: unknown) {
  return {
    content: [{ type: "text", text: JSON.stringify(result) }],
    structuredContent: result,
  };
}

function leadView(documentType = "powerbd/lead") {
  return {
    document: {
      id: "lead-1",
      documentType,
      name: "Quillfeather Labs: pilot",
      state: {
        global: {
          name: "Quillfeather Labs: pilot",
          status: "MET",
          nextSteps: [{ id: "n-1", text: "Send the pilot plan", doneAt: null }],
          confidentialItems: [
            {
              id: "c-1",
              text: SECRET,
              subjectContactId: null,
              addedBy: "0x1111aaaa2222bbbb3333cccc4444dddd5555eeee",
              addedAt: "2026-11-16T09:05:00.000Z",
            },
          ],
        },
      },
    },
  };
}

describe("redactToolResult: a BD record read whole", () => {
  it.each(["powerbd/lead", "powerbd/opportunity"])(
    "withholds a %s's confidential items and keeps the rest",
    (type) => {
      const out = redactToolResult({ documentId: "lead-1" }, envelope(leadView(type)));
      expect(JSON.stringify(out)).not.toContain("Quillfeather board");
      expect(out).toMatchObject({
        structuredContent: {
          document: {
            state: {
              global: {
                status: "MET",
                nextSteps: [{ text: "Send the pilot plan" }],
                confidentialItems: { withheld: 1 },
              },
            },
          },
        },
      });
    },
  );
});

/** A filtered read: the tool puts the filter's match where the state was. */
function filtered(match: unknown, documentType = "powerbd/lead") {
  return envelope({
    document: { id: "lead-1", documentType, name: "Quillfeather Labs: pilot", state: match },
  });
}

describe("redactToolResult: a BD record read through a filter", () => {
  it.each([
    "$.global.confidentialItems",
    "$.global.confidentialItems[*].text",
    "$..text",
    "$.global.*",
    "$.global[*]",
    "$.*",
    "$[?(@.confidentialItems)]",
    "$.global[?(@.length > 0)]",
    "$['global']['confidentialItems']",
    '$.global["confidential\\u0049tems"]',
    "$.global['nextSteps','confidentialItems']",
    "$.global",
    "$",
  ])("refuses %s, which can reach the confidential items", (filter) => {
    const out = redactToolResult({ documentId: "lead-1", filter }, filtered([SECRET]));
    expect(JSON.stringify(out)).not.toContain("Quillfeather board");
    expect(out).toMatchObject({ isError: true });
  });

  it.each([
    "$.global.nextSteps",
    "$.global.nextSteps[?(@.doneAt == null)]",
    "$.global['messages'][0].text",
    " $.local.notes ",
  ])("lets %s through, which starts at a field of its own", (filter) => {
    const match = [{ id: "n-1", text: "Send the pilot plan" }];
    const out = redactToolResult({ documentId: "lead-1", filter }, filtered(match));
    expect(out).toMatchObject({ structuredContent: { document: { state: match } } });
  });

  it("refuses the same filter when getDrive is pointed at a BD record", () => {
    const out = redactToolResult(
      { documentId: "lead-1", filter: "$.global.confidentialItems" },
      envelope({ drive: { id: "lead-1", documentType: "powerbd/lead", state: [SECRET] } }),
    );
    expect(out).toMatchObject({ isError: true });
  });

  it("tells the agent how to read the record instead", () => {
    const out = redactToolResult(
      { documentId: "lead-1", filter: "$..text" },
      filtered([SECRET]),
    );
    expect(JSON.stringify(out)).toContain("$.global.nextSteps");
  });

  it("leaves a filtered read of a document outside BD alone", () => {
    const match = [{ text: "Orvane allows three attempts" }];
    const out = redactToolResult(
      { documentId: "note-1", filter: "$..text" },
      filtered(match, "bai/knowledge-note"),
    );
    expect(out).toMatchObject({ structuredContent: { document: { state: match } } });
  });
});

describe("redactToolResult: any other tool's result", () => {
  it("withholds the items of a vault read_document pointed at a BD record", () => {
    const data = {
      documentId: "lead-1",
      title: "Quillfeather Labs: pilot",
      documentType: "powerbd/lead",
      text: "",
      meta: {
        status: "MET",
        confidentialItems: { count: 1, first: [{ id: "c-1", text: SECRET }] },
      },
    };
    const out = redactToolResult(
      { documentId: "lead-1" },
      { content: [{ type: "text", text: 'read powerbd/lead "Quillfeather Labs: pilot"' }], structuredContent: data },
    );
    expect(JSON.stringify(out)).not.toContain("Quillfeather board");
    expect(out).toMatchObject({
      structuredContent: { meta: { status: "MET", confidentialItems: { withheld: 1 } } },
      content: [{ text: 'read powerbd/lead "Quillfeather Labs: pilot"' }],
    });
  });

  it("cleans a result that carries only JSON text", () => {
    const out = redactToolResult(
      { documentId: "lead-1" },
      { content: [{ type: "text", text: JSON.stringify(leadView()) }] },
    );
    expect(JSON.stringify(out)).not.toContain("Quillfeather board");
  });

  it("cleans a plain value that is not an envelope", () => {
    const out = redactToolResult({}, [{ confidentialItems: [{ text: SECRET }] }]);
    expect(out).toMatchObject([{ confidentialItems: { withheld: 1 } }]);
    expect(JSON.stringify(out)).not.toContain("Quillfeather board");
  });

  it("withholds items the reactor already cut to a summary, without a count", () => {
    expect(redactToolResult({}, { confidentialItems: "[array of 3]" })).toMatchObject({
      confidentialItems: { withheld: null },
    });
  });

  it("keeps an empty list of confidential items, which hides nothing", () => {
    expect(redactToolResult({}, { confidentialItems: [] })).toEqual({ confidentialItems: [] });
  });

  it("passes errors, prose and images through unchanged", () => {
    const error = { isError: true, content: [{ type: "text", text: "Error: no document lead-9" }] };
    expect(redactToolResult({ documentId: "lead-9" }, error)).toEqual(error);
    const image = { content: [{ type: "image", data: "AAAA", mimeType: "image/png" }, { type: "text", text: "42" }] };
    expect(redactToolResult({}, image)).toEqual(image);
  });
});
