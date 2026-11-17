import {
  addAdjustment,
  addDeliverable,
  addOption,
  addPackage,
  addPaymentStep,
  approveProposal,
  markProposalSent,
  recordProposalAnswer,
  reducer,
  setDeliverablePrice,
  setProposalDetails,
  setProposalParties,
  utils,
} from "document-models/proposal/v1";

export type ProposalDocument = ReturnType<typeof utils.createDocument>;

export const JONAS = "0x1111111111111111111111111111111111111aaa";
export const INES = "0x2222222222222222222222222222222222222bbb";
export const FILE_A =
  "attachment://v1:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as const;
export const FILE_B =
  "attachment://v1:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as const;
export const DAY = "2026-11-20T00:00:00.000Z";
export const T0 = "2026-11-02T09:00:00.000Z";
export const T1 = "2026-11-03T10:30:00.000Z";
export const T2 = "2026-11-10T08:15:00.000Z";

/** The error of each operation, in the order they were dispatched. */
export function errors(document: ProposalDocument) {
  return document.operations.global.map((operation) => operation.error);
}

/** The error of the last operation dispatched. */
export function lastError(document: ProposalDocument) {
  return document.operations.global.at(-1)?.error;
}

/** A draft that has everything approval asks of it: a lead, an entity, a currency, a date. */
export function readyDraft(): ProposalDocument {
  let document = utils.createDocument();
  document = reducer(
    document,
    setProposalDetails({
      title: "Research partnership for Brisa Labs",
      code: "BRI",
      currency: "EUR",
      validUntil: DAY,
    }),
  );
  document = reducer(
    document,
    setProposalParties({
      leadId: "lead-brisa",
      recipient: { contactId: "contact-brisa", personId: "person-ines" },
      contractingEntity: { id: "note-halloway", title: "Halloway Fund AG" },
    }),
  );
  document = reducer(
    document,
    addPackage({ id: "pkg-1", code: "BRI-1", name: "Discovery" }),
  );
  document = reducer(
    document,
    addOption({ id: "option-a", label: "Option A", packageIds: ["pkg-1"] }),
  );
  return reducer(
    document,
    addOption({ id: "option-b", label: "Option B", packageIds: ["pkg-1"] }),
  );
}

export function approved(): ProposalDocument {
  return reducer(
    readyDraft(),
    approveProposal({ approvedBy: JONAS, approvedAt: T0 }),
  );
}

export function sent(): ProposalDocument {
  return reducer(approved(), markProposalSent({ sentBy: JONAS, sentAt: T1 }));
}

export function accepted(): ProposalDocument {
  return reducer(
    sent(),
    recordProposalAnswer({
      accepted: true,
      chosenOptionId: "option-a",
      answeredAt: T2,
    }),
  );
}

export function declined(): ProposalDocument {
  return reducer(
    sent(),
    recordProposalAnswer({
      accepted: false,
      reason: "The budget is spent for this year",
      answeredAt: T2,
    }),
  );
}

/**
 * The spec's worked example, in EUR: package 1 has fixed deliverables of 3,000,
 * 9,000 and 4,000; package 2 requires package 1 and is priced at 5,000; package 3
 * requires both, with 2,500, 4,500 and one included deliverable. Option C names all
 * three with a -3,000 commitment discount. Steps: 25 % on signature, 75 % on acceptance.
 */
export function workedExample(): ProposalDocument {
  let document = utils.createDocument();
  const send = (action: Parameters<typeof reducer>[1]) => {
    document = reducer(document, action);
  };
  send(setProposalDetails({ title: "Rollout", code: "BRI", currency: "EUR" }));
  send(addPackage({ id: "p1", code: "BRI-1", name: "Foundation" }));
  send(
    addPackage({
      id: "p2",
      code: "BRI-2",
      name: "Integration",
      requires: ["p1"],
      price: 5000,
    }),
  );
  send(
    addPackage({
      id: "p3",
      code: "BRI-3",
      name: "Operations",
      requires: ["p1", "p2"],
    }),
  );
  const fixed = (id: string, packageId: string, amount: number) => {
    send(addDeliverable({ id, code: id.toUpperCase(), packageId, title: id }));
    send(setDeliverablePrice({ id, pricing: "FIXED", amount }));
  };
  fixed("d1", "p1", 3000);
  fixed("d2", "p1", 9000);
  fixed("d3", "p1", 4000);
  fixed("d4", "p3", 2500);
  fixed("d5", "p3", 4500);
  send(
    addDeliverable({
      id: "d6",
      code: "D6",
      packageId: "p3",
      title: "Handover",
    }),
  );
  send(setDeliverablePrice({ id: "d6", pricing: "INCLUDED" }));
  send(addOption({ id: "oa", label: "A", packageIds: ["p1"] }));
  send(addOption({ id: "ob", label: "B", packageIds: ["p1", "p2"] }));
  send(addOption({ id: "oc", label: "C", packageIds: ["p1", "p2", "p3"] }));
  send(
    addAdjustment({
      optionId: "oc",
      id: "adj-1",
      label: "Commitment discount",
      amount: -3000,
    }),
  );
  send(
    addPaymentStep({
      id: "s1",
      label: "On signature",
      trigger: "ON_SIGNATURE",
      percentage: 25,
    }),
  );
  send(
    addPaymentStep({
      id: "s2",
      label: "On acceptance",
      trigger: "ON_ACCEPTANCE",
      percentage: 75,
    }),
  );
  return document;
}
