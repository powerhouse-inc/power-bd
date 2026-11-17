import {
  addReference,
  reducer,
  removeReference,
  utils,
} from "document-models/decision/v1";
import { describe, expect, it } from "vitest";

const NOTE = {
  id: "r1",
  kind: "NOTE" as const,
  documentId: "phid-note-kelvar",
  title: "Kelvar programme rules",
};
const LEAD = {
  id: "r2",
  kind: "LEAD" as const,
  documentId: "phid-lead-brisa",
  title: "Brisa Labs",
};

function errors(document: ReturnType<typeof utils.createDocument>) {
  return document.operations.global.map((operation) => operation.error);
}

describe("the decision's references", () => {
  it("adds references and removes one", () => {
    let document = reducer(utils.createDocument(), addReference(NOTE));
    document = reducer(document, addReference(LEAD));
    expect(document.state.global.references).toStrictEqual([NOTE, LEAD]);

    document = reducer(document, removeReference({ id: "r1" }));
    expect(errors(document)).toStrictEqual([undefined, undefined, undefined]);
    expect(document.state.global.references).toStrictEqual([LEAD]);
  });

  it("refuses a repeated id, a repeated document and an unknown reference", () => {
    let document = reducer(utils.createDocument(), addReference(NOTE));
    document = reducer(document, addReference({ ...LEAD, id: "r1" }));
    document = reducer(document, addReference({ ...NOTE, id: "r3" }));
    // The same document with another kind is a different reference.
    document = reducer(
      document,
      addReference({ ...NOTE, id: "r4", kind: "SOURCE" }),
    );
    document = reducer(document, removeReference({ id: "r9" }));

    expect(errors(document)).toStrictEqual([
      undefined,
      "Reference r1 already exists",
      '"Kelvar programme rules" is already linked.',
      undefined,
      "Reference r9 not found",
    ]);
    expect(document.state.global.references).toHaveLength(2);
  });
});
