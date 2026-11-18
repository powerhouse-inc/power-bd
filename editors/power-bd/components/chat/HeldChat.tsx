/**
 * The agent's service and the person's conversation, loaded with the stack's
 * chat when a view first shows it. The conversation renders into the
 * holder's slots, whichever view shows them, or none (ChatHolder.tsx). It is
 * kept outside the app (keptChats.ts), so it is there again when the person
 * comes back, and after a reload.
 */
import { ChatPanel, type AiConnection } from "@powerhousedao/reactor-browser/ai";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../Icon.js";
import type { ChatSlots } from "./ChatHolder.js";
import { agentRequests } from "../../kit/chat/index.js";
import { keptChats } from "./keptChats.js";
import { useChatPlaces } from "./useChatPlaces.js";
import { useAutoApprove, usePerson } from "./useChatChoices.js";
import { useChatService, type ChatService } from "./useChatService.js";
import { useChatSetup } from "./useChatSetup.js";
import { useCitationClicks, useCitedChat } from "./useCitedChat.js";
import { useKeptChat } from "./useKeptChat.js";

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
 * Asks the agent's service for the tab, and shows the person's conversation
 * once it may go on: on the server's service, or on the person's own key.
 * Each person has their own conversation in each space.
 */
export default function HeldService({ driveId, slots, onService }: Props) {
  const service = useChatService(driveId);
  const person = usePerson();
  useEffect(() => onService(service), [onService, service]);
  useEffect(() => () => onService(undefined), [onService]);
  // The service answered and is no longer this person's (their key removed):
  // an answer still coming stops. The conversation stays for when it is back.
  const gone =
    (service.way.way === "server" || service.way.way === "own-key") && !service.connection;
  useEffect(() => {
    if (gone) keptChats.of(driveId, person).stop();
  }, [gone, driveId, person]);
  return service.connection ? (
    <HeldConversation
      key={`${service.way.way} ${person}`}
      connection={service.connection}
      driveId={driveId}
      person={person}
      slots={slots}
    />
  ) : null;
}

/** What shows before the first question, with the mode it works in. */
function Welcome({
  userName,
  autoApprove,
  vaultLocked,
}: {
  userName?: string;
  autoApprove: boolean;
  /** The vault refused this person: the agent reads the space only. */
  vaultLocked: boolean;
}) {
  const reads = vaultLocked
    ? "It reads this space. You don't have access to the vault, so it can't read it."
    : "It reads this space and the vault.";
  return (
    <div className="pb-chat__welcome">
      <p className="pb-chat__welcome-title">
        {userName ? `Hi ${userName}. ` : ""}
        {vaultLocked ? "Ask about your leads and funding." : "Ask about your leads, funding and the vault."}
      </p>
      <p className="pb-chat__welcome-text">
        {reads}{" "}
        {autoApprove
          ? "Auto-approve is on, so it changes records and takes the steps you ask for without asking you first."
          : "Anything that changes a record asks you first."}
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
 * The person's conversation, on the stack's chat panel. It outlives this
 * component: closing the app leaves it as it is (an answer still coming keeps
 * coming, an approval keeps waiting), and only Clear ends it.
 */
function HeldConversation({
  connection,
  driveId,
  person,
  slots,
}: {
  connection: AiConnection;
  driveId: string;
  person: string;
  slots: ChatSlots;
}) {
  const { reads, vaultDriveId } = useChatPlaces(driveId);
  const [autoApprove] = useAutoApprove();
  const { tools, instructions, userName } = useChatSetup(
    driveId,
    reads.space,
    vaultDriveId,
    autoApprove,
    reads.vaultLocked,
  );
  const kept = useKeptChat(keptChats.of(driveId, person), tools, {
    connection,
    instructions,
    autoApprove,
  });
  // Shown with the vault's documents cited by title, each opening in the vault app.
  const chat = useCitedChat(kept, vaultDriveId, reads.vaultLocked);
  useCitationClicks(slots.panel);
  // A request a page made (a brief to refine) is sent once the conversation may go on.
  const { send } = chat;
  useEffect(() => {
    const sendWaiting = () => {
      const text = agentRequests.take();
      if (text) send(text);
    };
    sendWaiting();
    return agentRequests.subscribe(sendWaiting);
  }, [send]);

  return (
    <>
      {createPortal(
        <button
          type="button"
          className="pb-btn pb-btn--sm pb-btn--ghost"
          disabled={chat.messages.length === 0}
          onClick={chat.clear}
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
            emptyState={<Welcome userName={userName} autoApprove={autoApprove} vaultLocked={reads.vaultLocked} />}
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
