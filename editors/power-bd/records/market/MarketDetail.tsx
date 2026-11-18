import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import { actions, type MarketAction, type MarketDocument } from "document-models/market";
import { useRef, useState } from "react";
import { Icon } from "../../components/Icon.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { dispatchWith, useRun, type OnErrors } from "../../components/shared/relationship/common.js";
import { useRenameRecord } from "../../components/shared/useRenameRecord.js";
import { useViewportBox } from "../../components/shared/useViewportBox.js";
import {
  useContactDocumentsInSelectedDrive,
  useLeadDocumentsInSelectedDrive,
  usePlaybookDocumentsInSelectedDrive,
} from "../../components/useDriveDocuments.js";
import { CURRENCY_FORMAT, currencyCode } from "../../kit/format/index.js";
import { DotPeek } from "./DotPeek.js";
import { MapSection } from "./MapSection.js";
import type { Selected } from "./shared.js";
import { SizeSection } from "./SizeSection.js";

/** The market page: what the market is, its size, and its map. Shown in the Market place and in the thin editor. */
export function MarketDetail({
  document,
  dispatch,
}: {
  document: MarketDocument;
  dispatch: DocumentDispatch<MarketAction>;
}) {
  const s = document.state.global;
  const details = useRun();
  const renameEntry = useRenameRecord(document.header.id);
  const [selected, setSelected] = useState<Selected>(null);
  const host = useRef<HTMLDivElement>(null);
  // The side peek sits over the part of the page in view, not at the page's top, so opening it from the map keeps the map in sight.
  const inView = useViewportBox(host, selected !== null);
  const [currencyError, setCurrencyError] = useState<string | null>(null);
  const contacts = (useContactDocumentsInSelectedDrive() ?? []).map((d) => ({
    id: d.header.id,
    name: d.state.global.name,
    tags: d.state.global.tags,
  }));
  const leads = (useLeadDocumentsInSelectedDrive() ?? []).map((d) => ({
    id: d.header.id,
    name: d.state.global.name,
    organisationId: d.state.global.organisationId,
  }));
  const playbook = usePlaybookDocumentsInSelectedDrive()?.[0]?.state.global;
  const send = (action: MarketAction, onErrors: OnErrors) => dispatchWith(dispatch, action, onErrors);
  const setDetails = (patch: Parameters<typeof actions.setMarketDetails>[0], rename?: string) =>
    details.run((e) => send(actions.setMarketDetails(patch), e), () => rename && renameEntry(rename));
  const name = s.name ?? "";
  const locked = s.sizeStatus === "APPROVED";

  return (
    <div className="pb-peek-host" ref={host}>
      <div className="pb-page pb-page--wide">
        <div className="pb-page__head">
          <span className="pb-page__icon pb-page__icon--blue">
            <Icon name="compass" />
          </span>
          <input
            className="pb-input pb-page__title"
            aria-label="Market"
            placeholder="Which market?"
            defaultValue={name}
            key={`n-${name}`}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && v !== name) setDetails({ name: v }, v);
            }}
          />
        </div>
        <ErrorLine message={details.error} />
        <div className="pb-props">
          <div className="pb-prop__key">
            <Icon name="globe" />
            Where
          </div>
          <div className="pb-prop__value">
            <input
              className="pb-input pb-input--auto"
              aria-label="Where"
              placeholder="A country, a region, or EU"
              defaultValue={s.geography ?? ""}
              key={`g-${s.geography ?? ""}`}
              onBlur={(e) => e.target.value.trim() !== (s.geography ?? "") && setDetails({ geography: e.target.value.trim() || null })}
            />
          </div>
          <div className="pb-prop__key">
            <Icon name="percent" />
            Currency
          </div>
          <div className="pb-prop__value">
            <input
              className={`pb-input pb-input--auto${currencyError ? " is-invalid" : ""}`}
              aria-label="Currency"
              defaultValue={s.currency ?? ""}
              key={`c-${s.currency ?? ""}`}
              disabled={locked}
              title={locked ? "Reopen the figures to change the currency" : undefined}
              onBlur={(e) => {
                if (e.target.value.trim() === (s.currency ?? "")) return setCurrencyError(null);
                const code = currencyCode(e.target.value);
                setCurrencyError(code ? null : CURRENCY_FORMAT);
                if (code) setDetails({ currency: code });
              }}
            />
            {currencyError ? <span className="pb-field__error">{currencyError}</span> : null}
          </div>
          <div className="pb-prop__key">
            <Icon name="hourglass" />
            Horizon
          </div>
          <div className="pb-prop__value">
            <input
              className="pb-input pb-input--number"
              aria-label="Horizon in years"
              inputMode="numeric"
              defaultValue={s.horizonYears ?? ""}
              key={`h-${s.horizonYears ?? ""}`}
              disabled={locked}
              title={locked ? "Reopen the figures to change the horizon" : undefined}
              onBlur={(e) => {
                const n = Number(e.target.value);
                if (e.target.value.trim() && n !== s.horizonYears) setDetails({ horizonYears: n });
              }}
            />{" "}
            <span className="pb-small pb-faint">years, for what we can win</span>
          </div>
        </div>
        <textarea
          className="pb-textarea pb-mt-14"
          aria-label="Who buys, and which problem they have"
          placeholder="Who buys, and which problem they have"
          defaultValue={s.description ?? ""}
          key={`d-${s.description ?? ""}`}
          onBlur={(e) => e.target.value.trim() !== (s.description ?? "") && setDetails({ description: e.target.value.trim() || null })}
        />
        <SizeSection market={s} send={send} />
        <MapSection market={s} contacts={contacts} selected={selected} send={send} onSelect={setSelected} />
      </div>
      {selected ? (
        <DotPeek
          market={s}
          selected={selected}
          contacts={contacts}
          leads={leads}
          positioning={playbook?.positioning ?? []}
          neverClaims={playbook?.neverClaims ?? []}
          send={send}
          place={inView}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}
