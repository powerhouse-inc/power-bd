import {
  addCondition,
  markCondition,
  reducer,
  removeCondition,
  updateCondition,
  utils,
} from "document-models/opportunity/v1";
import { describe, expect, it } from "vitest";

type Doc = ReturnType<typeof utils.createDocument>;

const CHECKED = "2026-11-03T08:00:00.000Z";
const LEGAL_FORM = {
  id: "cond-form",
  kind: "LEGAL_FORM" as const,
  text: "Applicant is a registered non-profit",
  source: "Halloway Fund rules, section 2",
  checkedAt: CHECKED,
};
const ENTITY_NOTE = { id: "note-entity", title: "Our legal entity" };

function conditions(document: Doc) {
  return document.state.global.conditions;
}
function lastError(document: Doc) {
  return document.operations.global.at(-1)?.error;
}
function withCondition(): Doc {
  return reducer(
    utils.createDocument(),
    addCondition({
      ...LEGAL_FORM,
      state: "WAITING_ON_DECISION",
      decisionIds: ["decision-entity"],
      factNotes: [ENTITY_NOTE],
    }),
  );
}

describe("conditions", () => {
  it("adds a condition that starts unknown, with nothing it waits on", () => {
    const document = reducer(utils.createDocument(), addCondition(LEGAL_FORM));

    expect(lastError(document)).toBeUndefined();
    expect(conditions(document)).toStrictEqual([
      { ...LEGAL_FORM, state: "UNKNOWN", decisionIds: [], factNotes: [] },
    ]);
  });

  it("adds a condition waiting on a decision, with the notes it relies on", () => {
    const document = withCondition();

    expect(lastError(document)).toBeUndefined();
    expect(conditions(document)).toStrictEqual([
      {
        ...LEGAL_FORM,
        state: "WAITING_ON_DECISION",
        decisionIds: ["decision-entity"],
        factNotes: [ENTITY_NOTE],
      },
    ]);
  });

  it("refuses a repeated id", () => {
    const after = reducer(withCondition(), addCondition(LEGAL_FORM));

    expect(lastError(after)).toBe("Condition cond-form already exists");
    expect(conditions(after)).toHaveLength(1);
  });

  it("refuses a condition without a source or a checked date", () => {
    for (const source of [undefined, null, " "]) {
      const after = reducer(
        utils.createDocument(),
        addCondition({ ...LEGAL_FORM, source }),
      );
      expect(lastError(after)).toBe("A condition needs a source");
      expect(conditions(after)).toStrictEqual([]);
    }
    for (const checkedAt of [undefined, null]) {
      const after = reducer(
        utils.createDocument(),
        addCondition({ ...LEGAL_FORM, checkedAt }),
      );
      expect(lastError(after)).toBe(
        "A condition needs the date it was checked",
      );
    }
  });

  it("updates one field, leaving the rest and the state", () => {
    const document = reducer(
      withCondition(),
      updateCondition({ id: "cond-form", text: "Registered charity" }),
    );

    expect(lastError(document)).toBeUndefined();
    expect(conditions(document)[0]).toStrictEqual({
      ...LEGAL_FORM,
      text: "Registered charity",
      state: "WAITING_ON_DECISION",
      decisionIds: ["decision-entity"],
      factNotes: [ENTITY_NOTE],
    });
  });

  it("replaces the lists and every field it is given", () => {
    const document = reducer(
      withCondition(),
      updateCondition({
        id: "cond-form",
        kind: "ELIGIBILITY",
        text: "Eligible",
        decisionIds: [],
        factNotes: [{ id: "note-b", title: "Other note" }],
        source: "Call text",
        checkedAt: "2026-11-09T08:00:00.000Z",
      }),
    );

    expect(conditions(document)[0]).toStrictEqual({
      id: "cond-form",
      kind: "ELIGIBILITY",
      text: "Eligible",
      state: "WAITING_ON_DECISION",
      decisionIds: [],
      factNotes: [{ id: "note-b", title: "Other note" }],
      source: "Call text",
      checkedAt: "2026-11-09T08:00:00.000Z",
    });
  });

  it("ignores null for a required field on update", () => {
    const before = withCondition();
    const after = reducer(
      before,
      updateCondition({
        id: "cond-form",
        kind: null,
        text: null,
        decisionIds: null,
        factNotes: null,
        source: null,
        checkedAt: null,
      }),
    );

    expect(lastError(after)).toBeUndefined();
    expect(conditions(after)).toStrictEqual(conditions(before));
  });

  it("refuses an update of an unknown condition or to a blank source", () => {
    const before = withCondition();
    const unknown = reducer(before, updateCondition({ id: "nope", text: "x" }));
    const blank = reducer(
      before,
      updateCondition({ id: "cond-form", source: "" }),
    );

    expect(lastError(unknown)).toBe("Condition nope not found");
    expect(lastError(blank)).toBe("A condition needs a source");
    expect(conditions(blank)).toStrictEqual(conditions(before));
  });

  it("marks a condition met and records when it was checked", () => {
    const document = reducer(
      withCondition(),
      markCondition({
        id: "cond-form",
        state: "MET",
        checkedAt: "2026-11-12T10:00:00.000Z",
      }),
    );

    expect(lastError(document)).toBeUndefined();
    expect(conditions(document)[0].state).toBe("MET");
    expect(conditions(document)[0].checkedAt).toBe("2026-11-12T10:00:00.000Z");
    expect(conditions(document)[0].decisionIds).toStrictEqual([
      "decision-entity",
    ]);
  });

  it("refuses to mark an unknown condition", () => {
    const after = reducer(
      withCondition(),
      markCondition({ id: "nope", state: "MET", checkedAt: CHECKED }),
    );

    expect(lastError(after)).toBe("Condition nope not found");
  });

  it("removes a condition, and refuses an unknown one", () => {
    const removed = reducer(
      withCondition(),
      removeCondition({ id: "cond-form" }),
    );
    const unknown = reducer(withCondition(), removeCondition({ id: "nope" }));

    expect(conditions(removed)).toStrictEqual([]);
    expect(lastError(unknown)).toBe("Condition nope not found");
    expect(conditions(unknown)).toHaveLength(1);
  });
});
