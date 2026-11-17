import {
  addAdjustment,
  addOption,
  approveProposal,
  recordProposalAnswer,
  reducer,
  removeAdjustment,
  removeOption,
  setProposalDetails,
  updateOption,
  utils,
} from "document-models/proposal/v1";
import { describe, expect, it } from "vitest";
import {
  approved,
  errors,
  JONAS,
  lastError,
  readyDraft,
  sent,
  T0,
  T2,
  workedExample,
} from "./fixtures.js";

const optionOf = (
  document: ReturnType<typeof utils.createDocument>,
  id: string,
) => document.state.global.options.find((o) => o.id === id);

describe("a proposal's options", () => {
  it("adds an option naming its packages, with no adjustments yet", () => {
    const document = workedExample();
    expect(optionOf(document, "oc")).toStrictEqual({
      id: "oc",
      label: "C",
      packageIds: ["p1", "p2", "p3"],
      adjustments: [
        {
          id: "adj-1",
          label: "Commitment discount",
          amount: -3000,
          condition: null,
        },
      ],
    });
    expect(optionOf(document, "oa")?.adjustments).toStrictEqual([]);
  });

  it("refuses a repeated id, an unknown package and a package named twice", () => {
    const before = readyDraft();
    const cases: [Parameters<typeof addOption>[0], string][] = [
      [
        { id: "option-a", label: "x", packageIds: ["pkg-1"] },
        "Option option-a already exists",
      ],
      [
        { id: "o9", label: "x", packageIds: ["pkg-9"] },
        "Package pkg-9 not found",
      ],
      [
        { id: "o9", label: "x", packageIds: ["pkg-1", "pkg-1"] },
        "Package pkg-1 is named twice in the option",
      ],
    ];
    for (const [input, message] of cases) {
      const after = reducer(before, addOption(input));
      expect(lastError(after)).toBe(message);
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });

  it("updates an option's label and packages, keeping what is left out", () => {
    let document = reducer(
      workedExample(),
      updateOption({ id: "oa", label: "Foundation only" }),
    );
    expect(optionOf(document, "oa")).toMatchObject({
      label: "Foundation only",
      packageIds: ["p1"],
    });
    document = reducer(
      document,
      updateOption({ id: "oa", packageIds: ["p1", "p2"] }),
    );
    expect(optionOf(document, "oa")).toMatchObject({
      label: "Foundation only",
      packageIds: ["p1", "p2"],
    });
    document = reducer(
      document,
      updateOption({ id: "oa", label: null, packageIds: null }),
    );
    expect(optionOf(document, "oa")).toMatchObject({
      label: "Foundation only",
      packageIds: ["p1", "p2"],
    });
  });

  it("refuses an update to an unknown option, an unknown package or a package named twice", () => {
    const before = workedExample();
    const cases: [Parameters<typeof updateOption>[0], string][] = [
      [{ id: "o9", label: "x" }, "Option o9 not found"],
      [{ id: "oa", packageIds: ["p9"] }, "Package p9 not found"],
      [
        { id: "oa", packageIds: ["p1", "p1"] },
        "Package p1 is named twice in the option",
      ],
    ];
    for (const [input, message] of cases) {
      const after = reducer(before, updateOption(input));
      expect(lastError(after)).toBe(message);
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });

  it("removes an option and refuses an unknown one", () => {
    let document = reducer(workedExample(), removeOption({ id: "ob" }));
    expect(document.state.global.options.map((o) => o.id)).toStrictEqual([
      "oa",
      "oc",
    ]);
    document = reducer(document, removeOption({ id: "ob" }));
    expect(lastError(document)).toBe("Option ob not found");
  });

  it("adds and removes an adjustment, with a condition when there is one", () => {
    let document = reducer(
      workedExample(),
      addAdjustment({
        optionId: "ob",
        id: "adj-2",
        label: "Early signature",
        amount: -500,
        currency: "EUR",
        condition: "Signed by 15 December",
      }),
    );
    expect(optionOf(document, "ob")?.adjustments).toStrictEqual([
      {
        id: "adj-2",
        label: "Early signature",
        amount: -500,
        condition: "Signed by 15 December",
      },
    ]);
    document = reducer(
      document,
      removeAdjustment({ optionId: "ob", id: "adj-2" }),
    );
    expect(optionOf(document, "ob")?.adjustments).toStrictEqual([]);
  });

  it("refuses an adjustment on an unknown option, with a repeated id, in another currency or before the currency is set", () => {
    const before = workedExample();
    const cases: [Parameters<typeof addAdjustment>[0], string][] = [
      [
        { optionId: "o9", id: "x", label: "x", amount: 1 },
        "Option o9 not found",
      ],
      [
        { optionId: "ob", id: "adj-1", label: "x", amount: 1 },
        "Adjustment adj-1 already exists",
      ],
      [
        { optionId: "ob", id: "x", label: "x", amount: 1, currency: "USD" },
        "Amounts are in the proposal's currency (EUR), not USD",
      ],
    ];
    for (const [input, message] of cases) {
      const after = reducer(before, addAdjustment(input));
      expect(lastError(after)).toBe(message);
      expect(after.state.global).toStrictEqual(before.state.global);
    }
    const noCurrency = reducer(
      reducer(utils.createDocument(), setProposalDetails({})),
      addAdjustment({ optionId: "o1", id: "a", label: "x", amount: 1 }),
    );
    expect(lastError(noCurrency)).toBe("Option o1 not found");
    let bare = reducer(readyDraft(), setProposalDetails({ currency: null }));
    bare = reducer(
      bare,
      addAdjustment({ optionId: "option-a", id: "a", label: "x", amount: 1 }),
    );
    expect(lastError(bare)).toBe(
      "Set the proposal's currency before entering an amount",
    );
  });

  it("refuses to remove an adjustment that is not there", () => {
    const before = workedExample();
    const noOption = reducer(
      before,
      removeAdjustment({ optionId: "o9", id: "adj-1" }),
    );
    const noAdjustment = reducer(
      before,
      removeAdjustment({ optionId: "oa", id: "adj-1" }),
    );
    expect(lastError(noOption)).toBe("Option o9 not found");
    expect(lastError(noAdjustment)).toBe(
      "Adjustment adj-1 not found in option oa",
    );
  });

  it("refuses every option change once the proposal is approved or sent", () => {
    for (const make of [approved, sent]) {
      const before = make();
      for (const action of [
        addOption({ id: "o9", label: "x", packageIds: [] }),
        updateOption({ id: "option-a", label: "x" }),
        removeOption({ id: "option-a" }),
        addAdjustment({ optionId: "option-a", id: "a", label: "x", amount: 1 }),
        removeAdjustment({ optionId: "option-a", id: "a" }),
      ]) {
        const after = reducer(before, action);
        expect(lastError(after)).toBe("Only a draft proposal can be edited");
        expect(after.state.global).toStrictEqual(before.state.global);
      }
    }
  });
});

describe("the two rules that need options", () => {
  it("refuses approval without an option that has at least one package", () => {
    let none = reducer(readyDraft(), removeOption({ id: "option-a" }));
    none = reducer(none, removeOption({ id: "option-b" }));
    const after = reducer(
      none,
      approveProposal({ approvedBy: JONAS, approvedAt: T0 }),
    );
    expect(lastError(after)).toBe(
      "Approval needs an option with at least one package",
    );
    expect(after.state.global.status).toBe("DRAFT");

    const empty = reducer(
      none,
      addOption({ id: "o1", label: "Empty", packageIds: [] }),
    );
    expect(
      lastError(
        reducer(empty, approveProposal({ approvedBy: JONAS, approvedAt: T0 })),
      ),
    ).toBe("Approval needs an option with at least one package");

    const withPackage = reducer(
      empty,
      updateOption({ id: "o1", packageIds: ["pkg-1"] }),
    );
    expect(
      lastError(
        reducer(
          withPackage,
          approveProposal({ approvedBy: JONAS, approvedAt: T0 }),
        ),
      ),
    ).toBeUndefined();
  });

  it("refuses an accepted answer that names no option or one that does not exist", () => {
    for (const chosenOptionId of [undefined, null, "option-z"]) {
      const before = sent();
      const after = reducer(
        before,
        recordProposalAnswer({
          accepted: true,
          chosenOptionId,
          answeredAt: T2,
        }),
      );
      expect(lastError(after)).toBe(
        "An accepted answer needs an option that exists",
      );
      expect(after.state.global).toStrictEqual(before.state.global);
    }
    expect(
      errors(
        reducer(
          sent(),
          recordProposalAnswer({
            accepted: true,
            chosenOptionId: "option-b",
            answeredAt: T2,
          }),
        ),
      ).at(-1),
    ).toBeUndefined();
  });
});
