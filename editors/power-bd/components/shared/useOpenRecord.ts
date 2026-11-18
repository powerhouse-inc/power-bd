import { useSetSelectedNode as useConnectSetSelectedNode } from "@powerhousedao/reactor-browser";
import { useCallback, useSyncExternalStore } from "react";

type Select = ReturnType<typeof useConnectSetSelectedNode>;

/**
 * The record last asked for here, so the app's frame can show it from its
 * live copy of a shared drive at once. Connect opens a record only when its
 * own copy holds it, which on a member's first visit or right after creating
 * one can take a while; until it has, its selection does not say what was asked.
 */
let requested: string | undefined;
const listeners = new Set<() => void>();

/** Notes the record asked for (none: a place was chosen, or the address moved). */
export function requestOpen(id: string | undefined): void {
  if (requested === id) return;
  requested = id;
  for (const listener of listeners) listener();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** The record asked for right now, for effects and handlers. */
export const currentRequest = (): string | undefined => requested;

/** The record last asked for, if any. */
export function useRequestedRecord(): string | undefined {
  return useSyncExternalStore(subscribe, () => requested);
}

/** Connect's `useSetSelectedNode`, noting the record asked for on the way. */
export function useSetSelectedNode(): Select {
  const select = useConnectSetSelectedNode();
  return useCallback<Select>(
    (node, options) => {
      requestOpen(typeof node === "string" ? node : node?.id);
      select(node, options);
    },
    [select],
  );
}
