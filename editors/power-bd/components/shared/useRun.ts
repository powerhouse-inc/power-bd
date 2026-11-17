import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { Action } from "document-model";
import { useState } from "react";

/** What every callback takes last: where a rejected action reports its reason. */
export type OnErrors = ((errors: Error[]) => void) & {
  /** Runs when the dispatch is done and nothing was rejected (see `dispatchWith`). */
  onDone?: () => void;
};

/** Runs a dispatch and keeps the reducer's message to show beside the control. */
export function useRun() {
  const [error, setError] = useState<string | null>(null);
  /** `onDone` (clear a form, close a panel) runs only when nothing was rejected. */
  const run = (fn: (onErrors: OnErrors) => void, onDone?: () => void) => {
    setError(null);
    const onErrors: OnErrors = (errors) =>
      setError(errors[0]?.message ?? "That was not accepted.");
    onErrors.onDone = onDone;
    fn(onErrors);
  };
  return { error, run, clear: () => setError(null) };
}

/** Dispatches an action; `onErrors.onDone` runs when it was applied. */
export function dispatchWith<A extends Action>(
  dispatch: DocumentDispatch<A>,
  action: A,
  onErrors: OnErrors,
): void {
  dispatch(action, onErrors, (_doc, { rejected }) => {
    if (rejected.length === 0) onErrors.onDone?.();
  });
}
