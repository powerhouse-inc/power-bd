import { describe, expect, it } from "vitest";
import {
  COPY_REFUSED,
  COPY_UNAVAILABLE,
  copyText,
  type TextClipboard,
} from "./clipboard.js";

/** A clipboard that keeps what it was given, or refuses as a browser does. */
function fakeClipboard(refuse?: Error) {
  const written: string[] = [];
  const clipboard: TextClipboard = {
    writeText: (text) => {
      if (refuse !== undefined) return Promise.reject(refuse);
      written.push(text);
      return Promise.resolve();
    },
  };
  return { clipboard, written };
}

describe("copyText", () => {
  it("puts the text on the clipboard, exactly as given", async () => {
    const { clipboard, written } = fakeClipboard();
    const text = "# Pilot\n\n| Item | Price |\n|---|---:|\n";
    await expect(copyText(text, clipboard)).resolves.toEqual({ ok: true });
    expect(written).toEqual([text]);
  });

  it("says the browser refused when the clipboard rejects", async () => {
    const { clipboard, written } = fakeClipboard(
      new DOMException("Write permission denied.", "NotAllowedError"),
    );
    await expect(copyText("text", clipboard)).resolves.toEqual({
      ok: false,
      message: COPY_REFUSED,
    });
    expect(written).toEqual([]);
  });

  it("says so whatever the browser rejects with", async () => {
    const { clipboard } = fakeClipboard(
      new TypeError("Document is not focused."),
    );
    await expect(copyText("text", clipboard)).resolves.toEqual({
      ok: false,
      message: COPY_REFUSED,
    });
  });

  it("says the browser cannot copy here when it offers no clipboard", async () => {
    await expect(copyText("text", undefined)).resolves.toEqual({
      ok: false,
      message: COPY_UNAVAILABLE,
    });
  });

  it("words both refusals as one short sentence each", () => {
    for (const message of [COPY_REFUSED, COPY_UNAVAILABLE]) {
      expect(message).toMatch(/^[A-Z][^.]*\.$/);
      expect(message.length).toBeLessThan(60);
    }
  });
});
