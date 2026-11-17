import {
  addPaymentStep,
  reducer,
  removePaymentStep,
  updatePaymentStep,
  utils,
} from "document-models/proposal/v1";
import { describe, expect, it } from "vitest";
import { approved, lastError, sent, workedExample } from "./fixtures.js";

describe("a proposal's payment steps", () => {
  it("keeps the steps in the order they were added, with a date only when the step is paid on one", () => {
    let document = workedExample();
    document = reducer(
      document,
      addPaymentStep({
        id: "s3",
        label: "Final",
        trigger: "ON_DATE",
        percentage: 0,
        date: "2027-06-30T00:00:00.000Z",
      }),
    );
    expect(document.state.global.paymentSteps).toStrictEqual([
      {
        id: "s1",
        label: "On signature",
        trigger: "ON_SIGNATURE",
        percentage: 25,
        date: null,
      },
      {
        id: "s2",
        label: "On acceptance",
        trigger: "ON_ACCEPTANCE",
        percentage: 75,
        date: null,
      },
      {
        id: "s3",
        label: "Final",
        trigger: "ON_DATE",
        percentage: 0,
        date: "2027-06-30T00:00:00.000Z",
      },
    ]);
    const ignored = reducer(
      utils.createDocument(),
      addPaymentStep({
        id: "s1",
        label: "x",
        trigger: "ON_SIGNATURE",
        percentage: 100,
        date: "2027-06-30T00:00:00.000Z",
      }),
    );
    expect(ignored.state.global.paymentSteps[0].date).toBeNull();
  });

  it("refuses a repeated id, a percentage outside 0 to 100 and a dated step without a date", () => {
    const before = workedExample();
    const cases: [Parameters<typeof addPaymentStep>[0], string][] = [
      [
        { id: "s1", label: "x", trigger: "ON_SIGNATURE", percentage: 10 },
        "Payment step s1 already exists",
      ],
      [
        { id: "s9", label: "x", trigger: "ON_SIGNATURE", percentage: 100.5 },
        "A percentage is between 0 and 100",
      ],
      [
        { id: "s9", label: "x", trigger: "ON_SIGNATURE", percentage: -1 },
        "A percentage is between 0 and 100",
      ],
      [
        { id: "s9", label: "x", trigger: "ON_DATE", percentage: 10 },
        "A step paid on a date needs the date",
      ],
    ];
    for (const [input, message] of cases) {
      const after = reducer(before, addPaymentStep(input));
      expect(lastError(after)).toBe(message);
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });

  it("accepts the limits 0 and 100", () => {
    let document = reducer(
      utils.createDocument(),
      addPaymentStep({
        id: "a",
        label: "a",
        trigger: "ON_SIGNATURE",
        percentage: 0,
      }),
    );
    document = reducer(
      document,
      addPaymentStep({
        id: "b",
        label: "b",
        trigger: "ON_ACCEPTANCE",
        percentage: 100,
      }),
    );
    expect(document.operations.global.map((o) => o.error)).toStrictEqual([
      undefined,
      undefined,
    ]);
  });

  it("updates a step, keeping what is left out and ignoring null", () => {
    let document = reducer(
      workedExample(),
      updatePaymentStep({ id: "s1", label: "Down payment", percentage: 30 }),
    );
    expect(document.state.global.paymentSteps[0]).toMatchObject({
      label: "Down payment",
      percentage: 30,
      trigger: "ON_SIGNATURE",
    });
    document = reducer(
      document,
      updatePaymentStep({
        id: "s1",
        trigger: "ON_DATE",
        date: "2027-01-15T00:00:00.000Z",
      }),
    );
    expect(document.state.global.paymentSteps[0]).toMatchObject({
      trigger: "ON_DATE",
      date: "2027-01-15T00:00:00.000Z",
    });
    document = reducer(
      document,
      updatePaymentStep({
        id: "s1",
        label: null,
        trigger: null,
        percentage: null,
        date: null,
      }),
    );
    expect(document.state.global.paymentSteps[0]).toMatchObject({
      label: "Down payment",
      trigger: "ON_DATE",
      date: "2027-01-15T00:00:00.000Z",
    });
    document = reducer(
      document,
      updatePaymentStep({ id: "s1", trigger: "ON_ACCEPTANCE" }),
    );
    expect(document.state.global.paymentSteps[0]).toMatchObject({
      trigger: "ON_ACCEPTANCE",
      date: null,
    });
    expect(lastError(document)).toBeUndefined();
  });

  it("refuses an update to an unknown step, a bad percentage or a dated step without a date", () => {
    const before = workedExample();
    const cases: [Parameters<typeof updatePaymentStep>[0], string][] = [
      [{ id: "s9", label: "x" }, "Payment step s9 not found"],
      [{ id: "s1", percentage: 101 }, "A percentage is between 0 and 100"],
      [
        { id: "s1", trigger: "ON_DATE" },
        "A step paid on a date needs the date",
      ],
    ];
    for (const [input, message] of cases) {
      const after = reducer(before, updatePaymentStep(input));
      expect(lastError(after)).toBe(message);
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });

  it("removes a step and refuses an unknown one", () => {
    let document = reducer(workedExample(), removePaymentStep({ id: "s1" }));
    expect(document.state.global.paymentSteps.map((s) => s.id)).toStrictEqual([
      "s2",
    ]);
    document = reducer(document, removePaymentStep({ id: "s1" }));
    expect(lastError(document)).toBe("Payment step s1 not found");
  });

  it("refuses every payment change once the proposal is approved or sent", () => {
    for (const make of [approved, sent]) {
      const before = make();
      for (const action of [
        addPaymentStep({
          id: "s1",
          label: "x",
          trigger: "ON_SIGNATURE",
          percentage: 10,
        }),
        updatePaymentStep({ id: "s1", label: "x" }),
        removePaymentStep({ id: "s1" }),
      ]) {
        const after = reducer(before, action);
        expect(lastError(after)).toBe("Only a draft proposal can be edited");
        expect(after.state.global).toStrictEqual(before.state.global);
      }
    }
  });
});
