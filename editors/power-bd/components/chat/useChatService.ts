import type { AiConnection, UseAiGatewayResult } from "@powerhousedao/reactor-browser/ai";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  browserKeyStore,
  chatWay,
  openRouterConnection,
  testOpenRouterKey,
  type ChatWay,
  type KeyTestOutcome,
} from "../../kit/chat/index.js";
import { useBdGateway } from "./useBdGateway.js";
import { browserStorage, usePerson } from "./useChatChoices.js";

const keys = browserKeyStore(browserStorage);

/** What the key card may do with the person's own key. It never hands the key back. */
export interface OwnKey {
  /** Tests the key with OpenRouter and keeps it here only when accepted. */
  save: (key: string) => Promise<KeyTestOutcome>;
  setModel: (model: string) => void;
  remove: () => void;
}

/**
 * The person's own OpenRouter key in this browser, and the connection made
 * from it. The key goes from the store into the connection's fetch and
 * nowhere else.
 */
function useOwnKey() {
  const person = usePerson();
  const kept = useSyncExternalStore(
    keys.subscribe,
    () => keys.read(person),
    () => undefined,
  );
  const connection = useMemo(
    () => (kept ? openRouterConnection(kept, { page: window.location.origin }) : undefined),
    [kept],
  );
  const save = useCallback(
    async (key: string) => {
      const outcome = await testOpenRouterKey(key);
      if (outcome === "accepted") keys.save(person, key);
      return outcome;
    },
    [person],
  );
  const setModel = useCallback((model: string) => keys.setModel(person, model), [person]);
  const remove = useCallback(() => keys.remove(person), [person]);
  const controls = useMemo<OwnKey>(() => ({ save, setModel, remove }), [save, setModel, remove]);
  return { kept, connection, controls };
}

/** The agent's service for the person: the server's, or their own key's. */
export interface ChatService extends UseAiGatewayResult {
  /** Which way the chat works, and what Set-up shows for it. */
  way: ChatWay;
  /** The connection the conversation talks through, once it may start. */
  connection: AiConnection | undefined;
  ownKey: OwnKey;
}

/**
 * The server's assistant service when it is the person's to use, as before;
 * otherwise their own OpenRouter key, kept in this browser.
 */
export function useChatService(driveId: string): ChatService {
  const { gateway, connection: serverConnection, setKey, setDemoKey, resetKey } =
    useBdGateway(driveId);
  const own = useOwnKey();
  const way = useMemo(() => chatWay(gateway, own.kept), [gateway, own.kept]);
  const connection =
    way.way === "server" ? serverConnection : way.way === "own-key" ? own.connection : undefined;
  return useMemo(
    () => ({ gateway, connection, setKey, setDemoKey, resetKey, way, ownKey: own.controls }),
    [gateway, connection, setKey, setDemoKey, resetKey, way, own.controls],
  );
}
