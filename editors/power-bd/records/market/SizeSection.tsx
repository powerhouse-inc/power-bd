import { useUser } from "@powerhousedao/reactor-browser";
import { generateId } from "document-model";
import { actions, type MarketState } from "document-models/market";
import { useState } from "react";
import { Icon } from "../../components/Icon.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { PeopleMark } from "../../components/shared/PeopleMark.js";
import { fmtDay, Section, useRun } from "../../components/shared/relationship/common.js";
import { useTeam } from "../../components/shared/useTeam.js";
import { formatMoney } from "../../kit/format/index.js";
import {
  approvalChecks,
  somLabel,
  sourceLabel,
  totalTiles,
  type SourceLike,
} from "../../kit/market/index.js";
import { NumberCell, type Send } from "./shared.js";
import { SourceEditor } from "./SourceEditor.js";

type Segment = MarketState["segments"][number];
type Figure = "ACCOUNTS" | "ANNUAL_VALUE";

/** A number's source as a mark under it: its title, or "No source" in the warning tone. */
function SourceMark({
  source,
  disabled,
  onEdit,
}: {
  source: SourceLike | null | undefined;
  disabled: boolean;
  onEdit: () => void;
}) {
  return (
    <button
      type="button"
      className={`pb-source${source ? "" : " is-missing"}`}
      disabled={disabled}
      title={source?.url ?? (source ? "A vault note" : "Add where this number comes from")}
      onClick={onEdit}
    >
      <Icon name={source ? "source" : "alert"} className="pb-icon pb-icon--xs" />
      <span>{sourceLabel(source)}</span>
    </button>
  );
}

