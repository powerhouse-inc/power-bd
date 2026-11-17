import type { PlaceCounts } from "../kit/drive-plan.js";
import { PLACES, countFor, type PlaceId } from "../kit/places.js";
import { Icon } from "./Icon.js";

const MARK_PATH =
  "M29.5486 0L10.0889 16.1136C7.23454 18.4772 7.02695 22.7819 9.64066 25.4092L16.3729 32.1763C18.3481 34.1618 18.7755 37.2129 17.4218 39.6646L13.2337 47.25H6.3C2.82061 47.25 0 44.4294 0 40.95V6.3C0 2.82061 2.82061 0 6.3 0H29.5486ZM33.2039 0L29.5691 6.62154C28.2289 9.06288 28.6507 12.0945 30.6065 14.0772L37.7482 21.3177C40.3562 23.9617 40.1229 28.2765 37.2449 30.6239L16.86 47.25H40.95C44.4294 47.25 47.25 44.4294 47.25 40.95V6.3C47.25 2.82061 44.4294 0 40.95 0H33.2039Z";

interface Props {
  active: PlaceId;
  counts: PlaceCounts;
  onPick: (id: PlaceId) => void;
}

/** The places people work in, then the Agent and Settings at the foot. */
export function Sidebar({ active, counts, onPick }: Props) {
  const item = (id: PlaceId) => {
    const place = PLACES.find((p) => p.id === id)!;
    const count = countFor(id, counts);
    return (
      <a
        key={id}
        className={`pb-nav__item${id === active ? " is-active" : ""}`}
        href="#"
        aria-current={id === active ? "page" : undefined}
        onClick={(e) => {
          e.preventDefault();
          onPick(id);
        }}
      >
        <Icon name={place.icon} />
        <span className="pb-truncate">{place.label}</span>
        {count === undefined ? null : (
          <span className="pb-nav__count">{count}</span>
        )}
      </a>
    );
  };
  return (
    <aside className="pb-sidebar" aria-label="Places">
      <div className="pb-sidebar__brand">
        <svg
          className="pb-brand__mark"
          viewBox="0 0 47.25 47.25"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
            d={MARK_PATH}
          />
        </svg>
        Power BD
      </div>
      <nav className="pb-nav">
        {PLACES.filter((p) => p.id !== "agent" && p.id !== "settings").map((p) =>
          item(p.id),
        )}
      </nav>
      <div className="pb-sidebar__foot">
        {item("agent")}
        {item("settings")}
      </div>
    </aside>
  );
}
