import {
  addDeliverable,
  addPackage,
  reducer,
  removeDeliverable,
  reorderDeliverables,
  setDeliverablePrice,
  setProposalDetails,
  updateDeliverable,
  updatePackage,
  utils,
} from "document-models/proposal/v1";
import { describe, expect, it } from "vitest";
import {
  approved,
  errors,
  lastError,
  sent,
  workedExample,
} from "./fixtures.js";

const priceOf = (
  document: ReturnType<typeof utils.createDocument>,
  id: string,
) => document.state.global.deliverables.find((d) => d.id === id)?.price;

/** A draft in EUR with one package p1 and one unpriced deliverable d1. */
function base() {
  let document = reducer(
    utils.createDocument(),
    setProposalDetails({ currency: "EUR" }),
  );
  document = reducer(
    document,
    addPackage({ id: "p1", code: "K-1", name: "Foundation" }),
  );
  document = reducer(
    document,
    addPackage({ id: "p2", code: "K-2", name: "Integration", price: 5000 }),
  );
  return reducer(
    document,
    addDeliverable({
      id: "d1",
      code: "K-1.1",
      packageId: "p1",
      title: "Kickoff",
    }),
  );
}

describe("a proposal's deliverables", () => {
  it("adds a deliverable with no price yet", () => {
    const document = reducer(
      base(),
      addDeliverable({
        id: "d2",
        code: "K-1.2",
        packageId: "p1",
        title: "Report",
        body: "A written report",
      }),
    );
    expect(errors(document).filter(Boolean)).toStrictEqual([]);
    expect(document.state.global.deliverables[1]).toStrictEqual({
      id: "d2",
      code: "K-1.2",
      packageId: "p1",
      title: "Report",
      body: "A written report",
      price: null,
    });
    expect(document.state.global.deliverables[0].body).toBeNull();
  });

  it("refuses a repeated id, a repeated code and an unknown package", () => {
    const before = base();
    const cases: [Parameters<typeof addDeliverable>[0], string][] = [
      [
        { id: "d1", code: "X", packageId: "p1", title: "x" },
        "Deliverable d1 already exists",
      ],
      [
        { id: "d2", code: "K-1.1", packageId: "p1", title: "x" },
        "Deliverable code K-1.1 is already used",
      ],
      [
        { id: "d2", code: "X", packageId: "p9", title: "x" },
        "Package p9 not found",
      ],
    ];
    for (const [input, message] of cases) {
      const after = reducer(before, addDeliverable(input));
      expect(lastError(after)).toBe(message);
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });

  it("updates a deliverable, keeping what is left out and clearing the body with null", () => {
    let document = reducer(
      base(),
      updateDeliverable({
        id: "d1",
        title: "Kick-off workshop",
        body: "Two days",
      }),
    );
    expect(document.state.global.deliverables[0]).toMatchObject({
      title: "Kick-off workshop",
      body: "Two days",
      code: "K-1.1",
    });
    document = reducer(
      document,
      updateDeliverable({ id: "d1", code: "K-1.0", packageId: "p2" }),
    );
    expect(document.state.global.deliverables[0]).toMatchObject({
      code: "K-1.0",
      packageId: "p2",
      title: "Kick-off workshop",
    });
    document = reducer(
      document,
      updateDeliverable({
        id: "d1",
        body: null,
        title: null,
        code: null,
        packageId: null,
      }),
    );
    expect(document.state.global.deliverables[0]).toMatchObject({
      code: "K-1.0",
      packageId: "p2",
      title: "Kick-off workshop",
      body: null,
    });
    document = reducer(
      document,
      updateDeliverable({ id: "d1", code: "K-1.0" }),
    );
    expect(errors(document).filter(Boolean)).toStrictEqual([]);
  });

  it("refuses an update to an unknown deliverable, a taken code or an unknown package", () => {
    const before = reducer(
      base(),
      addDeliverable({ id: "d2", code: "K-1.2", packageId: "p1", title: "x" }),
    );
    const cases: [Parameters<typeof updateDeliverable>[0], string][] = [
      [{ id: "d9", title: "x" }, "Deliverable d9 not found"],
      [{ id: "d1", code: "K-1.2" }, "Deliverable code K-1.2 is already used"],
      [{ id: "d1", packageId: "p9" }, "Package p9 not found"],
    ];
    for (const [input, message] of cases) {
      const after = reducer(before, updateDeliverable(input));
      expect(lastError(after)).toBe(message);
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });

  it("refuses to move a fixed-price deliverable into a package with its own price", () => {
    let document = reducer(
      base(),
      setDeliverablePrice({ id: "d1", pricing: "FIXED", amount: 900 }),
    );
    document = reducer(
      document,
      updateDeliverable({ id: "d1", packageId: "p2" }),
    );
    expect(lastError(document)).toBe(
      "Package p2 has its own price, so it cannot have a fixed-price deliverable",
    );
    expect(document.state.global.deliverables[0].packageId).toBe("p1");
    const included = reducer(
      reducer(base(), setDeliverablePrice({ id: "d1", pricing: "INCLUDED" })),
      updateDeliverable({ id: "d1", packageId: "p2" }),
    );
    expect(lastError(included)).toBeUndefined();
  });

  it("prices a deliverable fixed, with an upper amount for a range", () => {
    let document = reducer(
      base(),
      setDeliverablePrice({
        id: "d1",
        pricing: "FIXED",
        amount: 3000,
        currency: "EUR",
        note: "Per site",
      }),
    );
    expect(priceOf(document, "d1")).toStrictEqual({
      pricing: "FIXED",
      amount: 3000,
      upperAmount: null,
      period: null,
      unit: null,
      until: null,
      note: "Per site",
    });
    document = reducer(
      document,
      setDeliverablePrice({
        id: "d1",
        pricing: "FIXED",
        amount: 3000,
        upperAmount: 3000,
      }),
    );
    expect(priceOf(document, "d1")?.upperAmount).toBe(3000);
    document = reducer(
      document,
      setDeliverablePrice({
        id: "d1",
        pricing: "FIXED",
        amount: 3000,
        upperAmount: 4000,
        period: "YEAR",
        unit: "DAY",
        until: "2027-12-31T00:00:00.000Z",
      }),
    );
    expect(priceOf(document, "d1")).toMatchObject({
      upperAmount: 4000,
      period: null,
      unit: null,
      until: null,
      note: null,
    });
  });

  it("prices a deliverable included, with no amount", () => {
    let document = reducer(
      base(),
      setDeliverablePrice({ id: "d1", pricing: "FIXED", amount: 100 }),
    );
    document = reducer(
      document,
      setDeliverablePrice({
        id: "d1",
        pricing: "INCLUDED",
        note: "In the base fee",
        currency: "EUR",
      }),
    );
    expect(priceOf(document, "d1")).toStrictEqual({
      pricing: "INCLUDED",
      amount: null,
      upperAmount: null,
      period: null,
      unit: null,
      until: null,
      note: "In the base fee",
    });
    const before = document;
    for (const extra of [{ amount: 100 }, { upperAmount: 100 }]) {
      const after = reducer(
        before,
        setDeliverablePrice({ id: "d1", pricing: "INCLUDED", ...extra }),
      );
      expect(lastError(after)).toBe("An included deliverable has no amount");
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });

  it("prices a deliverable recurring, with a period and an end date", () => {
    const document = reducer(
      base(),
      setDeliverablePrice({
        id: "d1",
        pricing: "RECURRING",
        amount: 500,
        period: "MONTH",
        until: "2027-12-31T00:00:00.000Z",
        unit: "HOUR",
      }),
    );
    expect(priceOf(document, "d1")).toStrictEqual({
      pricing: "RECURRING",
      amount: 500,
      upperAmount: null,
      period: "MONTH",
      unit: null,
      until: "2027-12-31T00:00:00.000Z",
      note: null,
    });
  });

  it("prices a deliverable as a rate, with a unit", () => {
    const document = reducer(
      base(),
      setDeliverablePrice({
        id: "d1",
        pricing: "RATE",
        amount: 180,
        upperAmount: 220,
        unit: "HOUR",
        period: "MONTH",
      }),
    );
    expect(priceOf(document, "d1")).toStrictEqual({
      pricing: "RATE",
      amount: 180,
      upperAmount: 220,
      period: null,
      unit: "HOUR",
      until: null,
      note: null,
    });
  });

  it("refuses a price missing what its kind needs, and an upper amount below the amount", () => {
    const before = base();
    const cases: [Parameters<typeof setDeliverablePrice>[0], string][] = [
      [{ id: "d1", pricing: "FIXED" }, "A fixed price needs an amount"],
      [
        { id: "d1", pricing: "RECURRING", period: "MONTH" },
        "A recurring price needs an amount",
      ],
      [{ id: "d1", pricing: "RATE", unit: "DAY" }, "A rate needs an amount"],
      [
        { id: "d1", pricing: "RECURRING", amount: 100 },
        "A recurring price needs a period",
      ],
      [{ id: "d1", pricing: "RATE", amount: 100 }, "A rate needs a unit"],
      [
        { id: "d1", pricing: "FIXED", amount: 100, upperAmount: 99 },
        "The upper amount cannot be below the amount",
      ],
      [{ id: "d9", pricing: "INCLUDED" }, "Deliverable d9 not found"],
      [
        { id: "d1", pricing: "FIXED", amount: 100, currency: "CHF" },
        "Amounts are in the proposal's currency (EUR), not CHF",
      ],
    ];
    for (const [input, message] of cases) {
      const after = reducer(before, setDeliverablePrice(input));
      expect(lastError(after)).toBe(message);
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });

  it("refuses an amount before the proposal has a currency", () => {
    let document = reducer(
      utils.createDocument(),
      addPackage({ id: "p1", code: "K-1", name: "x" }),
    );
    document = reducer(
      document,
      addDeliverable({ id: "d1", code: "D", packageId: "p1", title: "x" }),
    );
    document = reducer(
      document,
      setDeliverablePrice({ id: "d1", pricing: "FIXED", amount: 10 }),
    );
    expect(lastError(document)).toBe(
      "Set the proposal's currency before entering an amount",
    );
    document = reducer(
      document,
      setDeliverablePrice({ id: "d1", pricing: "INCLUDED" }),
    );
    expect(lastError(document)).toBeUndefined();
  });

  it("refuses a fixed price in a package that has its own price, and a price change on one that is not fixed", () => {
    const before = base();
    const after = reducer(
      reducer(
        before,
        addDeliverable({
          id: "d2",
          code: "K-2.1",
          packageId: "p2",
          title: "x",
        }),
      ),
      setDeliverablePrice({ id: "d2", pricing: "FIXED", amount: 100 }),
    );
    expect(lastError(after)).toBe(
      "Package p2 has its own price, so it cannot have a fixed-price deliverable",
    );
    const recurring = reducer(
      reducer(
        before,
        addDeliverable({
          id: "d2",
          code: "K-2.1",
          packageId: "p2",
          title: "x",
        }),
      ),
      setDeliverablePrice({
        id: "d2",
        pricing: "RECURRING",
        amount: 100,
        period: "YEAR",
      }),
    );
    expect(lastError(recurring)).toBeUndefined();
  });

  it("removes a deliverable and refuses an unknown one", () => {
    let document = reducer(workedExample(), removeDeliverable({ id: "d6" }));
    expect(document.state.global.deliverables.map((d) => d.id)).toStrictEqual([
      "d1",
      "d2",
      "d3",
      "d4",
      "d5",
    ]);
    document = reducer(document, removeDeliverable({ id: "d6" }));
    expect(lastError(document)).toBe("Deliverable d6 not found");
  });

  it("reorders the deliverables, and only by a full permutation", () => {
    const before = base();
    const withTwo = reducer(
      before,
      addDeliverable({ id: "d2", code: "K-1.2", packageId: "p1", title: "x" }),
    );
    const reordered = reducer(
      withTwo,
      reorderDeliverables({ ids: ["d2", "d1"] }),
    );
    expect(reordered.state.global.deliverables.map((d) => d.id)).toStrictEqual([
      "d2",
      "d1",
    ]);
    for (const bad of [["d1"], ["d1", "d1"], ["d1", "d9"]]) {
      const after = reducer(withTwo, reorderDeliverables({ ids: bad }));
      expect(lastError(after)).toBe(
        "The new order must list every deliverable exactly once",
      );
    }
  });

  it("freezes the currency while an amount exists, and frees it again when none is left", () => {
    const before = workedExample();
    const changed = reducer(before, setProposalDetails({ currency: "CHF" }));
    expect(lastError(changed)).toBe(
      "The currency cannot change while an amount exists",
    );
    expect(changed.state.global.currency).toBe("EUR");
    const cleared = reducer(before, setProposalDetails({ currency: null }));
    expect(lastError(cleared)).toBe(
      "The currency cannot change while an amount exists",
    );
    const same = reducer(before, setProposalDetails({ currency: "EUR" }));
    expect(lastError(same)).toBeUndefined();

    const noAmount = reducer(
      reducer(utils.createDocument(), setProposalDetails({ currency: "EUR" })),
      setProposalDetails({ currency: "CHF" }),
    );
    expect(lastError(noAmount)).toBeUndefined();
    expect(noAmount.state.global.currency).toBe("CHF");
  });

  it("counts a deliverable price, a package price and an adjustment as amounts for the currency lock", () => {
    let withDeliverable = reducer(
      base(),
      updatePackage({ id: "p2", price: null }),
    );
    withDeliverable = reducer(
      withDeliverable,
      setDeliverablePrice({ id: "d1", pricing: "FIXED", amount: 1 }),
    );
    expect(
      lastError(
        reducer(withDeliverable, setProposalDetails({ currency: "CHF" })),
      ),
    ).toBe("The currency cannot change while an amount exists");
    const included = reducer(
      reducer(base(), updatePackage({ id: "p2", price: null })),
      setDeliverablePrice({ id: "d1", pricing: "INCLUDED" }),
    );
    expect(
      lastError(reducer(included, setProposalDetails({ currency: "CHF" }))),
    ).toBeUndefined();
  });

  it("refuses every deliverable change once the proposal is approved or sent", () => {
    for (const make of [approved, sent]) {
      const before = make();
      for (const action of [
        addDeliverable({ id: "d1", code: "X", packageId: "pkg-1", title: "x" }),
        updateDeliverable({ id: "d1" }),
        setDeliverablePrice({ id: "d1", pricing: "INCLUDED" }),
        removeDeliverable({ id: "d1" }),
        reorderDeliverables({ ids: [] }),
      ]) {
        const after = reducer(before, action);
        expect(lastError(after)).toBe("Only a draft proposal can be edited");
        expect(after.state.global).toStrictEqual(before.state.global);
      }
    }
  });
});