/** One segment: its name, numbers with their sources, whether we can serve it and the target, edited in place. */
function SegmentRow({
  segment: g,
  horizon,
  locked,
  send,
}: {
  segment: Segment;
  horizon: string;
  locked: boolean;
  send: Send;
}) {
  const run = useRun();
  const [editing, setEditing] = useState<Figure | null>(null);
  const update = (patch: Omit<Parameters<typeof actions.updateSegment>[0], "id">) =>
    run.run((e) => send(actions.updateSegment({ id: g.id, ...patch }), e));
  const setSource = (figure: Figure, src: { title?: string; url?: string | null; documentId?: string | null }) =>
    run.run((e) => send(actions.setSegmentSource({ id: g.id, figure, ...src }), e), () => setEditing(null));
  const what = editing === "ACCOUNTS" ? `number of organisations in ${g.name}` : `value per organisation in ${g.name}`;
  return (
    <>
      <tr>
        <td>
          <input
            className="pb-input pb-input--cell"
            aria-label="Segment"
            title={g.name}
            defaultValue={g.name}
            key={`n-${g.name}`}
            disabled={locked}
            onBlur={(e) => e.target.value.trim() !== g.name && update({ name: e.target.value })}
          />
        </td>
        <td className="pb-num">
          <NumberCell label={`Organisations in ${g.name}`} integer value={g.accounts} disabled={locked} onCommit={(n) => update({ accounts: n })} />
          <SourceMark source={g.accountsSource} disabled={locked} onEdit={() => setEditing("ACCOUNTS")} />
        </td>
        <td className="pb-num">
          <NumberCell label={`Value per organisation in ${g.name}`} value={g.annualValue} disabled={locked} onCommit={(n) => update({ annualValue: n })} />
          <SourceMark source={g.annualValueSource} disabled={locked} onEdit={() => setEditing("ANNUAL_VALUE")} />
        </td>
        <td>
          <input
            type="checkbox"
            aria-label={`We can serve ${g.name}`}
            checked={g.serviceable}
            disabled={locked}
            onChange={(e) => update({ serviceable: e.target.checked })}
          />
        </td>
        <td className="pb-num">
          <NumberCell label={`${horizon} in ${g.name}`} integer value={g.targetAccounts} disabled={locked} onCommit={(n) => update({ targetAccounts: n })} />
        </td>
        <td>
          <button
            type="button"
            className="pb-btn pb-btn--ghost pb-btn--icon pb-btn--sm"
            aria-label={`Remove ${g.name}`}
            disabled={locked}
            onClick={() => run.run((e) => send(actions.removeSegment({ id: g.id }), e))}
          >
            <Icon name="trash" />
          </button>
        </td>
      </tr>
      {editing || run.error ? (
        <tr>
          <td colSpan={6}>
            {editing ? (
              <SourceEditor
                key={editing}
                what={what}
                source={editing === "ACCOUNTS" ? g.accountsSource : g.annualValueSource}
                onSave={(src) => setSource(editing, src)}
                onClear={() => setSource(editing, {})}
                onCancel={() => setEditing(null)}
              />
            ) : null}
            <ErrorLine message={run.error} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

/** A published figure beside the computed ones, with where it comes from. */
function PublishedFigures({ market: s, locked, send }: { market: MarketState; locked: boolean; send: Send }) {
  const run = useRun();
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [year, setYear] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const value = Number(amount.replace(/[\s,]/g, ""));
  const ready = label.trim() !== "" && amount.trim() !== "" && Number.isFinite(value) && sourceTitle.trim() !== "" && sourceUrl.trim() !== "";
  const add = () =>
    run.run(
      (e) =>
        send(
          actions.addPublishedFigure({
            id: generateId(),
            label,
            amount: value,
            currency: s.currency ?? "EUR",
            year: year.trim() ? Number(year) : undefined,
            sourceTitle,
            sourceUrl: sourceUrl.trim(),
          }),
          e,
        ),
      () => {
        setLabel("");
        setAmount("");
        setYear("");
        setSourceTitle("");
        setSourceUrl("");
      },
    );
  return (
    <div className="pb-stack pb-gap-2 pb-mt-14">
      <h3 className="pb-overline">Published figures</h3>
      <p className="pb-faint pb-small">A figure someone else published, to set beside the computed totals. It is never added to them.</p>
      {s.publishedFigures.length > 0 ? (
        <div className="pb-list">
          {s.publishedFigures.map((f) => (
            <div className="pb-list__item" key={f.id}>
              <span className="pb-list__lead"><Icon name="source" /></span>
              <div className="pb-list__main">
                <span className="pb-list__title">
                  {f.label}: {formatMoney(f.amount, f.currency)}
                  {f.year ? ` (${f.year})` : ""}
                </span>
                <span className="pb-list__sub">
                  {f.source.url ? (
                    <a href={f.source.url} target="_blank" rel="noreferrer">{f.source.title}</a>
                  ) : (
                    f.source.title
                  )}
                </span>
              </div>
              <div className="pb-list__end">
                <button
                  type="button"
                  className="pb-btn pb-btn--ghost pb-btn--icon pb-btn--sm"
                  aria-label={`Remove ${f.label}`}
                  disabled={locked}
                  onClick={() => run.run((e) => send(actions.removePublishedFigure({ id: f.id }), e))}
                >
                  <Icon name="trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {locked ? null : (
        <div className="pb-grid-2">
          <label className="pb-field">
            <span className="pb-field__label">What it measures</span>
            <input className="pb-input" placeholder="EU legal tech spend" value={label} onChange={(e) => setLabel(e.target.value)} />
          </label>
          <label className="pb-field">
            <span className="pb-field__label">Amount, {s.currency ?? "EUR"}</span>
            <input className="pb-input" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <label className="pb-field">
            <span className="pb-field__label">Year</span>
            <input className="pb-input" inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value)} />
          </label>
          <label className="pb-field">
            <span className="pb-field__label">Source</span>
            <input className="pb-input" placeholder="Analyst report" value={sourceTitle} onChange={(e) => setSourceTitle(e.target.value)} />
          </label>
          <label className="pb-field">
            <span className="pb-field__label">Link</span>
            <input className="pb-input" type="url" placeholder="https://" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
          </label>
          <div className="pb-flex pb-flex--bottom">
            <button type="button" className="pb-btn pb-btn--sm" disabled={!ready} onClick={add}>
              <Icon name="plus" />
              Add figure
            </button>
          </div>
        </div>
      )}
      <ErrorLine message={run.error} />
    </div>
  );
}

/**
 * The market's size: the three totals with what they leave out, the approval
 * before use outside the team, the segments with sourced numbers, and
 * published figures. While approved, nothing that changes a figure is offered.
 */
export function SizeSection({ market: s, send }: { market: MarketState; send: Send }) {
  const me = useUser()?.address ?? "";
  const team = useTeam();
  const approval = useRun();
  const add = useRun();
  const [name, setName] = useState("");
  const locked = s.sizeStatus === "APPROVED";
  const checks = approvalChecks(s);
  const ready = checks.every((c) => c.tone === "ok");
  const horizon = somLabel(s.horizonYears).replace(" (SOM)", "");
  const approver = s.sizeApprovedBy ? (team.nameFor(s.sizeApprovedBy) ?? `${s.sizeApprovedBy.slice(0, 6)}…${s.sizeApprovedBy.slice(-4)}`) : "";

  return (
    <Section title="Size">
      <div className="pb-tiles pb-tiles--3">
        {totalTiles(s).map((t) => (
          <div className="pb-tile pb-tile--static" key={t.key}>
            <span className="pb-tile__label">{t.label}</span>
            <span className="pb-tile__value">{t.value}</span>
            <span className="pb-tile__sub">{t.sub}</span>
          </div>
        ))}
      </div>

      {locked ? (
        <div className="pb-stack pb-gap-2">
          <p className="pb-flex pb-flex--center pb-gap-8">
            <span className="pb-tag pb-tag--green">Approved</span>
            <span className="pb-small">
              Approved by {approver}
              {s.sizeApprovedAt ? ` on ${fmtDay(s.sizeApprovedAt)}` : ""}: the figures may be used outside the team.
            </span>
            <button
              type="button"
              className="pb-btn pb-btn--sm"
              onClick={() => approval.run((e) => send(actions.reopenSize({}), e))}
            >
              Reopen to change
            </button>
          </p>
          <p className="pb-reassure">
            <Icon name="shield" />
            Reopening makes the figures a draft again: they need approving before they are used outside the team.
          </p>
        </div>
      ) : (
        <div className="pb-stack pb-gap-2">
          <p className="pb-flex pb-flex--center pb-gap-8">
            <span className="pb-tag pb-tag--default">Draft</span>
            <span className="pb-small">Not approved for use outside the team.</span>
          </p>
          <div className="pb-overline">Before you approve</div>
          <ul className="pb-checks">
            {checks.map((c) => (
              <li key={c.text} className={`pb-checks__item ${c.tone === "ok" ? "is-ok" : "is-warn"}`}>
                <Icon name={c.tone === "ok" ? "check-circle" : "alert"} />
                {c.text}
              </li>
            ))}
          </ul>
          <div>
            <button
              type="button"
              className="pb-btn pb-btn--primary"
              disabled={!ready || !me}
              title={me ? undefined : "Sign in to approve: only a person can"}
              onClick={() =>
                approval.run((e) =>
                  send(actions.approveSize({ approvedBy: me, approvedAt: new Date().toISOString() }), e),
                )
              }
            >
              <PeopleMark />
              Approve the figures
            </button>
          </div>
          <p className="pb-reassure">
            <Icon name="shield" />
            Only a person can approve, signed with your name. Changing a figure afterwards needs a reopen.
          </p>
        </div>
      )}
      <ErrorLine message={approval.error} />

      {locked ? (
        <p className="pb-faint pb-small">The figures are approved: reopen them to change anything below.</p>
      ) : null}
      <div className="pb-table-wrap">
        <table className="pb-table">
          <thead>
            <tr>
              <th>Segment</th>
              <th className="pb-num">Organisations</th>
              <th className="pb-num">Value per organisation a year, {s.currency ?? "EUR"}</th>
              <th>We can serve it</th>
              <th className="pb-num">{horizon}</th>
              <th aria-label="Remove" />
            </tr>
          </thead>
          <tbody>
            {s.segments.map((g) => (
              <SegmentRow key={g.id} segment={g} horizon={horizon} locked={locked} send={send} />
            ))}
          </tbody>
        </table>
      </div>
      {locked ? null : (
        <form
          className="pb-flex pb-gap-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            add.run((er) => send(actions.addSegment({ id: generateId(), name }), er), () => setName(""));
          }}
        >
          <input
            className="pb-input"
            aria-label="New segment"
            placeholder="A segment, such as Mid-size finance teams with an ERP"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" className="pb-btn" disabled={!name.trim()}>
            <Icon name="plus" />
            Add segment
          </button>
        </form>
      )}
      <ErrorLine message={add.error} />
      <PublishedFigures market={s} locked={locked} send={send} />
    </Section>
  );
}
