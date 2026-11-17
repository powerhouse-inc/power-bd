import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { useTeam } from "../../components/shared/useTeam.js";
import type {
  ItemRef,
  LeadValue,
  SlippingItem,
  ViewItem,
} from "../../kit/overview/index.js";
import { KIND_LABEL, key, sinceFor, statusTerm, valueText } from "./display.js";
import { SlipSignal } from "./SlipSignal.js";

/** Every item that matches the filters, one row each. */
export function OverviewTable({
  rows,
  slipByKey,
  leadValues,
  onOpen,
}: {
  rows: ViewItem[];
  slipByKey: Map<string, SlippingItem>;
  leadValues: Partial<Record<string, LeadValue[]>>;
  onOpen: (r: ItemRef) => void;
}) {
  const team = useTeam();
  if (rows.length === 0)
    return (
      <div className="pb-faint pb-small">Nothing matches these filters.</div>
    );
  return (
    <div className="pb-table-wrap">
      <table className="pb-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Kind</th>
            <th>Status</th>
            <th>Owner</th>
            <th>Value</th>
            <th>Slipping</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const t = statusTerm(r.kind, r.status);
            const slip = slipByKey.get(key(r));
            const term = slip
              ? VOCABULARY.slipping.find((x) => x.value === slip.reasons[0])
              : undefined;
            return (
              <tr
                key={key(r)}
                className="pb-clickable"
                onClick={() => onOpen(r)}
              >
                <td className="pb-table__title">{r.name || "Untitled"}</td>
                <td>{KIND_LABEL[r.kind]}</td>
                <td>
                  <span className={`pb-tag pb-tag--${t?.tone ?? "default"}`}>
                    {t?.label ?? "Not set"}
                  </span>
                </td>
                <td>
                  {r.owner === null ? (
                    <span className="pb-faint">No owner</span>
                  ) : (
                    team.ownerName(r.owner)
                  )}
                </td>
                <td>{r.kind === "lead" ? valueText(leadValues[r.id]) : ""}</td>
                <td>
                  {term ? (
                    <SlipSignal
                      term={term}
                      since={sinceFor(slip?.since, term.value)}
                    />
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
