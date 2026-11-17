import { describe, expect, it } from "vitest";
import type { DocBlock } from "./blocks.js";
import {
  base64Of,
  documentPictures,
  foldedMarkdown,
  markdownFileName,
  markdownWithPictures,
  pictureFold,
  picturesNote,
  unreadPicturesMessage,
} from "./pictures.js";

const figure = (
  caption: string,
  ref: `attachment://v1:${string}`,
  type = "image/png",
): DocBlock => ({ kind: "figure", caption, ref, type });

/** The eight bytes every PNG file starts with, in base64. */
const PNG_START = "iVBORw0KGgo=";

describe("markdownWithPictures", () => {
  it("points a figure at its picture, defined at the end as a data URL", () => {
    const blocks: DocBlock[] = [
      { kind: "heading", level: 2, text: "Why this pilot" },
      { kind: "paragraph", text: "One place for every figure." },
      figure("The report screen", "attachment://v1:aa"),
      { kind: "paragraph", text: "Reports follow." },
    ];
    expect(
      markdownWithPictures(
        blocks,
        new Map([["attachment://v1:aa", PNG_START]]),
      ),
    ).toEqual({
      ok: true,
      markdown:
        "## Why this pilot\n\n" +
        "One place for every figure.\n\n" +
        "![The report screen][figure-1]\n\n" +
        "Reports follow.\n\n" +
        "[figure-1]: data:image/png;base64,iVBORw0KGgo=\n",
    });
  });

  it("numbers pictures in the order they stand and defines each once, in that order", () => {
    const blocks: DocBlock[] = [
      figure("Home screen", "attachment://v1:bb", "image/jpeg"),
      { kind: "paragraph", text: "Between." },
      figure("Report screen", "attachment://v1:aa"),
      figure("Home screen, again", "attachment://v1:bb", "image/jpeg"),
    ];
    const data = new Map([
      ["attachment://v1:aa", "AAAA"],
      ["attachment://v1:bb", "/9j/"],
    ]);
    expect(markdownWithPictures(blocks, data)).toEqual({
      ok: true,
      markdown:
        "![Home screen][figure-1]\n\n" +
        "Between.\n\n" +
        "![Report screen][figure-2]\n\n" +
        "![Home screen, again][figure-1]\n\n" +
        "[figure-1]: data:image/jpeg;base64,/9j/\n" +
        "[figure-2]: data:image/png;base64,AAAA\n",
    });
  });

  it("names each picture it was not given, once, and gives no markdown", () => {
    const blocks: DocBlock[] = [
      figure("Home screen", "attachment://v1:bb"),
      figure("Report screen", "attachment://v1:aa"),
      figure("Settings screen", "attachment://v1:cc"),
      figure("Home screen, again", "attachment://v1:bb"),
    ];
    expect(
      markdownWithPictures(blocks, new Map([["attachment://v1:aa", "AAAA"]])),
    ).toEqual({ ok: false, missing: ["Home screen", "Settings screen"] });
  });

  it("writes a document without pictures as it always was", () => {
    const blocks: DocBlock[] = [
      { kind: "title", text: "Pilot" },
      { kind: "paragraph", text: "No pictures here." },
    ];
    expect(markdownWithPictures(blocks, new Map())).toEqual({
      ok: true,
      markdown: "# Pilot\n\nNo pictures here.\n",
    });
  });
});

describe("foldedMarkdown", () => {
  it("is the export's text with each picture's data URL left for a fold", () => {
    const blocks: DocBlock[] = [
      { kind: "paragraph", text: "Before." },
      figure("Home screen", "attachment://v1:bb", "image/jpeg"),
      figure("Report screen", "attachment://v1:aa"),
    ];
    expect(foldedMarkdown(blocks)).toEqual([
      {
        kind: "text",
        text:
          "Before.\n\n" +
          "![Home screen][figure-1]\n\n" +
          "![Report screen][figure-2]\n\n" +
          "[figure-1]: ",
      },
      {
        kind: "picture",
        picture: {
          label: "figure-1",
          ref: "attachment://v1:bb",
          type: "image/jpeg",
          caption: "Home screen",
        },
      },
      { kind: "text", text: "\n[figure-2]: " },
      {
        kind: "picture",
        picture: {
          label: "figure-2",
          ref: "attachment://v1:aa",
          type: "image/png",
          caption: "Report screen",
        },
      },
      { kind: "text", text: "\n" },
    ]);
  });

  it("is the export's text, whole, when there are no pictures", () => {
    expect(foldedMarkdown([{ kind: "title", text: "Pilot" }])).toEqual([
      { kind: "text", text: "# Pilot\n" },
    ]);
  });
});

