import {
  clearAttemptLimit,
  reducer,
  setApplyingEntity,
  setAttemptLimit,
  utils,
} from "document-models/opportunity/v1";
import { describe, expect, it } from "vitest";

type Doc = ReturnType<typeof utils.createDocument>;

const LIMIT = {
  max: 2,
  withdrawnCounts: true,
  source: "Halloway Fund rules, section 5",
  checkedAt: "2026-11-03T08:00:00.000Z",
};

function lastError(document: Doc) {
  return document.operations.global.at(-1)?.error;
}

describe("the attempt limit", () => {
  it("sets the limit", () => {
    const document = reducer(utils.createDocument(), setAttemptLimit(LIMIT));

    expect(lastError(document)).toBeUndefined();
    expect(document.state.global.attemptLimit).toStrictEqual(LIMIT);
  });

  it("replaces an earlier limit", () => {
    let document = reducer(utils.createDocument(), setAttemptLimit(LIMIT));
    document = reducer(
      document,
      setAttemptLimit({ ...LIMIT, max: 3, withdrawnCounts: false }),
    );

    expect(document.state.global.attemptLimit).toStrictEqual({
      ...LIMIT,
      max: 3,
      withdrawnCounts: false,
    });
  });

  it("clears the limit, and clearing again changes nothing", () => {
    let document = reducer(utils.createDocument(), setAttemptLimit(LIMIT));
    document = reducer(document, clearAttemptLimit({}));
    document = reducer(document, clearAttemptLimit({}));

    expect(document.operations.global.map((o) => o.error)).toStrictEqual([
      undefined,
      undefined,
      undefined,
    ]);
    expect(document.state.global.attemptLimit).toBeNull();
  });

  it("refuses a limit below 1", () => {
    for (const max of [0, -1]) {
      const after = reducer(
        utils.createDocument(),
        setAttemptLimit({ ...LIMIT, max }),
      );

      expect(lastError(after)).toBe("The limit must be at least 1");
      expect(after.state.global.attemptLimit).toBeNull();
    }
  });

  it("refuses a limit without a source or a checked date", () => {
    for (const source of [undefined, null, "  "]) {
      const after = reducer(
        utils.createDocument(),
        setAttemptLimit({ ...LIMIT, source }),
      );
      expect(lastError(after)).toBe("An attempt limit needs a source");
    }
    for (const checkedAt of [undefined, null]) {
      const after = reducer(
        utils.createDocument(),
        setAttemptLimit({ ...LIMIT, checkedAt }),
      );
      expect(lastError(after)).toBe(
        "An attempt limit needs the date it was checked",
      );
      expect(after.state.global.attemptLimit).toBeNull();
    }
  });
});

describe("the applying entity", () => {
  it("sets and clears the entity note", () => {
    let document = reducer(
      utils.createDocument(),
      setApplyingEntity({
        entity: { id: "note-entity", title: "Our legal entity" },
      }),
    );
    expect(document.state.global.applyingEntity).toStrictEqual({
      id: "note-entity",
      title: "Our legal entity",
    });
    document = reducer(document, setApplyingEntity({ entity: null }));

    expect(document.state.global.applyingEntity).toBeNull();
    document = reducer(document, setApplyingEntity({}));
    expect(document.state.global.applyingEntity).toBeNull();
  });
});
