import { archiveContact, reducer, utils } from "document-models/contact/v1";
import { describe, expect, it } from "vitest";

describe("archiving a contact", () => {
  it("archives an active contact and restores it again", () => {
    let document = reducer(
      utils.createDocument(),
      archiveContact({ archived: true }),
    );
    expect(document.operations.global[0].error).toBeUndefined();
    expect(document.state.global.status).toBe("ARCHIVED");

    document = reducer(document, archiveContact({ archived: false }));
    expect(document.operations.global[1].error).toBeUndefined();
    expect(document.state.global.status).toBe("ACTIVE");
  });

  it("refuses a change that leaves the status as it is", () => {
    let document = reducer(
      utils.createDocument(),
      archiveContact({ archived: false }),
    );
    document = reducer(document, archiveContact({ archived: true }));
    document = reducer(document, archiveContact({ archived: true }));

    expect(
      document.operations.global.map((operation) => operation.error),
    ).toStrictEqual([
      "The contact is already active",
      undefined,
      "The contact is already archived",
    ]);
    expect(document.state.global.status).toBe("ARCHIVED");
  });
});
