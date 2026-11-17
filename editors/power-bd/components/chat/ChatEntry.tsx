import { AgentMark } from "./ChatFrame.js";

/**
 * "Ask the agent", at the end of the top bar: opens the chat the way the
 * person last chose, full view or beside, and is pressed while it shows.
 */
export function ChatEntry({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="pb-btn pb-btn--sm pb-chat-entry"
      aria-pressed={open}
      aria-label="Ask the agent"
      title={open ? "Close the agent" : "Ask the agent"}
      onClick={onToggle}
    >
      <AgentMark />
      <span className="pb-chat-entry__label">Ask the agent</span>
    </button>
  );
}
