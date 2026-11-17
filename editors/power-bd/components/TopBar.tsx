import { saveStateView, type Place, type SaveState } from "../kit/places.js";
import { shortcutKeys } from "../kit/search/index.js";
import { ChatEntry } from "./chat/ChatEntry.js";
import { Icon } from "./Icon.js";

interface Props {
  place: Place;
  /** The name of the open record, when one is open. */
  record?: string;
  saveState: SaveState;
  onPlace: () => void;
  /** Opens search. */
  onSearch: () => void;
  /** Whether the agent's panel is open. */
  chatOpen?: boolean;
  /** Opens or closes the agent's panel; without it there is no entry. */
  onChat?: () => void;
}

/** Breadcrumb on the left, search in the middle, save state and the agent on the right. */
export function TopBar({
  place,
  record,
  saveState,
  onPlace,
  onSearch,
  chatOpen = false,
  onChat,
}: Props) {
  const save = saveStateView(saveState);
  const keys = shortcutKeys(navigator.platform);
  return (
    <header className="pb-topbar pb-topbar--search">
      <div className="pb-crumbs">
        <span className="pb-crumbs__item" onClick={onPlace}>
          <Icon name={place.icon} />
          {place.label}
        </span>
        {record ? (
          <>
            <span className="pb-crumbs__sep">/</span>
            <span className="pb-crumbs__item" title={record}>
              {record}
            </span>
          </>
        ) : null}
      </div>
      <div className="pb-topbar__search">
        <button
          type="button"
          className="pb-search-trigger pb-search-trigger--centre"
          aria-haspopup="dialog"
          aria-keyshortcuts="Meta+K Control+K"
          onClick={onSearch}
        >
          <Icon name="search" />
          <span className="pb-search-trigger__label">
            Search leads, people, proposals…
          </span>
          <span className="pb-keys" aria-hidden="true">
            {keys.map((k) => (
              <span className="pb-kbd" key={k}>
                {k}
              </span>
            ))}
          </span>
        </button>
      </div>
      <div className="pb-topbar__actions">
        <span className={save.className} role="status">
          <Icon name={save.icon} />
          {save.label}
        </span>
        {onChat ? <ChatEntry open={chatOpen} onToggle={onChat} /> : null}
      </div>
    </header>
  );
}
