import type { IconName } from "../../../../design-system/icons.js";
import { Icon } from "../../components/Icon.js";

export type Tile = {
  id: string;
  icon: IconName;
  label: string;
  value: string;
  sub: string;
  /** What pressing it does, in words. */
  hint: string;
  /** Set on a tile that is a filter: whether that filter is on. */
  pressed?: boolean;
  onClick: () => void;
};

/** The headline figures as quiet tiles; each narrows the board or jumps to its place. */
export function SummaryTiles({ tiles }: { tiles: Tile[] }) {
  return (
    <div className="pb-tiles">
      {tiles.map((t) => (
        <button
          key={t.id}
          type="button"
          className="pb-tile"
          title={t.hint}
          aria-pressed={t.pressed}
          onClick={t.onClick}
        >
          <span className="pb-tile__label">
            <Icon name={t.icon} />
            {t.label}
            <Icon
              name={t.pressed === undefined ? "arrow-right" : "filter"}
              className="pb-icon pb-icon--xs pb-tile__go"
            />
          </span>
          <span className="pb-tile__value">{t.value}</span>
          <span className="pb-tile__sub">{t.sub}</span>
        </button>
      ))}
    </div>
  );
}
