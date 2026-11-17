/**
 * Which way the chat works for the person, from the server's answer and the
 * key they keep in this browser: the server's assistant service when it is
 * theirs to use, and their own OpenRouter key when it is not.
 */
import type { AiGatewayAccess, AiGatewayStatus } from "@powerhousedao/reactor-browser/ai";
import { keyHint, type BrowserKey } from "./browser-key.js";

/** The person's own key as the page may show it: masked, with its model. */
export interface OwnKeyShown {
  hint: string;
  model: string;
}

export type ChatWay =
  /** The server has not answered yet. */
  | { way: "asking" }
  /** The server answered with a fault; it is asked again by itself. */
  | { way: "unreachable"; message: string }
  /** The server's service, as an admin sees it: its key card; ready once it has a key. */
  | { way: "server"; status: AiGatewayStatus; ready: boolean }
  /** No service the person may use: their own key in this browser; ready once kept. */
  | { way: "own-key"; saved: OwnKeyShown | undefined; ready: boolean };

export function chatWay(
  answer: AiGatewayAccess | undefined,
  kept: BrowserKey | undefined,
): ChatWay {
  if (answer?.access === "admin")
    return { way: "server", status: answer.status, ready: answer.status.configured };
  if (answer?.access === "none") {
    const saved = kept ? { hint: keyHint(kept.key), model: kept.model } : undefined;
    return { way: "own-key", saved, ready: saved !== undefined };
  }
  if (answer?.access === "error") return { way: "unreachable", message: answer.message };
  return { way: "asking" };
}
