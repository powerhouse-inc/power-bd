import { useState, type KeyboardEvent } from "react";
import { Icon } from "../Icon.js";
import { AgentMark, ChatConnecting } from "./ChatFrame.js";
import { ChatSlot, useHeldChat } from "./ChatHolder.js";
import { ChatSetup } from "./ChatSetup.js";
import { ChatUnreachable, NoKeyYet, NoOwnKeyYet } from "./ChatStates.js";
import { useChatPlaces } from "./useChatPlaces.js";

interface Props {
  driveId: string;
  /** Moves the chat beside the place the person came from. */
  onBeside: () => void;
}

/**
 * The Agent place: the chat in full view, as Sektar's assistant page. The
 * conversation fills the view, its composer fixed at the foot, with Set-up in
 * a pane beside it; where two panes don't fit, Set-up opens as a sheet from
 * the ⋯ in the conversation's header. The conversation is the one the Shell
 * holds, so leaving the place ends nothing.
 */
export function AgentView({ driveId, onBeside }: Props) {
  const { slots, service } = useHeldChat();
  const { reads } = useChatPlaces(driveId);
  const [sheet, setSheet] = useState(false);
  const way = service?.way;
  // Set-up shows with a key card: the server's, or the person's own.
  const setup = way?.way === "server" || way?.way === "own-key" ? way : undefined;
  const talking = setup !== undefined && service?.connection !== undefined;
  const model = setup?.way === "server" ? setup.status.model : setup?.saved?.model;

  const body =
    !way || way.way === "asking" ? (
      <ChatConnecting />
    ) : way.way === "unreachable" ? (
      <ChatUnreachable message={way.message} />
    ) : talking ? (
      <ChatSlot element={slots.panel} className="pb-chat__slot" />
    ) : way.way === "server" ? (
      <NoKeyYet onAddKey={() => setSheet(true)} />
    ) : (
      <NoOwnKeyYet onAddKey={() => setSheet(true)} />
    );

  const closeOnEscape = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    setSheet(false);
  };

  return (
    <div className={setup ? "pb-chat-view" : "pb-chat-view pb-chat-view--single"}>
      <section className="pb-chat-view__main" aria-label="The conversation">
        <div className="pb-chat__head pb-chat-view__head">
          <span className="pb-chat__title">
            <AgentMark />
            Ask the agent
          </span>
          {talking ? (
            <span className="pb-dot-label pb-chat-view__ready">
              <span className="pb-dot pb-dot--green" />
              Ready
              <span className="pb-faint pb-chat-view__model">{model}</span>
            </span>
          ) : null}
          <div className="pb-chat__head-end">
            {talking ? <ChatSlot element={slots.clear} className="pb-chat__slot-clear" /> : null}
            <button
              type="button"
              className="pb-btn pb-btn--sm pb-btn--ghost"
              aria-label="Open beside"
              title="Open beside: the chat stays open beside any place"
              onClick={onBeside}
            >
              <Icon name="peek" />
              <span className="pb-chat-view__switch-label">Open beside</span>
            </button>
            {setup ? (
              <button
                type="button"
                className="pb-btn pb-btn--sm pb-btn--ghost pb-btn--icon pb-chat-view__more"
                aria-label="Open set-up"
                aria-haspopup="dialog"
                aria-expanded={sheet}
                title="Set-up"
                onClick={() => setSheet(true)}
              >
                <Icon name="more" />
              </button>
            ) : null}
          </div>
        </div>
        <div className="pb-chat-view__body">{body}</div>
      </section>
      {setup && service ? (
        <aside
          className={sheet ? "pb-chat-view__side is-open" : "pb-chat-view__side"}
          aria-label="Set-up"
          onKeyDown={closeOnEscape}
        >
          <div className="pb-chat-view__side-head">
            <span className="pb-chat-view__side-title">Set-up</span>
            <button
              type="button"
              className="pb-btn pb-btn--sm pb-btn--ghost pb-btn--icon pb-chat-view__side-close"
              aria-label="Close set-up"
              title="Close (Esc)"
              onClick={() => setSheet(false)}
            >
              <Icon name="close" />
            </button>
          </div>
          <ChatSetup driveId={driveId} service={service} reads={reads} />
        </aside>
      ) : null}
    </div>
  );
}
