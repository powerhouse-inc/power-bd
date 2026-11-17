import type {
  PlaybookProofsOperations,
  PlaybookState,
} from "document-models/playbook/v1";
import {
  ComparableAlreadyLinkedError,
  ComparableNotLinkedError,
  DuplicateEvidenceIdError,
  DuplicateProofCaseIdError,
  EvidenceNotFoundError,
  ProofCaseNotFoundError,
} from "../../gen/proofs/error.js";

function findProofCase(state: PlaybookState, id: string) {
  const proofCase = state.proofCases.find((candidate) => candidate.id === id);
  if (!proofCase)
    throw new ProofCaseNotFoundError(`Proof case ${id} not found`);
  return proofCase;
}

export const playbookProofsOperations: PlaybookProofsOperations = {
  addProofCaseOperation(state, action) {
    const { id, title, summary, mayBeNamedPublicly } = action.input;
    if (state.proofCases.some((proofCase) => proofCase.id === id))
      throw new DuplicateProofCaseIdError(`Proof case ${id} already exists`);
    state.proofCases.push({
      id,
      title,
      summary: summary ?? null,
      evidence: [],
      mayBeNamedPublicly,
      comparables: [],
    });
  },
  updateProofCaseOperation(state, action) {
    const { id, title, summary, mayBeNamedPublicly } = action.input;
    const proofCase = state.proofCases.find((candidate) => candidate.id === id);
    if (!proofCase)
      throw new ProofCaseNotFoundError(`Proof case ${id} not found`);
    if (title != null) proofCase.title = title;
    if (summary !== undefined) proofCase.summary = summary;
    if (mayBeNamedPublicly != null)
      proofCase.mayBeNamedPublicly = mayBeNamedPublicly;
  },
  removeProofCaseOperation(state, action) {
    const proofCase = findProofCase(state, action.input.id);
    state.proofCases.splice(state.proofCases.indexOf(proofCase), 1);
    for (const positioning of state.positioning)
      positioning.proofCaseIds = positioning.proofCaseIds.filter(
        (proofCaseId) => proofCaseId !== action.input.id,
      );
  },
  addProofEvidenceOperation(state, action) {
    const { proofCaseId, evidenceId, title } = action.input;
    const proofCase = findProofCase(state, proofCaseId);
    if (proofCase.evidence.some((evidence) => evidence.id === evidenceId))
      throw new DuplicateEvidenceIdError(
        `Evidence ${evidenceId} already exists`,
      );
    proofCase.evidence.push({ id: evidenceId, title });
  },
  removeProofEvidenceOperation(state, action) {
    const { proofCaseId, evidenceId } = action.input;
    const proofCase = findProofCase(state, proofCaseId);
    const index = proofCase.evidence.findIndex(
      (evidence) => evidence.id === evidenceId,
    );
    if (index === -1)
      throw new EvidenceNotFoundError(`Evidence ${evidenceId} not found`);
    proofCase.evidence.splice(index, 1);
  },
  linkProofComparableOperation(state, action) {
    const { proofCaseId, comparableId, title } = action.input;
    const proofCase = findProofCase(state, proofCaseId);
    if (
      proofCase.comparables.some((comparable) => comparable.id === comparableId)
    )
      throw new ComparableAlreadyLinkedError(
        `This note is already linked to proof case "${proofCase.title}".`,
      );
    proofCase.comparables.push({ id: comparableId, title });
  },
  unlinkProofComparableOperation(state, action) {
    const { proofCaseId, comparableId } = action.input;
    const proofCase = findProofCase(state, proofCaseId);
    const index = proofCase.comparables.findIndex(
      (comparable) => comparable.id === comparableId,
    );
    if (index === -1)
      throw new ComparableNotLinkedError(
        `This note is not linked to proof case "${proofCase.title}".`,
      );
    proofCase.comparables.splice(index, 1);
  },
};