describe("pictureFold", () => {
  it("folds a picture's data to its type and size", () => {
    expect(pictureFold("image/jpeg", 421_888)).toEqual({
      text: "JPEG picture, 412 KB",
      unread: false,
    });
  });

  it("gives the type alone until the size is known, and says when a picture can't be read", () => {
    expect(pictureFold("image/svg+xml", undefined)).toEqual({
      text: "SVG picture",
      unread: false,
    });
    expect(pictureFold("image/webp", null)).toEqual({
      text: "WEBP picture, can't be read",
      unread: true,
    });
  });

  it("gives sizes in bytes, KB or MB, as a person reads them", () => {
    const sizes = [
      512, 1_024, 2_400, 10_188, 10_199, 1_048_000, 1_258_291, 31_457_280,
    ];
    expect(sizes.map((size) => pictureFold("image/png", size).text)).toEqual([
      "PNG picture, 512 bytes",
      "PNG picture, 1.0 KB",
      "PNG picture, 2.3 KB",
      "PNG picture, 9.9 KB",
      "PNG picture, 10 KB",
      "PNG picture, 1.0 MB",
      "PNG picture, 1.2 MB",
      "PNG picture, 30 MB",
    ]);
  });

  it("calls a file without a picture type a picture all the same", () => {
    expect(pictureFold("application/octet-stream", 2_048).text).toBe(
      "Picture, 2.0 KB",
    );
  });
});

describe("documentPictures", () => {
  it("lists each picture once, in the order it first stands, under its label", () => {
    expect(
      documentPictures([
        figure("Home screen", "attachment://v1:bb", "image/jpeg"),
        { kind: "paragraph", text: "Between." },
        figure("Report screen", "attachment://v1:aa"),
        figure("Home screen, again", "attachment://v1:bb", "image/jpeg"),
      ]),
    ).toEqual([
      {
        label: "figure-1",
        ref: "attachment://v1:bb",
        type: "image/jpeg",
        caption: "Home screen",
      },
      {
        label: "figure-2",
        ref: "attachment://v1:aa",
        type: "image/png",
        caption: "Report screen",
      },
    ]);
  });
});

describe("base64Of", () => {
  it("writes bytes as base64, padded as a data URL carries them", () => {
    expect(
      base64Of(
        new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      ),
    ).toBe(PNG_START);
    expect(base64Of(new Uint8Array([]))).toBe("");
  });

  it("writes a picture of several hundred kilobytes whole and in order", () => {
    // The bytes 00 10 83 are "ABCD" in base64; 32,769 of them make 98,307 bytes.
    const bytes = new Uint8Array(98_307).map(
      (_, i) => [0x00, 0x10, 0x83][i % 3],
    );
    expect(base64Of(bytes)).toBe("ABCD".repeat(32_769));
  });
});

describe("markdownFileName", () => {
  it("names the file Export saves after the proposal's code, or plainly without one", () => {
    expect(markdownFileName("BRI-26-01")).toBe("BRI-26-01.md");
    expect(markdownFileName(null)).toBe("proposal.md");
    expect(markdownFileName("")).toBe("proposal.md");
  });
});

describe("what the app says about the pictures", () => {
  it("says how many pictures the export carries, and that their data is folded here", () => {
    expect(picturesNote(0)).toBeNull();
    expect(picturesNote(1)).toBe(
      "Export and Copy carry 1 picture inside the text. Its data is folded here to one line.",
    );
    expect(picturesNote(2)).toBe(
      "Export and Copy carry 2 pictures inside the text. Their data is folded here, one line each.",
    );
  });

  it("names the pictures that can't be read, says nothing was saved or copied, and the way round", () => {
    expect(unreadPicturesMessage(["Home screen"], "export")).toBe(
      'Couldn\'t read the picture "Home screen", so nothing was exported. Try again in a moment, or replace the picture under Content.',
    );
    expect(
      unreadPicturesMessage(["Home screen", "Report screen"], "copy"),
    ).toBe(
      'Couldn\'t read 2 pictures, "Home screen" and "Report screen", so nothing was copied. Try again in a moment, or replace them under Content.',
    );
    expect(unreadPicturesMessage(["A", "B", "C"], "export")).toBe(
      'Couldn\'t read 3 pictures, "A", "B" and "C", so nothing was exported. Try again in a moment, or replace them under Content.',
    );
  });
});
