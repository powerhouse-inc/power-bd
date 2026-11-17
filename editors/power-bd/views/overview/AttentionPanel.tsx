import { useState } from "react";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { Icon } from "../../components/Icon.js";
import type {
  ItemRef,
  SlippingItem,
  ViewItem,
} from "../../kit/overview/index.js";
import { KIND_ICON, key, sinceFor } from "./display.js";
import { MineButton } from "./MineButton.js";
import { OwnerAvatar } from "./OwnerAvatar.js";
import { SlipSignal } from "./SlipSignal.js";

const SHOWN = 5;

/** What needs attention, most urgent first, each with its fix as the button. */
export function AttentionPanel({
  slipping,
  byKey,
  mine,
  canFilter,
  onMine,
  onOpen,
}: {
  slipping: SlippingItem[];
  byKey: Map<string, ViewItem>;
  mine: boolean;
  /** False when nobody is signed in, so "Mine" has no meaning. */
  canFilter: boolean;
  onMine: () => void;
  onOpen: (r: ItemRef) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? slipping : slipping.slice(0, SHOWN);
  return (
    <div className="pb-attention">
      <div className="pb-attention__head">
        <span className="pb-attention__count">{slipping.length}</span>
        <div>
          <div className="pb-attention__title">
            {slipping.length === 1 ? "needs attention" : "need attention"}
          </div>
          <div className="pb-attention__sub">Most urgent first</div>
        </div>
        <MineButton on={mine} disabled={!canFilter} onClick={onMine} />
      </div>
      {slipping.length === 0 ? (
        <div className="pb-attention__empty">
          <strong>All caught up</strong>
          <div className="pb-faint pb-small">
            {mine
              ? "Nothing of yours is slipping."
              : "Nothing is slipping right now."}
          </div>
        </div>
      ) : (
        <ol className="pb-attention__list">
          {shown.map((s) => {
            const terms = s.reasons.map((r) =>
              VOCABULARY.slipping.find((t) => t.value === r),
            );
            const fix = terms[0];
            const it = byKey.get(key(s.source));
            return (
              <li className="pb-attention__item" key={key(s.source)}>
                <span className="pb-list__lead">
                  <Icon name={KIND_ICON[s.source.kind]} />
                </span>
                <div className="pb-attention__main">
                  <span className="pb-attention__name">
                    {s.source.name || "Untitled"}
                  </span>
                  <span className="pb-attention__why">
                    {terms.map((t) =>
                      t ? (
                        <SlipSignal
                          key={t.value}
                          term={t}
                          since={sinceFor(s.since, t.value)}
                        />
                      ) : null,
                    )}
                  </span>
                </div>
                <OwnerAvatar owner={it?.owner ?? null} />
                <button
                  className="pb-btn pb-btn--sm"
                  onClick={() => onOpen(s.source)}
                >
                  {fix?.action ?? "Open"}
                </button>
              </li>
            );
          })}
        </ol>
      )}
      {slipping.length > SHOWN ? (
        <div className="pb-attention__more">
          <button
            className="pb-disclosure"
            aria-expanded={showAll}
            onClick={() => setShowAll(!showAll)}
          >
            <Icon name={showAll ? "chevron-down" : "chevron-right"} />
            {showAll ? "Show fewer" : `${slipping.length - SHOWN} more`}
          </button>
        </div>
      ) : null}
    </div>
  );
}
