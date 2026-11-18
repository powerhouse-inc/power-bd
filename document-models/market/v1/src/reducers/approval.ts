import type { MarketApprovalOperations } from "document-models/market/v1";
import {
  NothingCountedError,
  SizeNotApprovedError,
  SizeNotDraftError,
  SourceMissingError,
} from "../../gen/approval/error.js";

export const marketApprovalOperations: MarketApprovalOperations = {
  approveSizeOperation(state, action) {
    const { approvedBy, approvedAt } = action.input;
    if (state.sizeStatus !== "DRAFT")
      throw new SizeNotDraftError("Only draft figures can be approved");
    const counted = state.segments.filter(
      (s) => s.accounts != null && s.annualValue != null,
    );
    if (counted.length === 0)
      throw new NothingCountedError(
        "Count at least one segment before approving",
      );
    const missing = counted.find(
      (s) => !s.accountsSource || !s.annualValueSource,
    );
    if (missing)
      throw new SourceMissingError(
        `Add the sources for ${missing.name} before approving`,
      );
    state.sizeStatus = "APPROVED";
    state.sizeApprovedBy = approvedBy;
    state.sizeApprovedAt = approvedAt;
  },
  reopenSizeOperation(state) {
    if (state.sizeStatus !== "APPROVED")
      throw new SizeNotApprovedError("Only approved figures can be reopened");
    state.sizeStatus = "DRAFT";
    state.sizeApprovedBy = null;
    state.sizeApprovedAt = null;
  },
};
