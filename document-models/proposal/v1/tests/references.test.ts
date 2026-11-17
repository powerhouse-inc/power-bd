import {
  addReference,
  reducer,
  removeReference,
  utils,
} from "document-models/proposal/v1";
import { describe, expect, it } from "vitest";
import { approved, errors, lastError, readyDraft, sent } from "./fixtures.js";

const NOTE = {
  id: "ref-1",
  kind: "NOTE" as const,
  documentId: "note-research-1",
  title: "Market scan for Brisa Labs",
};

describe("a proposal's references", () => {
  it("adds a reference and removes it again", () => {
    let document = reducer(utils.createDocument(), addReference(NOTE));
    expect(document.state.global.references).toStrictEqual([NOTE]);
    document = reducer(document, removeReference({ id: "ref-1" }));
    expect(errors(document)).toStrictEqual([undefined, undefined]);
    expect(document.state.global.references).toStrictEqual([]);
  });

  it("keeps the order references were added in", () => {
    let document = reducer(utils.createDocument(), addReference(NOTE));
    document = reducer(
      document,
      addReference({ ...NOTE, id: "ref-2", kind: "SOURCE" }),
    );
    expect(document.state.global.references.map((r) => r.id)).toStrictEqual([
      "ref-1",
      "ref-2",
    ]);
  });

  it("allows the same document with another kind", () => {
    let document = reducer(utils.createDocument(), addReference(NOTE));
    document = reducer(
      document,
      addReference({ ...NOTE, id: "ref-2", kind: "SOURCE" }),
    );
    expect(lastError(document)).toBeUndefined();
  });

  it("refuses a repeated id and the same document with the same kind", () => {
    const before = reducer(utils.createDocument(), addReference(NOTE));
    const sameId = reducer(
      before,
      addReference({ ...NOTE, documentId: "note-other" }),
    );
    const sameDocument = reducer(
      before,
      addReference({ ...NOTE, id: "ref-2" }),
    );
    expect(lastError(sameId)).toBe("Reference ref-1 already exists");
    expect(lastError(sameDocument)).toBe(
      '"Market scan for Brisa Labs" is already linked.',
    );
    expect(sameId.state.global).toStrictEqual(before.state.global);
    expect(sameDocument.state.global).toStrictEqual(before.state.global);
  });

  it("refuses to remove a reference that does not exist", () => {
    const before = readyDraft();
    const after = reducer(before, removeReference({ id: "ref-9" }));
    expect(lastError(after)).toBe("Reference ref-9 not found");
    expect(after.state.global).toStrictEqual(before.state.global);
  });

  it("refuses to add or remove a reference once the proposal is approved or sent", () => {
    for (const make of [approved, sent]) {
      const before = make();
      const added = reducer(before, addReference(NOTE));
      const removed = reducer(before, removeReference({ id: "ref-1" }));
      expect(lastError(added)).toBe("Only a draft proposal can be edited");
      expect(lastError(removed)).toBe("Only a draft proposal can be edited");
      expect(added.state.global).toStrictEqual(before.state.global);
    }
  });
});
