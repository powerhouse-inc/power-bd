import { describe, expect, it } from "vitest";
import { parseInline, parseProse } from "./prose.js";

describe("parseInline", () => {
  it("keeps plain text as one span", () => {
    expect(parseInline("Plain words.")).toEqual([{ text: "Plain words." }]);
  });
  it("reads strong, emphasis and code", () => {
    expect(parseInline("A **bold** and *soft* `code` end")).toEqual([
      { text: "A " },
      { text: "bold", strong: true },
      { text: " and " },
      { text: "soft", em: true },
      { text: " " },
      { text: "code", code: true },
      { text: " end" },
    ]);
  });
  it("reads a web or mail link, and keeps only the label of any other", () => {
    expect(
      parseInline(
        "[site](https://example.org) [mail](mailto:a@example.org) [bad](javascript:x)",
      ),
    ).toEqual([
      { text: "site", href: "https://example.org" },
      { text: " " },
      { text: "mail", href: "mailto:a@example.org" },
      { text: " bad" },
    ]);
  });
  it("leaves a placeholder, a task box and underscores as written", () => {
    expect(parseInline("Owner: [•], [ ] and ____")).toEqual([
      { text: "Owner: [•], [ ] and ____" },
    ]);
  });
  it("gives no span for an empty text", () => {
    expect(parseInline("")).toEqual([]);
  });
});

describe("parseProse", () => {
  it("splits paragraphs at blank lines and keeps a line break inside one", () => {
    expect(parseProse("One\ntwo\n\n\nThree")).toEqual([
      { kind: "paragraph", spans: [{ text: "One\ntwo" }] },
      { kind: "paragraph", spans: [{ text: "Three" }] },
    ]);
  });
  it("reads bulleted and numbered lists, with a continued item", () => {
    expect(
      parseProse("Intro:\n- one\n  more\n* **two**\n\n1. first\n2) second"),
    ).toEqual([
      { kind: "paragraph", spans: [{ text: "Intro:" }] },
      {
        kind: "list",
        ordered: false,
        items: [[{ text: "one more" }], [{ text: "two", strong: true }]],
      },
      {
        kind: "list",
        ordered: true,
        items: [[{ text: "first" }], [{ text: "second" }]],
      },
    ]);
  });
  it("starts a new list when the kind of marker changes", () => {
    expect(parseProse("- a\n1. b")).toEqual([
      { kind: "list", ordered: false, items: [[{ text: "a" }]] },
      { kind: "list", ordered: true, items: [[{ text: "b" }]] },
    ]);
  });
  it("ends a list at a line that is not indented", () => {
    expect(parseProse("- a\nAfter")).toEqual([
      { kind: "list", ordered: false, items: [[{ text: "a" }]] },
      { kind: "paragraph", spans: [{ text: "After" }] },
    ]);
  });
  it("reads headings below the section's own, never above level 3", () => {
    expect(parseProse("# Top\n### Third\n###### Deep\nText")).toEqual([
      { kind: "heading", level: 3, spans: [{ text: "Top" }] },
      { kind: "heading", level: 3, spans: [{ text: "Third" }] },
      { kind: "heading", level: 4, spans: [{ text: "Deep" }] },
      { kind: "paragraph", spans: [{ text: "Text" }] },
    ]);
  });
  it("gives nothing for an empty or blank text", () => {
    expect(parseProse("")).toEqual([]);
    expect(parseProse(" \n\n ")).toEqual([]);
  });
  it("reads Windows line ends", () => {
    expect(parseProse("One\r\n\r\nTwo")).toEqual([
      { kind: "paragraph", spans: [{ text: "One" }] },
      { kind: "paragraph", spans: [{ text: "Two" }] },
    ]);
  });
});
