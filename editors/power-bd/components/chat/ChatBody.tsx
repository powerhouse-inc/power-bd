/**
 * What the side panel shows, from the way the chat works for the person:
 * connecting, unreachable, the server's key card or the person's own, or the
 * conversation the Shell holds (with Set-up over it while open).
 */
import { Icon } from "../Icon.js";
import { ChatConnecting } from "./ChatFrame.js";
import { ChatSlot, type ChatSlots } from "./ChatHolder.js";
import { ChatUnreachable, KeyNeeded, OwnKeyNeeded } from "./ChatStates.js";
import { KeyCard } from "./KeyCard.js";
import { OwnKeyCard } from "./OwnKeyCard.js";
import type { ChatService } from "./useChatService.js";

interface Props {
  service: ChatService | undefined;
  slots: ChatSlots;
  /** Set-up (the key card) shows over the conversation. */
  setupOpen: boolean;
  onSetupDone: () => void;
}

export function ChatBody({ service, slots, setupOpen, onSetupDone }: Props) {
  const way = service?.way;
  if (!service || !way || way.way === "asking") return <ChatConnecting />;
  if (way.way === "unreachable") return <ChatUnreachable message={way.message} />;
  if (!service.connection)
    return way.way === "server" ? (
      <KeyNeeded status={way.status} gateway={service} />
    ) : (
      <OwnKeyNeeded ownKey={service.ownKey} />
    );
  return (
    <>
      {setupOpen ? (
        <div className="pb-chat__state">
          {way.way === "server" ? (
            <KeyCard status={way.status} gateway={service} onDone={onSetupDone} />
          ) : (
            <OwnKeyCard saved={way.saved} ownKey={service.ownKey} onDone={onSetupDone} />
          )}
          <div className="pb-key__actions">
            <button type="button" className="pb-btn pb-btn--sm pb-btn--ghost" onClick={onSetupDone}>
              <Icon name="chevron-left" />
              Back to the conversation
            </button>
          </div>
        </div>
      ) : null}
      <ChatSlot element={slots.panel} className="pb-chat__slot" hidden={setupOpen} />
    </>
  );
}
