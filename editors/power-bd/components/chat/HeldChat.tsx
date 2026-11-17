/**
 * The agent's service and the tab's one conversation, loaded with the stack's
 * chat when a view first shows it. The conversation renders into the
 * holder's slots, whichever view shows them, or none (ChatHolder.tsx).
 */
import { ChatPanel, useReactorChat, type AiConnection } from "@powerhousedao/reactor-browser/ai";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../Icon.js";
import type { ChatSlots } from "./ChatHolder.js";
import { useChatPlaces } from "./useChatPlaces.js";
import { useAutoApprove, usePerson } from "./useChatChoices.js";
import { useChatService, type ChatService } from "./useChatService.js";
import { useChatSetup } from "./useChatSetup.js";

const SUGGESTIONS = [
  "What needs attention?",
  "Which leads have no next step?",
  "What is due in the next two weeks?",
];

interface Props {
  driveId: string;
  slots: ChatSlots;
  onService: (service: ChatService | undefined) => void;
}

/**
 * Asks the agent's service for the tab, and holds the conversation once it
 * may start: on the server's service, or on the person's own key. A new way
 * or another person starts a new conversation.
 */
export default function HeldService({ driveId, slots, onService }: Props) {
  const service = useChatService(driveId);
  const person = usePerson();
  useEffect(() => onService(service), [onService, service]);
  useEffect(() => () => onService(undefined), [onService]);
  return service.connection ? (
    <HeldConversation
      key={`${service.way.way} ${person}`}
      connection={service.connection}
      driveId={driveId}
      slots={slots}
    />
  ) : null;
}

/** What shows before the first question, with the mode it works in. */
function Welcome({ userName, autoApprove }: { userName?: string; autoApprove: boolean }) {
  return (
    <div className="pb-chat__welcome">
      <p className="pb-chat__welcome-title">
        {userName ? `Hi ${userName}. ` : ""}Ask about your leads, funding and the vault.
      </p>
      <p className="pb-chat__welcome-text">
        {autoApprove
          ? "It reads this space and the vault. Auto-approve is on, so it changes records and takes the steps you ask for without asking you first."
          : "It reads this space and the vault. Anything that changes a record asks you first."}
      </p>
      <ul className="pb-chat__promises">
        <li className="pb-reassure">
          <Icon name="lock" />
          Confidential items stay out of the chat.
        </li>
      </ul>
    </div>
  );
}

/**
 * The conversation, on the stack's chat. It ends with this component: Clear,
 * a key removed, signing out or another person signing in (the service's
 * answer and the own key are the person's, so the connection goes with them).
 * An answer still coming stops then too.
 */
function HeldConversation({
  connection,
  driveId,
  slots,
}: {
  connection: AiConnection;
  driveId: string;
  slots: ChatSlots;
}) {
  const { reads, vaultDriveId } = useChatPlaces(driveId);
  const [autoApprove] = useAutoApprove();
  const { tools, instructions, userName } = useChatSetup(
    driveId,
    reads.space,
    vaultDriveId,
    autoApprove,
  );
  const chat = useReactorChat(tools, { connection, instructions, autoApprove });
  const { clear } = chat;
  useEffect(() => clear, [clear]);

  return (
    <>
      {createPortal(
        <button
          type="button"
          className="pb-btn pb-btn--sm pb-btn--ghost"
          disabled={chat.messages.length === 0}
          onClick={clear}
        >
          Clear
        </button>,
        slots.clear,
      )}
      {createPortal(
        <>
          <ChatPanel
            chat={chat}
            suggestions={SUGGESTIONS}
            emptyState={<Welcome userName={userName} autoApprove={autoApprove} />}
          />
          <div className="pb-chat__foot">
            {autoApprove ? (
              <p className="pb-reassure">
                <Icon name="info" />
                Auto-approve is on: changes run without asking. Turn it off in Set-up.
              </p>
            ) : (
              <p className="pb-reassure">
                <Icon name="shield" />
                Anything that changes a record asks you first, the steps that are yours included.
              </p>
            )}
          </div>
        </>,
        slots.panel,
      )}
    </>
  );
}
