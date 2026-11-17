import { Icon } from "../../components/Icon.js";
import { Menu } from "../../components/shared/Menu.js";
import { useTeam } from "../../components/shared/useTeam.js";
import { enumValue } from "../../kit/enums.js";
import type { BoardViewState } from "../../kit/overview-view/index.js";
import { ALL_STATUSES, KIND_ICON, KIND_LABEL, KIND_VALUES } from "./display.js";
import { MineButton } from "./MineButton.js";

/** Board or table, "Mine", and the kind, owner and status menus. */
export function OverviewFilters({
  view,
  onChange,
  canFilter,
}: {
  view: BoardViewState;
  onChange: (patch: Partial<BoardViewState>) => void;
  /** False when nobody is signed in, so "Mine" has no meaning. */
  canFilter: boolean;
}) {
  const team = useTeam();
  const { asTable } = view;
  return (
    <div className="pb-toolbar">
      <div className="pb-segmented">
        <button
          className={`pb-segmented__item${asTable ? "" : " is-active"}`}
          onClick={() =>
            // Decisions have no stage: the board cannot show them alone.
            onChange({
              asTable: false,
              ...(view.kind === "decision" ? { kind: "", status: "" } : {}),
            })
          }
        >
          <Icon name="board" />
          Board
        </button>
        <button
          className={`pb-segmented__item${asTable ? " is-active" : ""}`}
          onClick={() => onChange({ asTable: true })}
        >
          <Icon name="table" />
          Table
        </button>
      </div>
      <MineButton
        on={view.mine}
        disabled={!canFilter}
        onClick={() => onChange({ mine: !view.mine })}
      />
      <Menu
        label="Kind"
        value={view.kind}
        onChange={(v) => onChange({ kind: enumValue(KIND_VALUES, v) ?? "" })}
        options={[
          { value: "", label: "All" },
          // Decisions have no stage: they appear in the table only.
          ...KIND_VALUES.filter((k) => asTable || k !== "decision").map(
            (k) => ({ value: k, label: KIND_LABEL[k], icon: KIND_ICON[k] }),
          ),
        ]}
      />
      <Menu
        label="Owner"
        value={view.owner}
        onChange={(owner) => onChange({ owner })}
        options={[
          { value: "", label: "Anyone" },
          ...team.members.map((m) => ({ value: m.address, label: m.name })),
        ]}
      />
      <Menu
        label="Status"
        value={view.status}
        onChange={(status) => onChange({ status })}
        options={[
          { value: "", label: "Any" },
          ...ALL_STATUSES.map(([value, label]) => ({ value, label })),
        ]}
      />
    </div>
  );
}
