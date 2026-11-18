import { useState } from "react";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { Icon } from "../../components/Icon.js";
import type {
  ItemRef,
  SlippingItem,
  ViewItem,
} from "../../kit/overview/index.js";
import { attentionState } from "../../kit/overview-view/index.js";
import { KIND_ICON, key, sinceFor } from "./display.js";
import { MineButton } from "./MineButton.js";
import { OwnerAvatar } from "./OwnerAvatar.js";
import { SlipSignal } from "./SlipSignal.js";

const SHOWN = 5;

/**
 * What needs attention, most urgent first, each with its fix as the button.
 * The count's colour says what kind of number it is: red to act, orange for a
 * second look, a green check when nothing of anyone's slips, grey when nothing
 * of yours does while the team's wait, or nothing is open yet.
 */
export function AttentionPanel({
  slipping,
  team,
  watching,
  byKey,
  mine,
  canFilter,
  onMine,
  onOpen,
}: {
  slipping: SlippingItem[];
  /** Everything slipping, whoever owns it: what "Mine" may be hiding. */
  team: number;
  /** The open leads and funding opportunities the list watches. */
  watching: number;
  byKey: Map<string, ViewItem>;
  mine: boolean;
  /** False when nobody is signed in, so "Mine" has no meaning. */
  canFilter: boolean;
  onMine: () => void;
  onOpen: (r: ItemRef) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? slipping : slipping.slice(0, SHOWN);
  const state = attentionState(slipping, { team, watching, mine });
  return (
    <div className={state.tone === "alert" ? "pb-attention" : `pb-attention pb-attention--${state.tone}`}>
      <div className="pb-attention__head">
        <span className="pb-attention__count">
          {state.tone === "clear" ? <Icon name="check-circle" className="pb-icon pb-icon--xl pb-icon--draw" /> : slipping.length}
        </span>
        <div>
          <div className="pb-attention__title">{state.title}</div>
          <div className="pb-attention__sub">{state.sub}</div>
        </div>
        <MineButton on={mine} disabled={!canFilter} onClick={onMine} />
      </div>
      {slipping.length === 0 ? (
        state.note ? (
          <div className="pb-attention__empty pb-row">
            <span className="pb-faint pb-small">{state.note}</span>
            {state.teamWaiting > 0 ? (
              <button type="button" className="pb-btn pb-btn--sm" onClick={onMine}>
                Show the team's
              </button>
            ) : null}
          </div>
        ) : null
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
            <Icon name="chevron-right" />
            {showAll ? "Show fewer" : `${slipping.length - SHOWN} more`}
          </button>
        </div>
      ) : null}
    </div>
  );
}
