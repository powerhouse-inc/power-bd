import type { ProposalState } from "document-models/proposal";

type Deliverable = ProposalState["deliverables"][number];
type DeliverablePrice = NonNullable<Deliverable["price"]>;

/** An empty draft in EUR; tests add only what they need. */
export function emptyProposal(
  overrides: Partial<ProposalState> = {},
): ProposalState {
  return {
    title: null,
    code: "BRI",
    leadId: null,
    recipient: null,
    contractingEntity: null,
    currency: "EUR",
    validUntil: null,
    revisesProposalId: null,
    bindingOnSignature: false,
    processesPersonalData: false,
    status: "DRAFT",
    approvedBy: null,
    approvedAt: null,
    sentBy: null,
    sentAt: null,
    sentCopy: null,
    chosenOptionId: null,
    answeredAt: null,
    reason: null,
    signedCopy: null,
    supersededByProposalId: null,
    references: [],
    packages: [],
    deliverables: [],
    options: [],
    paymentSteps: [],
    actors: [],
    annexes: [],
    boundaries: [],
    clauses: [],
    figures: [],
    sections: [],
    useCases: [],
    ...overrides,
  };
}

export function pkg(
  id: string,
  price: number | null = null,
): ProposalState["packages"][number] {
  return {
    id,
    code: id.toUpperCase(),
    name: id,
    summary: null,
    requires: [],
    price,
    targetDate: null,
  };
}

export function deliverable(
  id: string,
  packageId: string,
  price: Partial<DeliverablePrice> & Pick<DeliverablePrice, "pricing">,
): Deliverable {
  return {
    id,
    code: id.toUpperCase(),
    packageId,
    title: `Title ${id}`,
    body: null,
    price: {
      amount: null,
      upperAmount: null,
      period: null,
      unit: null,
      until: null,
      note: null,
      ...price,
    },
  };
}

export const fixed = (id: string, packageId: string, amount: number) =>
  deliverable(id, packageId, { pricing: "FIXED", amount });

export function option(
  id: string,
  packageIds: string[],
  adjustments: { id: string; amount: number }[] = [],
): ProposalState["options"][number] {
  return {
    id,
    label: `Option ${id}`,
    packageIds,
    adjustments: adjustments.map((a) => ({
      ...a,
      label: `Adjustment ${a.id}`,
      condition: null,
    })),
  };
}

export function step(
  id: string,
  trigger: "ON_SIGNATURE" | "ON_ACCEPTANCE" | "ON_DATE",
  percentage: number,
): ProposalState["paymentSteps"][number] {
  return { id, label: `Step ${id}`, trigger, percentage, date: null };
}

/**
 * The spec's worked example (invented, EUR). Package 1: fixed 3,000, 9,000, 4,000.
 * Package 2 requires 1, priced as a whole at 5,000. Package 3 requires both: 2,500,
 * 4,500 and one included deliverable. Option C: all three, -3,000 discount.
 * Steps: 25 % on signature, 75 % on acceptance.
 */
export function workedExample(): ProposalState {
  return emptyProposal({
    packages: [
      pkg("p1"),
      { ...pkg("p2", 5000), requires: ["p1"] },
      { ...pkg("p3"), requires: ["p1", "p2"] },
    ],
    deliverables: [
      fixed("d1", "p1", 3000),
      fixed("d2", "p1", 9000),
      fixed("d3", "p1", 4000),
      fixed("d4", "p3", 2500),
      fixed("d5", "p3", 4500),
      deliverable("d6", "p3", { pricing: "INCLUDED" }),
    ],
    options: [
      option("oa", ["p1"]),
      option("ob", ["p1", "p2"]),
      option("oc", ["p1", "p2", "p3"], [{ id: "adj", amount: -3000 }]),
    ],
    paymentSteps: [
      step("s1", "ON_SIGNATURE", 25),
      step("s2", "ON_ACCEPTANCE", 75),
    ],
  });
}
