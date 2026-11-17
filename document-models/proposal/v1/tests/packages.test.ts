import {
  addDeliverable,
  addOption,
  addPackage,
  reducer,
  removePackage,
  reorderPackages,
  setDeliverablePrice,
  setProposalDetails,
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

const ids = (document: ReturnType<typeof utils.createDocument>) =>
  document.state.global.packages.map((p) => p.id);

describe("a proposal's packages", () => {
  it("adds a package with everything it can carry", () => {
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
      addPackage({
        id: "p2",
        code: "K-2",
        name: "Integration",
        summary: "Connects the systems",
        requires: ["p1"],
        price: 5000,
        currency: "EUR",
        targetDate: "2027-03-31T00:00:00.000Z",
      }),
    );
    expect(errors(document)).toStrictEqual([undefined, undefined, undefined]);
    expect(document.state.global.packages).toStrictEqual([
      {
        id: "p1",
        code: "K-1",
        name: "Foundation",
        summary: null,
        requires: [],
        price: null,
        targetDate: null,
      },
      {
        id: "p2",
        code: "K-2",
        name: "Integration",
        summary: "Connects the systems",
        requires: ["p1"],
        price: 5000,
        targetDate: "2027-03-31T00:00:00.000Z",
      },
    ]);
  });

  it("refuses a repeated id, a repeated code, an unknown or own requirement", () => {
    const before = reducer(
      utils.createDocument(),
      addPackage({ id: "p1", code: "K-1", name: "Foundation" }),
    );
    const cases: [Parameters<typeof addPackage>[0], string][] = [
      [{ id: "p1", code: "K-9", name: "x" }, "Package p1 already exists"],
      [
        { id: "p2", code: "K-1", name: "x" },
        "Package code K-1 is already used",
      ],
      [
        { id: "p2", code: "K-2", name: "x", requires: ["p9"] },
        "Required package p9 not found",
      ],
      [
        { id: "p2", code: "K-2", name: "x", requires: ["p2"] },
        "A package cannot require itself",
      ],
    ];
    for (const [input, message] of cases) {
      const after = reducer(before, addPackage(input));
      expect(lastError(after)).toBe(message);
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });

  it("refuses a price before the currency is set, and one in another currency", () => {
    const noCurrency = reducer(
      utils.createDocument(),
      addPackage({ id: "p1", code: "K-1", name: "x", price: 100 }),
    );
    expect(lastError(noCurrency)).toBe(
      "Set the proposal's currency before entering an amount",
    );

    const eur = reducer(
      utils.createDocument(),
      setProposalDetails({ currency: "EUR" }),
    );
    const usd = reducer(
      eur,
      addPackage({
        id: "p1",
        code: "K-1",
        name: "x",
        price: 100,
        currency: "USD",
      }),
    );
    expect(lastError(usd)).toBe(
      "Amounts are in the proposal's currency (EUR), not USD",
    );
    expect(usd.state.global.packages).toStrictEqual([]);
  });

  it("updates a package, keeping what is left out and clearing what is null", () => {
    let document = reducer(
      workedExample(),
      updatePackage({
        id: "p2",
        name: "Integration and data",
        summary: "New",
        targetDate: "2027-01-31T00:00:00.000Z",
      }),
    );
    expect(document.state.global.packages[1]).toMatchObject({
      name: "Integration and data",
      code: "BRI-2",
      summary: "New",
      price: 5000,
      requires: ["p1"],
      targetDate: "2027-01-31T00:00:00.000Z",
    });

    document = reducer(
      document,
      updatePackage({
        id: "p2",
        code: "BRI-22",
        price: 6000,
        currency: "EUR",
        requires: [],
      }),
    );
    expect(document.state.global.packages[1]).toMatchObject({
      code: "BRI-22",
      price: 6000,
      requires: [],
    });

    document = reducer(
      document,
      updatePackage({
        id: "p2",
        price: null,
        summary: null,
        targetDate: null,
        name: null,
        code: null,
        requires: null,
      }),
    );
    expect(document.state.global.packages[1]).toMatchObject({
      code: "BRI-22",
      name: "Integration and data",
      price: null,
      summary: null,
      targetDate: null,
      requires: [],
    });
    expect(errors(document).filter(Boolean)).toStrictEqual([]);
  });

  it("lets a package keep its own code when it is updated", () => {
    const document = reducer(
      workedExample(),
      updatePackage({ id: "p2", code: "BRI-2", name: "Same code" }),
    );
    expect(lastError(document)).toBeUndefined();
  });

  it("refuses an update to an unknown package, a taken code, a bad requirement or a bad price", () => {
    const before = workedExample();
    const cases: [Parameters<typeof updatePackage>[0], string][] = [
      [{ id: "p9", name: "x" }, "Package p9 not found"],
      [{ id: "p2", code: "BRI-1" }, "Package code BRI-1 is already used"],
      [{ id: "p2", requires: ["p9"] }, "Required package p9 not found"],
      [{ id: "p2", requires: ["p2"] }, "A package cannot require itself"],
      [
        { id: "p2", price: 100, currency: "GBP" },
        "Amounts are in the proposal's currency (EUR), not GBP",
      ],
      [
        { id: "p1", price: 100 },
        "Package p1 has fixed-price deliverables, so it cannot have a price of its own",
      ],
    ];
    for (const [input, message] of cases) {
      const after = reducer(before, updatePackage(input));
      expect(lastError(after)).toBe(message);
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });

  it("removes a package nothing points at, and refuses one a deliverable, an option or a package points at", () => {
    let document = reducer(
      workedExample(),
      addPackage({ id: "p4", code: "BRI-4", name: "Spare" }),
    );
    document = reducer(document, removePackage({ id: "p4" }));
    expect(ids(document)).toStrictEqual(["p1", "p2", "p3"]);

    const before = workedExample();
    const byDeliverable = reducer(before, removePackage({ id: "p3" }));
    expect(lastError(byDeliverable)).toBe(
      "Package p3 is still used by a deliverable, an option or another package",
    );

    let byOption = reducer(
      utils.createDocument(),
      addPackage({ id: "q1", code: "Q1", name: "x" }),
    );
    byOption = reducer(
      byOption,
      addOption({ id: "o1", label: "O", packageIds: ["q1"] }),
    );
    byOption = reducer(byOption, removePackage({ id: "q1" }));
    expect(lastError(byOption)).toBe(
      "Package q1 is still used by a deliverable, an option or another package",
    );

    let byPackage = reducer(
      utils.createDocument(),
      addPackage({ id: "q1", code: "Q1", name: "x" }),
    );
    byPackage = reducer(
      byPackage,
      addPackage({ id: "q2", code: "Q2", name: "y", requires: ["q1"] }),
    );
    byPackage = reducer(byPackage, removePackage({ id: "q1" }));
    expect(lastError(byPackage)).toBe(
      "Package q1 is still used by a deliverable, an option or another package",
    );
    expect(byPackage.state.global.packages).toHaveLength(2);

    const unknown = reducer(before, removePackage({ id: "p9" }));
    expect(lastError(unknown)).toBe("Package p9 not found");
  });

  it("reorders the packages, and only by a full permutation", () => {
    const before = workedExample();
    const reordered = reducer(
      before,
      reorderPackages({ ids: ["p3", "p1", "p2"] }),
    );
    expect(ids(reordered)).toStrictEqual(["p3", "p1", "p2"]);

    for (const bad of [
      ["p1", "p2"],
      ["p1", "p2", "p2"],
      ["p1", "p2", "p9"],
      ["p1", "p2", "p3", "p1"],
    ]) {
      const after = reducer(before, reorderPackages({ ids: bad }));
      expect(lastError(after)).toBe(
        "The new order must list every package exactly once",
      );
      expect(ids(after)).toStrictEqual(["p1", "p2", "p3"]);
    }
  });

  it("refuses every package change once the proposal is approved or sent", () => {
    for (const make of [approved, sent]) {
      const before = make();
      const attempts = [
        addPackage({ id: "p9", code: "Z", name: "x" }),
        updatePackage({ id: "pkg-1", name: "x" }),
        removePackage({ id: "pkg-1" }),
        reorderPackages({ ids: ["pkg-1"] }),
      ];
      for (const action of attempts) {
        const after = reducer(before, action);
        expect(lastError(after)).toBe("Only a draft proposal can be edited");
        expect(after.state.global).toStrictEqual(before.state.global);
      }
    }
  });

  it("refuses a package price on a package that has a fixed deliverable, either way round", () => {
    let document = reducer(
      workedExample(),
      addPackage({ id: "p4", code: "BRI-4", name: "Priced", price: 800 }),
    );
    document = reducer(
      document,
      addDeliverable({ id: "d9", code: "D9", packageId: "p4", title: "x" }),
    );
    document = reducer(
      document,
      setDeliverablePrice({ id: "d9", pricing: "FIXED", amount: 100 }),
    );
    expect(lastError(document)).toBe(
      "Package p4 has its own price, so it cannot have a fixed-price deliverable",
    );
  });

  it("updates the packages a package requires to existing ones", () => {
    const document = reducer(
      reducer(
        reducer(
          utils.createDocument(),
          addPackage({ id: "p1", code: "K-1", name: "Foundation" }),
        ),
        addPackage({ id: "p2", code: "K-2", name: "Integration" }),
      ),
      updatePackage({ id: "p2", requires: ["p1"] }),
    );
    expect(document.state.global.packages[1].requires).toEqual(["p1"]);
  });
});
