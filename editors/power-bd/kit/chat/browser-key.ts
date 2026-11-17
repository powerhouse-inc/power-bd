/**
 * Each person's own OpenRouter key, kept in this browser for the chat when the
 * server offers no assistant service to them. Kept per person, like their
 * other chat choices, so one person's key never serves the next one signing in.
 */
import type { ChoiceStorage } from "./person-choice.js";

/** The model a key talks to until the person changes it. */
export const DEFAULT_MODEL = "anthropic/claude-haiku-5.5";

/** What a person keeps here: their key, and the model it talks to. */
export interface BrowserKey {
  key: string;
  model: string;
}

/** Every person's key in this browser. */
export interface BrowserKeyStore {
  /** The person's key and model, or undefined when they keep none here. */
  read: (person: string) => BrowserKey | undefined;
  /** Keeps a key OpenRouter accepted, with the model already chosen. */
  save: (person: string, key: string) => void;
  /** Changes the model the person's key talks to; nothing without a key. */
  setModel: (person: string, model: string) => void;
  /** Forgets the person's key and model in this browser. */
  remove: (person: string) => void;
  /** Called after every change, by anyone; returns the way to stop. */
  subscribe: (listener: () => void) => () => void;
}

/** A kept key from what the browser holds, or null when it holds none. */
function parseKept(text: string | null | undefined): BrowserKey | null {
  const value: unknown = text ? JSON.parse(text) : null;
  if (typeof value !== "object" || value === null) return null;
  const { key, model } = value as Partial<Record<keyof BrowserKey, unknown>>;
  if (typeof key !== "string" || key === "") return null;
  return { key, model: typeof model === "string" && model.trim() ? model : DEFAULT_MODEL };
}

/**
 * A key kept per person: in the browser's storage, and in memory when the
 * browser keeps nothing (then it lasts until the page reloads).
 */
export function browserKeyStore(storage: () => ChoiceStorage | undefined): BrowserKeyStore {
  const keyOf = (person: string) => `pb:chat-browser-key:${person}`;
  // What this page knows of each person's key, null for none: it stands in
  // when the browser keeps nothing.
  const known = new Map<string, BrowserKey | null>();
  const listeners = new Set<() => void>();
  const stored = (person: string) => {
    try {
      return parseKept(storage()?.getItem(keyOf(person)));
    } catch {
      return null;
    }
  };
  const read = (person: string) => {
    if (!known.has(person)) known.set(person, stored(person));
    return known.get(person) ?? undefined;
  };
  const keep = (person: string, value: BrowserKey | null) => {
    known.set(person, value);
    try {
      if (value) storage()?.setItem(keyOf(person), JSON.stringify(value));
      else storage()?.removeItem(keyOf(person));
    } catch {
      // Without storage it lasts until the page reloads.
    }
    for (const listener of listeners) listener();
  };
  return {
    read,
    save(person, key) {
      keep(person, { key, model: read(person)?.model ?? DEFAULT_MODEL });
    },
    setModel(person, model) {
      const kept = read(person);
      if (kept) keep(person, { ...kept, model });
    },
    remove(person) {
      keep(person, null);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/**
 * The key as the page shows it once kept: OpenRouter's prefix and the last
 * four characters, and nothing of a key too short to hide most of it.
 */
export function keyHint(key: string): string {
  const prefix = /^sk-or-v\d+-/.exec(key)?.[0] ?? "";
  const rest = key.slice(prefix.length);
  return `${prefix}…${rest.length >= 16 ? rest.slice(-4) : ""}`;
}
