import {
  addStep,
  reducer,
  removeStep,
  targetCutOff,
  updateStep,
  utils,
} from "document-models/opportunity/v1";
import { describe, expect, it } from "vitest";

type Doc = ReturnType<typeof utils.createDocument>;

const CHECKED = "2026-11-03T08:00:00.000Z";
const CUT_OFF = {
  id: "step-cut-1",
  kind: "CUT_OFF" as const,
  label: "First cut-off",
  at: "2027-03-15T11:00:00.000Z",
  timeZone: "Europe/Brussels",
  source: "https://apply.halloway.example/dates",
  checkedAt: CHECKED,
};
const SECOND = {
  ...CUT_OFF,
  id: "step-cut-2",
  label: "Second cut-off",
  at: "2027-09-15T11:00:00.000Z",
};

function steps(document: Doc) {
  return document.state.global.steps;
}
function lastError(document: Doc) {
  return document.operations.global.at(-1)?.error;
}
function withSteps(): Doc {
  return reducer(
    reducer(utils.createDocument(), addStep(CUT_OFF)),
    addStep(SECOND),
  );
}

describe("dated steps", () => {
  it("adds a step, not targeted", () => {
    const document = reducer(utils.createDocument(), addStep(CUT_OFF));

    expect(lastError(document)).toBeUndefined();
    expect(steps(document)).toStrictEqual([{ ...CUT_OFF, targeted: false }]);
  });

  it("accepts UTC and three-part zone names", () => {
    let document = utils.createDocument();
    document = reducer(
      document,
      addStep({ ...CUT_OFF, id: "a", timeZone: "UTC" }),
    );
    document = reducer(
      document,
      addStep({
        ...CUT_OFF,
        id: "b",
        timeZone: "America/Argentina/Buenos_Aires",
      }),
    );

    expect(document.operations.global.map((o) => o.error)).toStrictEqual([
      undefined,
      undefined,
    ]);
  });

  it("refuses a repeated id", () => {
    const before = reducer(utils.createDocument(), addStep(CUT_OFF));
    const after = reducer(before, addStep({ ...CUT_OFF, label: "Other" }));

    expect(lastError(after)).toBe("Step step-cut-1 already exists");
    expect(steps(after)).toStrictEqual(steps(before));
  });

  it("refuses a time zone that is not a well-formed name", () => {
    for (const timeZone of ["Brussels", "", "CET", "Europe/"]) {
      const after = reducer(
        utils.createDocument(),
        addStep({ ...CUT_OFF, timeZone }),
      );

      expect(lastError(after)).toBe(
        `"${timeZone}" is not a time zone name such as Europe/Zurich`,
      );
      expect(steps(after)).toStrictEqual([]);
    }
  });

  it("refuses a step without a source or without a checked date", () => {
    for (const source of [undefined, null, "", "  "]) {
      const after = reducer(
        utils.createDocument(),
        addStep({ ...CUT_OFF, source }),
      );
      expect(lastError(after)).toBe("A step needs a source");
    }
    for (const checkedAt of [undefined, null]) {
      const after = reducer(
        utils.createDocument(),
        addStep({ ...CUT_OFF, checkedAt }),
      );
      expect(lastError(after)).toBe("A step needs the date it was checked");
      expect(steps(after)).toStrictEqual([]);
    }
  });

  it("updates one field and leaves the others", () => {
    const document = reducer(
      withSteps(),
      updateStep({ id: "step-cut-1", label: "Cut-off, round one" }),
    );

    expect(lastError(document)).toBeUndefined();
    expect(steps(document)[0]).toStrictEqual({
      ...CUT_OFF,
      label: "Cut-off, round one",
      targeted: false,
    });
    expect(steps(document)[1]).toStrictEqual({ ...SECOND, targeted: false });
  });

  it("updates every field, and ignores null for a required one", () => {
    const document = reducer(
      reducer(utils.createDocument(), addStep(CUT_OFF)),
      updateStep({
        id: "step-cut-1",
        kind: "INTERVIEW",
        label: "Interview",
        at: "2027-04-01T09:00:00.000Z",
        timeZone: "Europe/Zurich",
        source: "Call letter",
        checkedAt: "2026-11-10T08:00:00.000Z",
      }),
    );
    expect(steps(document)[0]).toStrictEqual({
      id: "step-cut-1",
      kind: "INTERVIEW",
      label: "Interview",
      at: "2027-04-01T09:00:00.000Z",
      timeZone: "Europe/Zurich",
      targeted: false,
      source: "Call letter",
      checkedAt: "2026-11-10T08:00:00.000Z",
    });

    const unchanged = reducer(
      document,
      updateStep({
        id: "step-cut-1",
        label: null,
        at: null,
        timeZone: null,
        source: null,
        checkedAt: null,
        kind: null,
      }),
    );
    expect(lastError(unchanged)).toBeUndefined();
    expect(steps(unchanged)).toStrictEqual(steps(document));
  });

  it("refuses an update to an unknown step, a bad zone, a blank source", () => {
    const before = withSteps();
    const unknown = reducer(before, updateStep({ id: "nope", label: "x" }));
    const zone = reducer(
      before,
      updateStep({ id: "step-cut-1", timeZone: "Brussels" }),
    );
    const source = reducer(
      before,
      updateStep({ id: "step-cut-1", source: " " }),
    );

    expect(lastError(unknown)).toBe("Step nope not found");
    expect(lastError(zone)).toBe(
      '"Brussels" is not a time zone name such as Europe/Zurich',
    );
    expect(lastError(source)).toBe("A step needs a source");
    expect(steps(zone)).toStrictEqual(steps(before));
  });

  it("removes a step", () => {
    const document = reducer(withSteps(), removeStep({ id: "step-cut-1" }));

    expect(steps(document).map((s) => s.id)).toStrictEqual(["step-cut-2"]);
  });

  it("refuses to remove an unknown step", () => {
    const after = reducer(withSteps(), removeStep({ id: "nope" }));

    expect(lastError(after)).toBe("Step nope not found");
    expect(steps(after)).toHaveLength(2);
  });
});

