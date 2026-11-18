import { useSetSelectedNode } from "../../components/shared/useOpenRecord.js";
import { EmptyStart } from "../../components/EmptyStart.js";
import { Icon } from "../../components/Icon.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { useCreateRecord } from "../../components/shared/useCreateRecord.js";
import { useMarketDocumentsInSelectedDrive } from "../../components/useDriveDocuments.js";
import { marketCard, marketCardLine } from "../../kit/market/index.js";

/** The Market place: one card per market with its size in short form and who is on its map, and a way to start one. */
export function MarketsView({ driveId }: { driveId: string }) {
  const markets = useMarketDocumentsInSelectedDrive() ?? [];
  const select = useSetSelectedNode();
  const { create: createRecord, busy, error } = useCreateRecord(
    driveId,
    "Markets",
    "powerbd/market",
    "The market could not be created.",
  );
  const create = () => void createRecord("New market");
  const sorted = [...markets].sort((a, b) =>
    (a.state.global.name ?? "").localeCompare(b.state.global.name ?? ""),
  );

  return (
    <div className="pb-page pb-page--wide">
      <div className="pb-page__head pb-page__head--row">
        <h1 className="pb-page__title">Market</h1>
        <span className="pb-toolbar__spacer" />
        {markets.length > 0 && (
          <button className="pb-btn pb-btn--primary" disabled={busy} onClick={create}>
            <Icon name="plus" />
            New market
          </button>
        )}
      </div>
      <ErrorLine message={error} />
      {markets.length === 0 ? (
        <EmptyStart
          icon="compass"
          title="No markets yet"
          text="A market is one place the team sells into: how big it is, split into segments with sourced numbers, and where the others and we stand on two axes."
          example={{
            title: "Finance operations, EU",
            detail: "Total market €1.2bn · serviceable €310m · obtainable in 3 years €18m · SolveAI and Lexroom on the map",
          }}
          action={
            <button type="button" className="pb-btn pb-btn--primary" disabled={busy} onClick={create}>
              <Icon name="plus" />
              Add your first market
            </button>
          }
        />
      ) : (
        <div className="pb-card-grid">
          {sorted.map((d) => {
            const s = d.state.global;
            const card = marketCard(s);
            return (
              <div
                key={d.header.id}
                className="pb-card pb-clickable"
                role="button"
                tabIndex={0}
                onClick={() => select(d.header.id)}
                onKeyDown={(e) => e.key === "Enter" && select(d.header.id)}
              >
                <div className="pb-card__kind">
                  <Icon name="compass" />
                  {s.geography || "Where not set"}
                </div>
                <div className="pb-card__title">{s.name || "Untitled market"}</div>
                <div className="pb-card__amounts" title="Total market · serviceable · obtainable">
                  {marketCardLine(s)}
                </div>
                <div className="pb-card__foot">
                  <span className="pb-small pb-faint">
                    {card.onMap === 1 ? "1 organisation on the map" : `${card.onMap} organisations on the map`}
                  </span>
                  <span className={`pb-tag pb-tag--${card.approved ? "green" : "default"}`}>
                    {card.approved ? "Approved" : "Draft"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
