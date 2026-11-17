import { useEffect, useRef, useState } from "react";
import { Icon } from "../Icon.js";
import { ChatBody } from "./ChatBody.js";
import { ChatFrame } from "./ChatFrame.js";
import { ChatSlot, useHeldChat } from "./ChatHolder.js";
import { useChatPlaces } from "./useChatPlaces.js";

interface Props {
  driveId: string;
  onClose: () => void;
  /** Moves the chat to the full view, the Agent place. */
  onFull: () => void;
}

/**
 * The chat as a side panel: docked on the right beside any place or record,
 * floating where the screen is narrow. It shows the conversation the Shell
 * holds, so closing it or moving it to the full view ends nothing.
 */
export function ChatDock({ driveId, onClose, onFull }: Props) {
  const { reads } = useChatPlaces(driveId);
  const { slots, service } = useHeldChat();
  const [setupOpen, setSetupOpen] = useState(false);
  const talking = service?.connection !== undefined;

  // Esc closes it from anywhere inside, the held composer too: React's events
  // follow the component tree, which the held conversation is not under here.
  const panel = useRef<HTMLElement>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    const element = panel.current;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      close.current();
    };
    element?.addEventListener("keydown", onKey);
    return () => element?.removeEventListener("keydown", onKey);
  }, []);

  const actions = (
    <>
      {talking && !setupOpen ? (
        <ChatSlot element={slots.clear} className="pb-chat__slot-clear" />
      ) : null}
      <button
        type="button"
        className="pb-btn pb-btn--sm pb-btn--ghost pb-btn--icon"
        aria-label="Open full view"
        title="Open full view"
        onClick={onFull}
      >
        <Icon name="expand" />
      </button>
      {talking ? (
        <button
          type="button"
          className="pb-btn pb-btn--sm pb-btn--ghost pb-btn--icon"
          aria-pressed={setupOpen}
          aria-label={setupOpen ? "Back to the conversation" : "Open set-up"}
          title={setupOpen ? "Back to the conversation" : "Set-up: the key and auto-approve"}
          onClick={() => setSetupOpen((on) => !on)}
        >
          <Icon name="more" />
        </button>
      ) : null}
    </>
  );

  return (
    <aside ref={panel} className="pb-chat" aria-label="Ask the agent">
      <ChatFrame reads={reads} onClose={onClose} actions={actions}>
        <ChatBody
          service={service}
          slots={slots}
          setupOpen={setupOpen}
          onSetupDone={() => setSetupOpen(false)}
        />
      </ChatFrame>
    </aside>
  );
}
