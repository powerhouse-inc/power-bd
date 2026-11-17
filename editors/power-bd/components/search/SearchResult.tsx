import {
  excerpt,
  marks,
  type Item,
} from "../../kit/search/index.js";
import { OwnerAvatar } from "../../views/overview/OwnerAvatar.js";
import { Icon } from "../Icon.js";

/** A text with the typed words set heavier where they were found. */
function Marked({ text, words }: { text: string; words: readonly string[] }) {
  return (
    <>
      {marks(text, words).map((s, i) =>
        s.marked ? (
          <mark key={i} className="pb-palette__hit">
            {s.text}
          </mark>
        ) : (
          s.text
        ),
      )}
    </>
  );
}

/** One row of the palette: a result, a quick action, or the rest of a capped group. */
export function SearchResult({
  item,
  words,
  active,
  onPoint,
  onChoose,
}: {
  item: Item;
  words: readonly string[];
  active: boolean;
  onPoint: () => void;
  onChoose: () => void;
}) {
  const row = {
    id: item.id,
    role: "option",
    "aria-selected": active,
    onMouseMove: active ? undefined : onPoint,
    onClick: onChoose,
  } as const;
  const enter = (
    <span className="pb-kbd pb-palette__enter" aria-hidden="true">
      ↵
    </span>
  );

  if (item.type === "more")
    return (
      <div {...row} className="pb-palette__item pb-palette__item--more">
        <Icon name="chevron-down" />
        <span className="pb-palette__main">Show {item.label}</span>
        <span className="pb-palette__end">{enter}</span>
      </div>
    );

  if (item.type === "action")
    return (
      <div {...row} className="pb-palette__item pb-palette__item--action">
        <Icon name="plus" />
        <span className="pb-palette__main">
          <span className="pb-palette__title">{item.action.label}</span>
        </span>
        <span className="pb-palette__end">{enter}</span>
      </div>
    );

  const { entry, field } = item.hit;
  return (
    <div {...row} className="pb-palette__item">
      <Icon name={entry.icon} />
      <span className="pb-palette__main">
        <span className="pb-palette__line">
          <span className="pb-palette__title">
            <Marked text={entry.title} words={words} />
          </span>
          {entry.detail && (
            <span className="pb-palette__detail">
              <Marked text={entry.detail} words={words} />
            </span>
          )}
        </span>
        {field && (
          <span className="pb-palette__found">
            <span className="pb-palette__found-label">{field.label}: </span>
            <Marked text={excerpt(field.text, words)} words={words} />
          </span>
        )}
      </span>
      <span className="pb-palette__end">
        {enter}
        {entry.tag && (
          <span className={`pb-tag pb-tag--${entry.tag.tone}`}>
            {entry.tag.label}
          </span>
        )}
        {entry.owner !== undefined && <OwnerAvatar owner={entry.owner} />}
      </span>
    </div>
  );
}
