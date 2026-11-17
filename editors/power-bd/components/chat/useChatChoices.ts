import { useUser } from "@powerhousedao/reactor-browser";
import { useCallback, useSyncExternalStore } from "react";
import {
  AUTO_APPROVE,
  CHAT_PRESENTATION,
  personChoice,
  type PersonChoice,
} from "../../kit/chat/index.js";

/** The browser's storage, when the page may reach it. */
export function browserStorage() {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

const presentation = personChoice(CHAT_PRESENTATION, browserStorage);
const autoApprove = personChoice(AUTO_APPROVE, browserStorage);

/**
 * Whose choice it is: the signed-in address. Without sign-in, which only a
 * service that allows it lets reach the chat (a local Vetra), it is this
 * browser's.
 */
const SIGNED_OUT = "signed-out";

/** Whose chat choices and key apply: the signed-in address, or this browser's. */
export const usePerson = () => useUser()?.address ?? SIGNED_OUT;

function useChoice<T extends string>(choice: PersonChoice<T>, initial: T): [T, (value: T) => void] {
  const person = usePerson();
  const value = useSyncExternalStore(
    choice.subscribe,
    () => choice.read(person),
    () => initial,
  );
  const set = useCallback((next: T) => choice.write(person, next), [choice, person]);
  return [value, set];
}

/** How "Ask the agent" opens the chat for this person: the full view, or beside. */
export const useChatPresentation = () => useChoice(presentation, CHAT_PRESENTATION.initial);

/** Whether the agent's writes run without asking this person; off until they turn it on. */
export function useAutoApprove(): [boolean, (on: boolean) => void] {
  const [value, set] = useChoice(autoApprove, AUTO_APPROVE.initial);
  const setOn = useCallback((on: boolean) => set(on ? "on" : "off"), [set]);
  return [value === "on", setOn];
}
