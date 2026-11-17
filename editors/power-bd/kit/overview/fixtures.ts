import type { DecisionState } from "document-models/decision";
import type { InvestorListState } from "document-models/investor-list";
import type { LeadState } from "document-models/lead";
import type { OpportunityState } from "document-models/opportunity";
import type { ProposalState } from "document-models/proposal";
import type { OverviewInput } from "./types.js";

export const NOW = "2026-11-16T10:00:00.000Z";
export const US = "Europe/Zurich";
export const ALICE = "0x00000000000000000000000000000000000000a1";
export const BOB = "0x00000000000000000000000000000000000000b2";

export const lead = (over: Partial<LeadState> = {}): LeadState =>
  ({
    name: "Acme Corp",
    status: "IN_TOUCH",
    owner: ALICE,
    angles: [],
    messages: [],
    nextSteps: [{ id: "s", text: "Call", dueDate: null, doneAt: null }],
    interactions: [],
    contactLinks: [],
    references: [],
    confidentialItems: [],
    ...over,
  }) as unknown as LeadState;

export const opportunity = (
  over: Partial<OpportunityState> = {},
): OpportunityState =>
  ({
    name: "Fund X",
    status: "PREPARING",
    owner: ALICE,
    rolling: false,
    goNoGoDecisions: [],
    steps: [],
    conditions: [],
    submissions: [],
    partners: [],
    nextSteps: [{ id: "s", text: "Draft", dueDate: null, doneAt: null }],
    interactions: [],
    contactLinks: [],
    references: [],
    confidentialItems: [],
    ...over,
  }) as unknown as OpportunityState;

export const decision = (over: Partial<DecisionState> = {}): DecisionState =>
  ({
    question: "Apply?",
    status: "OPEN",
    owner: ALICE,
    references: [],
    ...over,
  }) as unknown as DecisionState;

export const input = (over: Partial<OverviewInput> = {}): OverviewInput => ({
  now: NOW,
  leads: [],
  opportunities: [],
  investorLists: [],
  decisions: [],
  proposals: [],
  settings: { timeZone: US, dueWindowDays: 7 },
  ...over,
});

export const list = (rows: Partial<InvestorListState["rows"][number]>[]) =>
  ({
    rows: rows.map((r, i) => ({
      id: `r${i}`,
      name: `Fund ${i}`,
      state: "LISTED",
      comparables: [],
      ...r,
    })),
  }) as unknown as InvestorListState;

export const proposalRec = (
  id: string,
  over: Partial<ProposalState> = {},
): { id: string; state: ProposalState } => ({
  id,
  state: {
    title: "Scope A",
    currency: "EUR",
    leadId: "L",
    status: "SENT",
    validUntil: null,
    chosenOptionId: null,
    answeredAt: null,
    packages: [
      { id: "p1", price: 1000 },
      { id: "p2", price: 3000 },
    ],
    deliverables: [],
    paymentSteps: [],
    options: [
      { id: "o1", label: "Small", packageIds: ["p1"], adjustments: [] },
      { id: "o2", label: "Large", packageIds: ["p1", "p2"], adjustments: [] },
    ],
    ...over,
  } as unknown as ProposalState,
});
