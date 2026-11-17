import { describe, expect, it } from "vitest";
import { computeProposalTotals } from "./proposal-totals.js";
import {
  deliverable,
  emptyProposal,
  fixed,
  option,
  pkg,
  step,
  workedExample,
} from "./fixtures.js";

describe("computeProposalTotals", () => {
  it("totals the worked example: 16,000, 21,000 and 25,000", () => {
    const { options } = computeProposalTotals(workedExample());
    expect(options.map((o) => [o.optionId, o.fixedTotal])).toEqual([
      ["oa", 16000],
      ["ob", 21000],
      ["oc", 25000],
    ]);
  });

  const totalOf = (state: ReturnType<typeof workedExample>, id: string) =>
    computeProposalTotals(state).options.find((o) => o.optionId === id)!;

  it("counts an included deliverable as nothing", () => {
    const state = workedExample();
    state.options = [option("only3", ["p3"])];
    expect(totalOf(state, "only3").fixedTotal).toBe(7000);
  });

  it("prices a package as a whole", () => {
    const state = workedExample();
    state.options = [option("only2", ["p2"])];
    expect(totalOf(state, "only2").fixedTotal).toBe(5000);
  });

  it("adds a surcharge and subtracts a discount", () => {
    const state = emptyProposal({
      packages: [pkg("p1")],
      deliverables: [fixed("d1", "p1", 1000)],
      options: [
        option(
          "x",
          ["p1"],
          [
            { id: "a", amount: 250 },
            { id: "b", amount: -100 },
          ],
        ),
      ],
    });
    expect(totalOf(state, "x").fixedTotal).toBe(1150);
  });

  it("splits the total into payments: 6,250 and 18,750 for option C", () => {
    expect(totalOf(workedExample(), "oc").payments).toEqual([
      { stepId: "s1", label: "Step s1", trigger: "ON_SIGNATURE", amount: 6250 },
      {
        stepId: "s2",
        label: "Step s2",
        trigger: "ON_ACCEPTANCE",
        amount: 18750,
      },
    ]);
  });

  it("rounds to cents and lets the last step absorb the remainder", () => {
    const state = emptyProposal({
      packages: [pkg("p1", 1000.01)],
      options: [option("x", ["p1"])],
      paymentSteps: [
        step("s1", "ON_SIGNATURE", 50),
        step("s2", "ON_ACCEPTANCE", 50),
      ],
    });
    expect(totalOf(state, "x").payments.map((p) => p.amount)).toEqual([
      500.01, 500,
    ]);
  });

  it("does not shift amounts when the steps do not add up to 100", () => {
    const state = emptyProposal({
      packages: [pkg("p1", 1000)],
      options: [option("x", ["p1"])],
      paymentSteps: [
        step("s1", "ON_SIGNATURE", 30),
        step("s2", "ON_ACCEPTANCE", 30),
      ],
    });
    expect(totalOf(state, "x").payments.map((p) => p.amount)).toEqual([
      300, 300,
    ]);
  });

  it("keeps recurring lines of two periods apart and out of the fixed total", () => {
    const monthly = (id: string, amount: number) =>
      deliverable(id, "p1", { pricing: "RECURRING", amount, period: "MONTH" });
    const state = emptyProposal({
      packages: [pkg("p1"), pkg("p2")],
      deliverables: [
        fixed("d1", "p1", 1000),
        monthly("m1", 500),
        deliverable("q1", "p1", {
          pricing: "RECURRING",
          amount: 1200,
          upperAmount: 1500,
          period: "QUARTER",
          until: "2027-12-31",
        }),
        monthly("m2", 300),
        { ...monthly("elsewhere", 999), packageId: "p2" },
      ],
      options: [option("x", ["p1"])],
    });
    const result = totalOf(state, "x");
    expect(result.fixedTotal).toBe(1000);
    expect(result.recurring).toEqual([
      {
        period: "MONTH",
        lines: [
          {
            deliverableId: "m1",
            packageId: "p1",
            amount: 500,
            upperAmount: null,
            until: null,
          },
          {
            deliverableId: "m2",
            packageId: "p1",
            amount: 300,
            upperAmount: null,
            until: null,
          },
        ],
      },
      {
        period: "QUARTER",
        lines: [
          {
            deliverableId: "q1",
            packageId: "p1",
            amount: 1200,
            upperAmount: 1500,
            until: "2027-12-31",
          },
        ],
      },
    ]);
  });

  it("lists rates of the option's packages", () => {
    const state = emptyProposal({
      packages: [pkg("p1")],
      deliverables: [
        deliverable("r1", "p1", { pricing: "RATE", amount: 120, unit: "HOUR" }),
        deliverable("r2", "p1", {
          pricing: "RATE",
          amount: 800,
          upperAmount: 900,
          unit: "DAY",
        }),
      ],
      options: [option("x", ["p1"])],
    });
    expect(totalOf(state, "x").rates).toEqual([
      {
        deliverableId: "r1",
        packageId: "p1",
        amount: 120,
        upperAmount: null,
        unit: "HOUR",
      },
      {
        deliverableId: "r2",
        packageId: "p1",
        amount: 800,
        upperAmount: 900,
        unit: "DAY",
      },
    ]);
  });

  it("gives the lowest and highest total across options", () => {
    expect(computeProposalTotals(workedExample()).range).toEqual({
      lowest: 16000,
      highest: 25000,
    });
  });

  it("has no range without options, and empty lists for a bare option", () => {
    expect(computeProposalTotals(emptyProposal()).range).toBeNull();
    const bare = emptyProposal({ options: [option("x", [])] });
    expect(totalOf(bare, "x")).toMatchObject({
      fixedTotal: 0,
      payments: [],
      recurring: [],
      rates: [],
    });
  });

  it("ignores packages an option names that do not exist, and a package named twice", () => {
    const state = emptyProposal({
      packages: [pkg("p1", 100)],
      options: [option("x", ["p1", "p1", "ghost"])],
    });
    expect(totalOf(state, "x").fixedTotal).toBe(100);
  });

  it("skips lines that are not priced yet", () => {
    const state = emptyProposal({
      packages: [pkg("p1")],
      deliverables: [
        { ...fixed("d1", "p1", 0), price: null },
        deliverable("d2", "p1", { pricing: "FIXED" }),
        deliverable("d3", "p1", { pricing: "RECURRING", amount: 5 }),
        deliverable("d4", "p1", { pricing: "RATE", amount: 5 }),
        deliverable("d5", "p1", { pricing: "RECURRING", period: "YEAR" }),
        deliverable("d6", "p1", { pricing: "RATE", unit: "DAY" }),
      ],
      options: [option("x", ["p1"])],
    });
    const result = totalOf(state, "x");
    expect(result.fixedTotal).toBe(0);
    expect(result.recurring.map((g) => g.lines[0].amount)).toEqual([0]);
    expect(result.rates.map((r) => r.amount)).toEqual([0]);
  });
});
