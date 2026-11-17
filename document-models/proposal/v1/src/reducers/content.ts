import type {
  ProposalContentOperations,
  ProposalState,
} from "document-models/proposal/v1";
import {
  AnnexNotFoundError,
  ClauseNotFoundError,
  ClauseOrderMismatchError,
  DuplicateAnnexIdError,
  DuplicateClauseIdError,
  DuplicateFigureIdError,
  DuplicateSectionIdError,
  FigureAnchorNotFoundError,
  FigureNotFoundError,
  FigureOrderMismatchError,
  FileNameRequiredError,
  FileTypeRequiredError,
  ProposalNotDraftError,
  SectionKindTakenError,
  SectionNotFoundError,
  SectionOrderMismatchError,
} from "../../gen/content/error.js";
import { checkPermutation } from "./shared.js";

function checkDraft(state: ProposalState) {
  if (state.status !== "DRAFT")
    throw new ProposalNotDraftError("Only a draft proposal can be edited");
}

function checkedFile(file: {
  ref: `attachment://v${number}:${string}`;
  name: string;
  type: string;
}) {
  if (file.name.trim() === "")
    throw new FileNameRequiredError("A file needs a name");
  if (file.type.trim() === "")
    throw new FileTypeRequiredError("A file needs a type");
  return { ref: file.ref, name: file.name, type: file.type };
}

