import type { MarketSegmentsOperations } from "document-models/market/v1";
import {
  DuplicateSegmentIdError,
  FiguresApprovedError,
  NegativeNumberError,
  OrganisationAlreadyLinkedError,
  OrganisationNotLinkedError,
  SegmentNameRequiredError,
  SegmentNotFoundError,
  SourceLinkRequiredError,
  SourceTitleRequiredError,
  TargetAboveAccountsError,
} from "../../gen/segments/error.js";

export const marketSegmentsOperations: MarketSegmentsOperations = {
  addSegmentOperation(state, action) {
    if (state.sizeStatus === "APPROVED")
      throw new FiguresApprovedError("Reopen the figures to change them");
    const { id, description } = action.input;
    const name = action.input.name.trim();
    if (name === "")
      throw new SegmentNameRequiredError("A segment needs a name");
    if (state.segments.some((s) => s.id === id))
      throw new DuplicateSegmentIdError(`Segment ${id} already exists`);
    state.segments.push({
      id,
      name,
      description: description ?? null,
      accounts: null,
      accountsSource: null,
      annualValue: null,
      annualValueSource: null,
      serviceable: false,
      targetAccounts: null,
      organisationIds: [],
    });
  },
  updateSegmentOperation(state, action) {
    if (state.sizeStatus === "APPROVED")
      throw new FiguresApprovedError("Reopen the figures to change them");
    const {
      id,
      name,
      description,
      accounts,
      annualValue,
      serviceable,
      targetAccounts,
    } = action.input;
    const segment = state.segments.find((s) => s.id === id);
    if (!segment) throw new SegmentNotFoundError(`Segment ${id} not found`);
    if (name !== undefined && (name === null || name.trim() === ""))
      throw new SegmentNameRequiredError("A segment needs a name");
    if ([accounts, annualValue, targetAccounts].some((n) => n != null && n < 0))
      throw new NegativeNumberError("A segment's numbers can't be negative");
    const nextAccounts = accounts === undefined ? segment.accounts : accounts;
    const nextTarget =
      targetAccounts === undefined ? segment.targetAccounts : targetAccounts;
    if (nextAccounts != null && nextTarget != null && nextTarget > nextAccounts)
      throw new TargetAboveAccountsError(
        "The target can't be more than the organisations in the segment",
      );
    if (name != null) segment.name = name.trim();
    if (description !== undefined) segment.description = description ?? null;
    if (accounts !== undefined) segment.accounts = accounts ?? null;
    if (annualValue !== undefined) segment.annualValue = annualValue ?? null;
    if (serviceable != null) segment.serviceable = serviceable;
    if (targetAccounts !== undefined)
      segment.targetAccounts = targetAccounts ?? null;
  },
  setSegmentSourceOperation(state, action) {
    if (state.sizeStatus === "APPROVED")
      throw new FiguresApprovedError("Reopen the figures to change them");
    const { id, figure, title, url, documentId } = action.input;
    const segment = state.segments.find((s) => s.id === id);
    if (!segment) throw new SegmentNotFoundError(`Segment ${id} not found`);
    let source: typeof segment.accountsSource = null;
    if (title != null || url != null || documentId != null) {
      if (title == null || title.trim() === "")
        throw new SourceTitleRequiredError("A source needs a title");
      if (url == null && documentId == null)
        throw new SourceLinkRequiredError(
          "A source needs a link or a vault note",
        );
      source = {
        title: title.trim(),
        url: url ?? null,
        documentId: documentId ?? null,
      };
    }
    if (figure === "ACCOUNTS") segment.accountsSource = source;
    else segment.annualValueSource = source;
  },
  linkSegmentOrganisationOperation(state, action) {
    const { id, organisationId } = action.input;
    const segment = state.segments.find((s) => s.id === id);
    if (!segment) throw new SegmentNotFoundError(`Segment ${id} not found`);
    if (segment.organisationIds.includes(organisationId))
      throw new OrganisationAlreadyLinkedError(
        "The organisation is already in the segment",
      );
    segment.organisationIds.push(organisationId);
  },
  unlinkSegmentOrganisationOperation(state, action) {
    const { id, organisationId } = action.input;
    const segment = state.segments.find((s) => s.id === id);
    if (!segment) throw new SegmentNotFoundError(`Segment ${id} not found`);
    const index = segment.organisationIds.indexOf(organisationId);
    if (index === -1)
      throw new OrganisationNotLinkedError(
        "The organisation is not in the segment",
      );
    segment.organisationIds.splice(index, 1);
  },
  removeSegmentOperation(state, action) {
    if (state.sizeStatus === "APPROVED")
      throw new FiguresApprovedError("Reopen the figures to change them");
    const index = state.segments.findIndex((s) => s.id === action.input.id);
    if (index === -1)
      throw new SegmentNotFoundError(`Segment ${action.input.id} not found`);
    state.segments.splice(index, 1);
  },
};
