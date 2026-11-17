import type {
  InvestorListRowsOperations,
  InvestorListState,
} from "document-models/investor-list/v1";
import {
  ComparableAlreadyLinkedError,
  ComparableNotLinkedError,
  DuplicateRowIdError,
  ExclusionReasonRequiredError,
  LeadRequiredError,
  OrganisationRequiredError,
  RepeatedRowIdError,
  RowEngagedError,
  RowNameRequiredError,
  RowNotFoundError,
} from "../../gen/rows/error.js";

/** The row with this id, if it can still change. */
function openRow(state: InvestorListState, id: string) {
  const row = state.rows.find((candidate) => candidate.id === id);
  if (!row) throw new RowNotFoundError(`Row ${id} not found`);
  if (row.state === "ENGAGED")
    throw new RowEngagedError(`Row ${id} is engaged and cannot change`);
  return row;
}

export const investorListRowsOperations: InvestorListRowsOperations = {
  addRowsOperation(state, action) {
    const { rows } = action.input;
    const batchIds = new Set<string>();
    for (const row of rows) {
      if (batchIds.has(row.id))
        throw new RepeatedRowIdError(
          `Row ${row.id} appears more than once in the batch`,
        );
      batchIds.add(row.id);
      if (state.rows.some((existing) => existing.id === row.id))
        throw new DuplicateRowIdError(`Row ${row.id} already exists`);
      if (row.name.trim() === "")
        throw new RowNameRequiredError("A row needs its organisation's name");
    }
    for (const row of rows) {
      state.rows.push({
        id: row.id,
        name: row.name,
        website: row.website ?? null,
        sourceList: row.sourceList ?? null,
        state: "LISTED",
        exclusionReason: null,
        thesisNote: null,
        comparables: [],
        organisationId: null,
        leadId: null,
      });
    }
  },
  updateRowOperation(state, action) {
    const { id, name, website, sourceList } = action.input;
    const row = openRow(state, id);
    if (name != null && name.trim() === "")
      throw new RowNameRequiredError("A row needs its organisation's name");
    if (name != null) row.name = name;
    if (website !== undefined) row.website = website;
    if (sourceList !== undefined) row.sourceList = sourceList;
  },
  shortlistRowOperation(state, action) {
    const row = openRow(state, action.input.id);
    row.state = "SHORTLISTED";
    row.exclusionReason = null;
  },
  excludeRowOperation(state, action) {
    const row = openRow(state, action.input.id);
    if (action.input.reason.trim() === "")
      throw new ExclusionReasonRequiredError("Excluding a row needs a reason");
    row.state = "EXCLUDED";
    row.exclusionReason = action.input.reason;
  },
  relistRowOperation(state, action) {
    const row = openRow(state, action.input.id);
    row.state = "LISTED";
    row.exclusionReason = null;
  },
  setRowThesisOperation(state, action) {
    const row = openRow(state, action.input.id);
    row.thesisNote = action.input.thesisNote ?? null;
  },
  linkRowComparableOperation(state, action) {
    const { rowId, comparableId, title } = action.input;
    const row = openRow(state, rowId);
    if (row.comparables.some((comparable) => comparable.id === comparableId))
      throw new ComparableAlreadyLinkedError(
        `This note is already linked to "${row.name}".`,
      );
    row.comparables.push({ id: comparableId, title });
  },
  unlinkRowComparableOperation(state, action) {
    const { rowId, comparableId } = action.input;
    const row = openRow(state, rowId);
    const index = row.comparables.findIndex(
      (comparable) => comparable.id === comparableId,
    );
    if (index === -1)
      throw new ComparableNotLinkedError(
        `This note is not linked to "${row.name}".`,
      );
    row.comparables.splice(index, 1);
  },
  markRowEngagedOperation(state, action) {
    const { id, organisationId, leadId } = action.input;
    const row = openRow(state, id);
    if (organisationId.trim() === "")
      throw new OrganisationRequiredError(
        "Engaging a row needs its organisation",
      );
    if (leadId.trim() === "")
      throw new LeadRequiredError("Engaging a row needs its investor lead");
    row.state = "ENGAGED";
    row.organisationId = organisationId;
    row.leadId = leadId;
  },
  removeRowOperation(state, action) {
    const row = openRow(state, action.input.id);
    state.rows.splice(state.rows.indexOf(row), 1);
  },
};
