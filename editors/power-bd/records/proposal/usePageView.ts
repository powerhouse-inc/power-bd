import { useState } from "react";
import {
  openingView,
  type PageView,
  type PreviewMode,
  type ProposalStatus,
} from "../../kit/proposal-view/index.js";

/** The view each proposal was last put in, kept while the app is open. */
const chosen = new Map<string, PageView>();
/** What each proposal's Preview last showed, kept while the app is open. */
const shown = new Map<string, PreviewMode>();

/** A choice kept per proposal: it outlives the page, not a reload. */
function useKept<T>(kept: Map<string, T>, documentId: string, fallback: T) {
  const [, redraw] = useState(0);
  const value = kept.get(documentId) ?? fallback;
  const setValue = (next: T) => {
    kept.set(documentId, next);
    redraw((n) => n + 1);
  };
  return [value, setValue] as const;
}

/** Edit or Preview for this proposal: the one chosen, or the one its status opens on. */
export function usePageView(documentId: string, status: ProposalStatus) {
  return useKept(chosen, documentId, openingView(status));
}

/** Document or Markdown for this proposal's Preview: the one chosen, or the document. */
export function usePreviewMode(documentId: string) {
  return useKept<PreviewMode>(shown, documentId, "document");
}
