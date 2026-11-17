import type { ProposalState } from "document-models/proposal";

type Deliverable = ProposalState["deliverables"][number];
type Period = NonNullable<NonNullable<Deliverable["price"]>["period"]>;

export type PaymentAmount = {
  stepId: string;
  label: string;
  trigger: ProposalState["paymentSteps"][number]["trigger"];
  amount: number;
};

export type RecurringLine = {
  deliverableId: string;
  packageId: string;
  amount: number;
  upperAmount: number | null;
  until: string | null;
};

export type RecurringGroup = { period: Period; lines: RecurringLine[] };

export type RateLine = {
  deliverableId: string;
  packageId: string;
  amount: number;
  upperAmount: number | null;
  unit: "HOUR" | "DAY";
};

export type OptionTotals = {
  optionId: string;
  /** Packages priced as a whole, fixed deliverables and adjustments. */
  fixedTotal: number;
  payments: PaymentAmount[];
  /** Grouped by period, in the order month, quarter, year; empty periods left out. */
  recurring: RecurringGroup[];
  rates: RateLine[];
};

export type ProposalTotals = {
  options: OptionTotals[];
  /** Lowest and highest fixed total across options; null without options. */
  range: { lowest: number; highest: number } | null;
};

const PERIODS: Period[] = ["MONTH", "QUARTER", "YEAR"];
const toCents = (amount: number) => Math.round(amount * 100);

function paymentsFor(
  steps: ProposalState["paymentSteps"],
  fixedTotal: number,
): PaymentAmount[] {
  const totalCents = toCents(fixedTotal);
  const cents = steps.map((s) => Math.round((totalCents * s.percentage) / 100));
  const complete = steps.reduce((sum, s) => sum + s.percentage, 0) === 100;
  if (complete && cents.length > 0) {
    const others = cents.slice(0, -1).reduce((sum, c) => sum + c, 0);
    cents[cents.length - 1] = totalCents - others;
  }
  return steps.map((s, i) => ({
    stepId: s.id,
    label: s.label,
    trigger: s.trigger,
    amount: cents[i] / 100,
  }));
}

export function computeProposalTotals(state: ProposalState): ProposalTotals {
  const options = state.options.map((option): OptionTotals => {
    const packages = state.packages.filter((p) =>
      option.packageIds.includes(p.id),
    );
    const ids = new Set(packages.map((p) => p.id));
    const deliverables = state.deliverables.filter((d) => ids.has(d.packageId));

    let cents = 0;
    for (const p of packages) cents += toCents(p.price ?? 0);
    for (const a of option.adjustments) cents += toCents(a.amount);
    const recurring = new Map<Period, RecurringLine[]>();
    const rates: RateLine[] = [];
    for (const d of deliverables) {
      const price = d.price;
      if (!price) continue;
      if (price.pricing === "FIXED") cents += toCents(price.amount ?? 0);
      else if (price.pricing === "RECURRING" && price.period) {
        const lines = recurring.get(price.period) ?? [];
        lines.push({
          deliverableId: d.id,
          packageId: d.packageId,
          amount: price.amount ?? 0,
          upperAmount: price.upperAmount ?? null,
          until: price.until ?? null,
        });
        recurring.set(price.period, lines);
      } else if (price.pricing === "RATE" && price.unit) {
        rates.push({
          deliverableId: d.id,
          packageId: d.packageId,
          amount: price.amount ?? 0,
          upperAmount: price.upperAmount ?? null,
          unit: price.unit,
        });
      }
    }
    const fixedTotal = cents / 100;
    return {
      optionId: option.id,
      fixedTotal,
      payments: paymentsFor(state.paymentSteps, fixedTotal),
      recurring: PERIODS.filter((p) => recurring.has(p)).map((period) => ({
        period,
        lines: recurring.get(period)!,
      })),
      rates,
    };
  });
  const totals = options.map((o) => o.fixedTotal);
  return {
    options,
    range:
      totals.length === 0
        ? null
        : { lowest: Math.min(...totals), highest: Math.max(...totals) },
  };
}
