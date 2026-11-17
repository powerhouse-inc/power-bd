import type { ReactNode } from "react";
import { Icon } from "../Icon.js";

/** The agent's mark: the gradient, which means the agent and nothing else. */
export function AgentMark() {
  return (
    <span className="pb-agent__mark">
      <Icon name="sparkles" />
    </span>
  );
}

/** What the agent reads: this space, and the vault named in Settings. */
export interface ChatReads {
  space: string;
  /** The vault's name, or null when Settings names none. */
  vault: string | null;
}

interface Props {
  reads: ChatReads;
  onClose: () => void;
  /** Buttons before Close, for the view inside. */
  actions?: ReactNode;
  children: ReactNode;
}

/** The panel's head, the line of what it reads, and the body below. */
export function ChatFrame({ reads, onClose, actions, children }: Props) {
  return (
    <>
      <div className="pb-chat__head">
        <span className="pb-chat__title">
          <AgentMark />
          Ask the agent
        </span>
        <div className="pb-chat__head-end">
          {actions}
          <button
            type="button"
            className="pb-btn pb-btn--sm pb-btn--ghost pb-btn--icon"
            aria-label="Close the agent"
            title="Close (Esc)"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>
      </div>
      <div className="pb-chat__reads">
        <span>
          <Icon name="board" />
          Reads {reads.space}
        </span>
        <span>
          <Icon name="note" />
          {reads.vault === null
            ? "No vault named in Settings"
            : `and the vault ${reads.vault}`}
        </span>
      </div>
      <div className="pb-chat__body">{children}</div>
    </>
  );
}

/** While the agent's service answers. */
export function ChatConnecting() {
  return (
    <div className="pb-chat__state">
      <p className="pb-chat__waiting" role="status">
        <Icon name="cloud" />
        Connecting to the agent…
      </p>
    </div>
  );
}
