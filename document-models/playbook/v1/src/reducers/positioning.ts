import type {
  PlaybookPositioningOperations,
  PlaybookState,
} from "document-models/playbook/v1";
import {
  ComparableAlreadyLinkedError,
  ComparableNotLinkedError,
  DuplicatePositioningIdError,
  PositioningNotDraftError,
  PositioningNotFoundError,
  PositioningRetiredError,
  ProofCaseAlreadyLinkedError,
  ProofCaseNotFoundError,
  ProofCaseNotLinkedError,
} from "../../gen/positioning/error.js";

/** The positioning with this id, if it can still change. */
function openPositioning(state: PlaybookState, id: string) {
  const positioning = state.positioning.find((item) => item.id === id);
  if (!positioning)
    throw new PositioningNotFoundError(`Positioning ${id} not found`);
  if (positioning.status === "RETIRED")
    throw new PositioningRetiredError(
      `Positioning ${id} is retired and cannot change`,
    );
  return positioning;
}

export const playbookPositioningOperations: PlaybookPositioningOperations = {
  addPositioningOperation(state, action) {
    const { id, title, text } = action.input;
    if (state.positioning.some((item) => item.id === id))
      throw new DuplicatePositioningIdError(`Positioning ${id} already exists`);
    state.positioning.push({
      id,
      title,
      text,
      status: "DRAFT",
      approvedBy: null,
      approvedAt: null,
      comparables: [],
      proofCaseIds: [],
    });
  },
  updatePositioningOperation(state, action) {
    const { id, title, text } = action.input;
    const positioning = openPositioning(state, id);
    if (title != null) positioning.title = title;
    if (text != null) positioning.text = text;
    if (positioning.status === "APPROVED") {
      positioning.status = "DRAFT";
      positioning.approvedBy = null;
      positioning.approvedAt = null;
    }
  },
  approvePositioningOperation(state, action) {
    const { id, approvedBy, approvedAt } = action.input;
    const positioning = state.positioning.find((item) => item.id === id);
    if (!positioning)
      throw new PositioningNotFoundError(`Positioning ${id} not found`);
    if (positioning.status !== "DRAFT")
      throw new PositioningNotDraftError("Only a draft can be approved");
    positioning.status = "APPROVED";
    positioning.approvedBy = approvedBy;
    positioning.approvedAt = approvedAt;
  },
  retirePositioningOperation(state, action) {
    openPositioning(state, action.input.id).status = "RETIRED";
  },
  linkPositioningComparableOperation(state, action) {
    const { positioningId, comparableId, title } = action.input;
    const positioning = openPositioning(state, positioningId);
    if (positioning.comparables.some((item) => item.id === comparableId))
      throw new ComparableAlreadyLinkedError(
        `This note is already linked to positioning "${positioning.title}".`,
      );
    positioning.comparables.push({ id: comparableId, title });
  },
  unlinkPositioningComparableOperation(state, action) {
    const { positioningId, comparableId } = action.input;
    const positioning = openPositioning(state, positioningId);
    const index = positioning.comparables.findIndex(
      (item) => item.id === comparableId,
    );
    if (index === -1)
      throw new ComparableNotLinkedError(
        `This note is not linked to positioning "${positioning.title}".`,
      );
    positioning.comparables.splice(index, 1);
  },
  linkPositioningProofOperation(state, action) {
    const { positioningId, proofCaseId } = action.input;
    const positioning = openPositioning(state, positioningId);
    if (!state.proofCases.some((item) => item.id === proofCaseId))
      throw new ProofCaseNotFoundError(`Proof case ${proofCaseId} not found`);
    if (positioning.proofCaseIds.includes(proofCaseId))
      throw new ProofCaseAlreadyLinkedError(
        `Proof case "${state.proofCases.find((item) => item.id === proofCaseId)?.title}" is already linked to positioning "${positioning.title}".`,
      );
    positioning.proofCaseIds.push(proofCaseId);
  },
  unlinkPositioningProofOperation(state, action) {
    const { positioningId, proofCaseId } = action.input;
    const positioning = openPositioning(state, positioningId);
    const index = positioning.proofCaseIds.indexOf(proofCaseId);
    if (index === -1)
      throw new ProofCaseNotLinkedError(
        `That proof case is not linked to positioning "${positioning.title}".`,
      );
    positioning.proofCaseIds.splice(index, 1);
  },
};