export const proposalContentOperations: ProposalContentOperations = {
  addSectionOperation(state, action) {
    const { id, kind, title, body, positioningId } = action.input;
    checkDraft(state);
    if (state.sections.some((section) => section.id === id))
      throw new DuplicateSectionIdError(`Section ${id} already exists`);
    if (kind !== "PROSE" && state.sections.some((s) => s.kind === kind))
      throw new SectionKindTakenError(
        `A ${kind} section is already in the proposal`,
      );
    state.sections.push({
      id,
      kind,
      title: title ?? null,
      body: body ?? null,
      positioningId: positioningId ?? null,
    });
  },
  updateSectionOperation(state, action) {
    const input = action.input;
    checkDraft(state);
    const section = state.sections.find((item) => item.id === input.id);
    if (!section)
      throw new SectionNotFoundError(`Section ${input.id} not found`);
    if (input.title !== undefined) section.title = input.title;
    if (input.body !== undefined) section.body = input.body;
    if (input.positioningId !== undefined)
      section.positioningId = input.positioningId;
  },
  removeSectionOperation(state, action) {
    const { id } = action.input;
    checkDraft(state);
    const index = state.sections.findIndex((section) => section.id === id);
    if (index === -1) throw new SectionNotFoundError(`Section ${id} not found`);
    state.sections.splice(index, 1);
    state.figures = state.figures.filter(
      (figure) => !(figure.anchorKind === "SECTION" && figure.anchorId === id),
    );
  },
  reorderSectionsOperation(state, action) {
    const { ids } = action.input;
    checkDraft(state);
    checkPermutation(state.sections, ids, () => {
      throw new SectionOrderMismatchError(
        "The new order must list every section exactly once",
      );
    });
    state.sections = ids.map((id) => state.sections.find((s) => s.id === id)!);
  },
  addClauseOperation(state, action) {
    const { id, kind, title, body } = action.input;
    checkDraft(state);
    if (state.clauses.some((clause) => clause.id === id))
      throw new DuplicateClauseIdError(`Clause ${id} already exists`);
    state.clauses.push({ id, kind, title, body: body ?? null });
  },
  updateClauseOperation(state, action) {
    const input = action.input;
    checkDraft(state);
    const clause = state.clauses.find((item) => item.id === input.id);
    if (!clause) throw new ClauseNotFoundError(`Clause ${input.id} not found`);
    if (input.kind != null) clause.kind = input.kind;
    if (input.title != null) clause.title = input.title;
    if (input.body !== undefined) clause.body = input.body;
  },
  removeClauseOperation(state, action) {
    const { id } = action.input;
    checkDraft(state);
    const index = state.clauses.findIndex((clause) => clause.id === id);
    if (index === -1) throw new ClauseNotFoundError(`Clause ${id} not found`);
    state.clauses.splice(index, 1);
  },
  reorderClausesOperation(state, action) {
    const { ids } = action.input;
    checkDraft(state);
    checkPermutation(state.clauses, ids, () => {
      throw new ClauseOrderMismatchError(
        "The new order must list every clause exactly once",
      );
    });
    state.clauses = ids.map((id) => state.clauses.find((c) => c.id === id)!);
  },
  addAnnexOperation(state, action) {
    const { id, kind, title, body, partOfAgreement } = action.input;
    checkDraft(state);
    if (state.annexes.some((annex) => annex.id === id))
      throw new DuplicateAnnexIdError(`Annex ${id} already exists`);
    state.annexes.push({
      id,
      kind,
      title,
      body: body ?? null,
      partOfAgreement: partOfAgreement ?? false,
    });
  },
  updateAnnexOperation(state, action) {
    const input = action.input;
    checkDraft(state);
    const annex = state.annexes.find((item) => item.id === input.id);
    if (!annex) throw new AnnexNotFoundError(`Annex ${input.id} not found`);
    if (input.kind != null) annex.kind = input.kind;
    if (input.title != null) annex.title = input.title;
    if (input.body !== undefined) annex.body = input.body;
    if (input.partOfAgreement != null)
      annex.partOfAgreement = input.partOfAgreement;
  },
  removeAnnexOperation(state, action) {
    const { id } = action.input;
    checkDraft(state);
    const index = state.annexes.findIndex((annex) => annex.id === id);
    if (index === -1) throw new AnnexNotFoundError(`Annex ${id} not found`);
    state.annexes.splice(index, 1);
  },
  addFigureOperation(state, action) {
    const { id, anchorKind, anchorId, file, caption } = action.input;
    checkDraft(state);
    if (state.figures.some((figure) => figure.id === id))
      throw new DuplicateFigureIdError(`Figure ${id} already exists`);
    const anchored =
      anchorKind === "SECTION"
        ? state.sections.some((s) => s.id === anchorId && s.kind === "PROSE")
        : state.useCases.some((u) => u.id === anchorId);
    if (!anchored)
      throw new FigureAnchorNotFoundError(
        `${anchorId} is not a prose section or a use case of this proposal`,
      );
    state.figures.push({
      id,
      anchorKind,
      anchorId,
      file: checkedFile(file),
      caption: caption ?? null,
    });
  },
  updateFigureOperation(state, action) {
    const input = action.input;
    checkDraft(state);
    const figure = state.figures.find((item) => item.id === input.id);
    if (!figure) throw new FigureNotFoundError(`Figure ${input.id} not found`);
    const file = input.file != null ? checkedFile(input.file) : null;
    if (file) figure.file = file;
    if (input.caption !== undefined) figure.caption = input.caption;
  },
  removeFigureOperation(state, action) {
    const { id } = action.input;
    checkDraft(state);
    const index = state.figures.findIndex((figure) => figure.id === id);
    if (index === -1) throw new FigureNotFoundError(`Figure ${id} not found`);
    state.figures.splice(index, 1);
  },
  reorderFiguresOperation(state, action) {
    const { anchorKind, anchorId, ids } = action.input;
    checkDraft(state);
    const own = (figure: { anchorKind: string; anchorId: string }) =>
      figure.anchorKind === anchorKind && figure.anchorId === anchorId;
    const current = state.figures.filter(own);
    checkPermutation(current, ids, () => {
      throw new FigureOrderMismatchError(
        "The new order must list every figure of this section or use case exactly once",
      );
    });
    const ordered = ids.map((id) => current.find((f) => f.id === id)!);
    let next = 0;
    state.figures = state.figures.map((figure) =>
      own(figure) ? ordered[next++] : figure,
    );
  },
};
