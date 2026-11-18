import { generateId } from "document-model";
import { actions, type MarketState } from "document-models/market";
import { useRef, useState, type PointerEvent } from "react";
import { Icon } from "../../components/Icon.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { Section, useRun } from "../../components/shared/relationship/common.js";
import { mapCandidates, nudge, positionAt } from "../../kit/market/index.js";
import type { Selected, Send } from "./shared.js";

type Contact = { id: string; name?: string | null; tags: readonly string[] };
type Axes = NonNullable<MarketState["axes"]>;
type Point = { x: number; y: number };

/** The two axes: what each measures and what its ends mean. */
function AxesForm({
  axes,
  hasPlayers,
  send,
  onDone,
}: {
  axes: MarketState["axes"];
  hasPlayers: boolean;
  send: Send;
  onDone?: () => void;
}) {
  const run = useRun();
  const [v, setV] = useState({
    xLabel: axes?.x.label ?? "",
    xLow: axes?.x.low ?? "",
    xHigh: axes?.x.high ?? "",
    yLabel: axes?.y.label ?? "",
    yLow: axes?.y.low ?? "",
    yHigh: axes?.y.high ?? "",
  });
  const field = (key: keyof typeof v, label: string, placeholder: string) => (
    <label className="pb-field">
      <span className="pb-field__label">{label}</span>
      <input className="pb-input" placeholder={placeholder} value={v[key]} onChange={(e) => setV({ ...v, [key]: e.target.value })} />
    </label>
  );
  const ready = Object.values(v).every((t) => t.trim() !== "");
  return (
    <form
      className="pb-stack"
      aria-label="The map's axes"
      onSubmit={(e) => {
        e.preventDefault();
        run.run((er) => send(actions.setAxes(v), er), onDone);
      }}
    >
      <div className="pb-grid-2">
        <div className="pb-stack">
          <div className="pb-overline">Left to right</div>
          {field("xLabel", "What it measures", "Who builds it")}
          {field("xLow", "Left end", "Built per customer")}
          {field("xHigh", "Right end", "A product the customer configures")}
        </div>
        <div className="pb-stack">
          <div className="pb-overline">Bottom to top</div>
          {field("yLabel", "What it measures", "What the record shows")}
          {field("yLow", "Bottom end", "Outputs only")}
          {field("yHigh", "Top end", "Signed record of who approved what")}
        </div>
      </div>
      {hasPlayers ? (
        <p className="pb-reassure">
          <Icon name="shield" />
          The organisations stay where they are. After changing an axis, check that each place still holds.
        </p>
      ) : null}
      <ErrorLine message={run.error} />
      <div className="pb-flex pb-gap-8">
        <button type="submit" className="pb-btn pb-btn--primary pb-btn--sm" disabled={!ready}>
          Save axes
        </button>
        {onDone ? (
          <button type="button" className="pb-btn pb-btn--ghost pb-btn--sm" onClick={onDone}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

/**
 * The market map: two named axes, each organisation a dot and Powerhouse in
 * the primary colour. A dot moves by dragging it or with the arrow keys
 * (Shift for bigger steps); clicking it, or Enter, opens its side peek.
 */
export function MapSection({
  market: s,
  contacts,
  selected,
  send,
  onSelect,
}: {
  market: MarketState;
  contacts: readonly Contact[];
  selected: Selected;
  send: Send;
  onSelect: (s: Selected) => void;
}) {
  const map = useRef<HTMLDivElement>(null);
  const run = useRun();
  const place = useRun();
  const [editing, setEditing] = useState(false);
  const [choice, setChoice] = useState("");
  const [drag, setDrag] = useState<{ key: string; at: Point; moved: boolean; from: Point } | null>(null);
  const nameOf = (id: string) => contacts.find((c) => c.id === id)?.name?.trim() || "Unknown organisation";
  const candidates = mapCandidates(contacts, s.players);
  const us = s.us;

  const move = (key: string, p: Point) =>
    run.run((e) =>
      send(
        key === "us"
          ? actions.setOurPosition({ ...p, note: us?.note ?? undefined, positioningId: us?.positioningId ?? undefined })
          : actions.movePlayer({ id: key, ...p }),
        e,
      ),
    );
  const select = (key: string) => onSelect(key === "us" ? { kind: "us" } : { kind: "player", id: key });

  const dot = (key: string, label: string, pos: Point, mine: boolean) => {
    const at = drag?.key === key ? drag.at : pos;
    const isSelected = key === "us" ? selected?.kind === "us" : selected?.kind === "player" && selected.id === key;
    return (
      <button
        key={key}
        type="button"
        className={`pb-map__dot${mine ? " pb-map__dot--us" : ""}${isSelected ? " is-selected" : ""}${drag?.key === key && drag.moved ? " is-dragging" : ""}`}
        style={{ left: `${at.x}%`, bottom: `${at.y}%` }}
        aria-label={`${label}: ${Math.round(at.x)} of 100 left to right, ${Math.round(at.y)} of 100 bottom to top. Arrow keys move it, Enter opens it.`}
        onPointerDown={(e: PointerEvent<HTMLButtonElement>) => {
          if (e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          setDrag({ key, at: pos, moved: false, from: { x: e.clientX, y: e.clientY } });
        }}
        onPointerMove={(e) => {
          if (drag?.key !== key || !map.current) return;
          const far = Math.abs(e.clientX - drag.from.x) + Math.abs(e.clientY - drag.from.y) > 3;
          if (!far && !drag.moved) return;
          setDrag({ ...drag, at: positionAt(map.current.getBoundingClientRect(), e.clientX, e.clientY), moved: true });
        }}
        onPointerUp={() => {
          if (drag?.key !== key) return;
          setDrag(null);
          if (drag.moved) move(key, drag.at);
          else select(key);
        }}
        onPointerCancel={() => setDrag(null)}
        // A click from the keyboard (Enter, Space) has no pointer: it opens the peek.
        onClick={(e) => e.detail === 0 && select(key)}
        onKeyDown={(e) => {
          const next = nudge(pos, e.key, e.shiftKey);
          if (!next) return;
          e.preventDefault();
          move(key, next);
        }}
      >
        <span>{label}</span>
      </button>
    );
  };

  const axes: Axes | null | undefined = s.axes;
  return (
    <Section
      title="Market map"
      action={
        axes && !editing ? (
          <button type="button" className="pb-btn pb-btn--ghost pb-btn--sm" onClick={() => setEditing(true)}>
            <Icon name="edit" />
            Edit axes
          </button>
        ) : undefined
      }
    >
      {!axes ? (
        <>
          <p className="pb-faint pb-small">
            Choose two things buyers care about where the companies in this market differ. Each organisation then sits where it belongs on both.
          </p>
          <AxesForm axes={null} hasPlayers={false} send={send} />
        </>
      ) : (
        <>
          {editing ? <AxesForm axes={axes} hasPlayers={s.players.length > 0 || !!us} send={send} onDone={() => setEditing(false)} /> : null}
          <div className="pb-map" ref={map} role="group" aria-label="Market map">
            <span className="pb-map__axis pb-map__axis--x" />
            <span className="pb-map__axis pb-map__axis--y" />
            <span className="pb-map__end pb-map__end--left">{axes.x.low}</span>
            <span className="pb-map__end pb-map__end--right">{axes.x.high}</span>
            <span className="pb-map__end pb-map__end--bottom">{axes.y.low}</span>
            <span className="pb-map__end pb-map__end--top">{axes.y.high}</span>
            {s.players.length === 0 && !us ? (
              <div className="pb-map__empty">Place Powerhouse and the organisations you compare with, then drag each to where it stands.</div>
            ) : null}
            {s.players.map((p) => dot(p.id, nameOf(p.organisationId), p, false))}
            {us ? dot("us", "Powerhouse", us, true) : null}
          </div>
          <div className="pb-map__caption">
            <span>Left to right: {axes.x.label}</span>
            <span>Bottom to top: {axes.y.label}</span>
          </div>
          <ErrorLine message={run.error} />
          <div className="pb-flex pb-flex--center pb-gap-8 pb-mt-14">
            <select className="pb-select pb-input--auto" aria-label="Organisation to place" value={choice} onChange={(e) => setChoice(e.target.value)}>
              <option value="">Choose an organisation</option>
              {candidates.flagged.length > 0 ? (
                <optgroup label="Comparables and competitors">
                  {candidates.flagged.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
              ) : null}
              {candidates.others.length > 0 ? (
                <optgroup label="Other organisations">
                  {candidates.others.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
              ) : null}
            </select>
            <button
              type="button"
              className="pb-btn pb-btn--sm"
              disabled={!choice}
              onClick={() => {
                const id = generateId();
                place.run(
                  (e) => send(actions.placePlayer({ id, organisationId: choice, x: 50, y: 50 }), e),
                  () => {
                    setChoice("");
                    onSelect({ kind: "player", id });
                  },
                );
              }}
            >
              <Icon name="plus" />
              Place on the map
            </button>
            {us ? null : (
              <button
                type="button"
                className="pb-btn pb-btn--sm"
                onClick={() => place.run((e) => send(actions.setOurPosition({ x: 50, y: 50 }), e), () => onSelect({ kind: "us" }))}
              >
                <Icon name="plus" />
                Place Powerhouse
              </button>
            )}
          </div>
          <ErrorLine message={place.error} />
        </>
      )}
    </Section>
  );
}
