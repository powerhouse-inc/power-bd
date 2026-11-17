import { useReactorHalves, useSwitchboards } from "@powerhousedao/reactor-browser";
import {
  getAiSettings,
  ReactorChatAgent,
  subscribeAiSettings,
  useChatContext,
  type AiConnection,
  type AiToolsProvider,
  type ChatImage,
  type UseReactorChatResult,
} from "@powerhousedao/reactor-browser/ai";
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import type { KeptConversation } from "../../kit/chat/index.js";

/**
 * The stack's `useReactorChat`, on a kept conversation: the same agent, the
 * same events and the same result for its `ChatPanel`, but the conversation
 * lives outside this component, so it outlasts the app closing.
 */
export function useKeptChat(
  chat: KeptConversation,
  tools: AiToolsProvider,
  options: { connection: AiConnection; instructions: string; autoApprove: boolean },
): UseReactorChatResult {
  const { connection, instructions, autoApprove } = options;
  const view = useSyncExternalStore(chat.subscribe, chat.view, chat.view);
  const settings = useSyncExternalStore(subscribeAiSettings, getAiSettings);
  const context = useChatContext();
  const switchboards = useSwitchboards();
  const reactor = useReactorHalves();
  // Read at each step: an answer still coming follows the latest, and the
  // last ones once this view has closed.
  const latest = useRef({ autoApprove, services: { switchboards, reactor } });
  useEffect(() => {
    latest.current = { autoApprove, services: { switchboards, reactor } };
  });

  const send = useCallback(
    (text: string, images: ChatImage[] = []) => {
      void chat.send(text, images, async (turn) => {
        let descriptors: Awaited<ReturnType<AiToolsProvider>>;
        try {
          descriptors = await tools();
        } catch (error) {
          throw new Error(
            `The agent's tools could not load: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
        if (descriptors.length === 0) throw new Error("The agent has no tools to work with.");
        return new ReactorChatAgent({
          settings: getAiSettings(),
          connection,
          autoApprove: () => latest.current.autoApprove,
          instructions,
          tools: descriptors,
          context,
          services: () => latest.current.services,
          ...turn,
        });
      });
    },
    [chat, tools, connection, instructions, context],
  );

  return useMemo(
    () => ({
      ...view,
      settings,
      configured: true,
      send,
      stop: chat.stop,
      approve: chat.approve,
      approveAll: chat.approveAll,
      reject: chat.reject,
      clear: chat.clear,
    }),
    [view, settings, send, chat],
  );
}