describe("the targeted cut-off", () => {
  it("targets a cut-off", () => {
    const document = reducer(withSteps(), targetCutOff({ id: "step-cut-1" }));

    expect(lastError(document)).toBeUndefined();
    expect(steps(document).map((s) => s.targeted)).toStrictEqual([true, false]);
  });

  it("clears the other target when a second cut-off is targeted", () => {
    let document = reducer(withSteps(), targetCutOff({ id: "step-cut-1" }));
    document = reducer(document, targetCutOff({ id: "step-cut-2" }));

    expect(steps(document).map((s) => s.targeted)).toStrictEqual([false, true]);
  });

  it("refuses an unknown step and a step that is not a cut-off", () => {
    const before = reducer(
      withSteps(),
      addStep({ ...CUT_OFF, id: "step-int", kind: "INTERVIEW" }),
    );
    const unknown = reducer(before, targetCutOff({ id: "nope" }));
    const interview = reducer(before, targetCutOff({ id: "step-int" }));

    expect(lastError(unknown)).toBe("Step nope not found");
    expect(lastError(interview)).toBe("Only a cut-off can be targeted");
    expect(steps(interview)).toStrictEqual(steps(before));
  });

  it("drops the target when the step stops being a cut-off", () => {
    let document = reducer(withSteps(), targetCutOff({ id: "step-cut-1" }));
    document = reducer(
      document,
      updateStep({ id: "step-cut-1", kind: "STAGE" }),
    );

    expect(steps(document)[0].targeted).toBe(false);
  });

  it("keeps the target when a targeted cut-off changes in other ways", () => {
    let document = reducer(withSteps(), targetCutOff({ id: "step-cut-1" }));
    document = reducer(
      document,
      updateStep({ id: "step-cut-1", kind: "CUT_OFF", label: "Moved" }),
    );

    expect(steps(document)[0].targeted).toBe(true);
  });
});
