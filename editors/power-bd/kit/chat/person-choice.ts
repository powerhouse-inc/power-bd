/**
 * A choice each person makes for themselves in the chat, remembered in this
 * browser: whether the chat opens as the full view or beside the page, and
 * whether the agent's writes run without asking. Kept per person, so one
 * person's choice never carries over to the next one signing in.
 */

/** Where a choice is kept: the browser's localStorage, or a stand-in. */
export interface ChoiceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** A choice: its name in storage, the values it takes, and where it starts. */
export interface ChoiceSpec<T extends string> {
  name: string;
  values: readonly T[];
  initial: T;
}

/** The full view (the Agent place), or the side panel beside any place. */
export const CHAT_PRESENTATION: ChoiceSpec<"full" | "side"> = {
  name: "chat-presentation",
  values: ["full", "side"],
  initial: "full",
};

/** Off: every write asks on the approval card. On: the person's request is enough. */
export const AUTO_APPROVE: ChoiceSpec<"off" | "on"> = {
  name: "chat-auto-approve",
  values: ["off", "on"],
  initial: "off",
};

/** One choice, for every person using this browser. */
export interface PersonChoice<T extends string> {
  read: (person: string) => T;
  write: (person: string, value: T) => void;
  /** Called after every write, by anyone; returns the way to stop. */
  subscribe: (listener: () => void) => () => void;
}

/**
 * A choice kept per person: in the browser's storage, and in memory when the
 * browser keeps nothing (then it lasts until the page reloads).
 */
export function personChoice<T extends string>(
  spec: ChoiceSpec<T>,
  storage: () => ChoiceStorage | undefined,
): PersonChoice<T> {
  const keyOf = (person: string) => `pb:${spec.name}:${person}`;
  const isValue = (text: string | null | undefined): text is T =>
    spec.values.some((value) => value === text);
  // What was chosen in this page: it stands in when the browser keeps nothing.
  const chosen = new Map<string, T>();
  const listeners = new Set<() => void>();
  return {
    read(person) {
      const known = chosen.get(person);
      if (known !== undefined) return known;
      try {
        const stored = storage()?.getItem(keyOf(person));
        return isValue(stored) ? stored : spec.initial;
      } catch {
        return spec.initial;
      }
    },
    write(person, value) {
      chosen.set(person, value);
      try {
        storage()?.setItem(keyOf(person), value);
      } catch {
        // Without storage it lasts until the page reloads.
      }
      for (const listener of listeners) listener();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
