import type { MarketFiguresOperations } from "document-models/market/v1";
import {
  DuplicateFigureIdError,
  FigureLabelRequiredError,
  FigureNotFoundError,
  FiguresApprovedError,
  NegativeAmountError,
  SourceLinkRequiredError,
  SourceTitleRequiredError,
} from "../../gen/figures/error.js";

export const marketFiguresOperations: MarketFiguresOperations = {
  addPublishedFigureOperation(state, action) {
    if (state.sizeStatus === "APPROVED")
      throw new FiguresApprovedError("Reopen the figures to change them");
    const { id, amount, currency, year, sourceUrl, sourceDocumentId } =
      action.input;
    const label = action.input.label.trim();
    const sourceTitle = action.input.sourceTitle.trim();
    if (label === "")
      throw new FigureLabelRequiredError(
        "A figure needs to say what it measures",
      );
    if (amount < 0) throw new NegativeAmountError("A figure can't be negative");
    if (sourceTitle === "")
      throw new SourceTitleRequiredError("A source needs a title");
    if (sourceUrl == null && sourceDocumentId == null)
      throw new SourceLinkRequiredError(
        "A source needs a link or a vault note",
      );
    if (state.publishedFigures.some((f) => f.id === id))
      throw new DuplicateFigureIdError(`Figure ${id} already exists`);
    state.publishedFigures.push({
      id,
      label,
      amount,
      currency,
      year: year ?? null,
      source: {
        title: sourceTitle,
        url: sourceUrl ?? null,
        documentId: sourceDocumentId ?? null,
      },
    });
  },
  removePublishedFigureOperation(state, action) {
    if (state.sizeStatus === "APPROVED")
      throw new FiguresApprovedError("Reopen the figures to change them");
    const index = state.publishedFigures.findIndex(
      (f) => f.id === action.input.id,
    );
    if (index === -1)
      throw new FigureNotFoundError(`Figure ${action.input.id} not found`);
    state.publishedFigures.splice(index, 1);
  },
};
