import type { LeadDocument } from "document-models/lead";
import { useState, type CSSProperties } from "react";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { Icon } from "../../components/Icon.js";
import { nextAction } from "../../kit/lead-view/index.js";
import {
  COLUMNS,
  ENGAGEMENT_DAYS,
  FIT_ORDER,
  MAP_STAGES,
  MOOD_QUADRANT_LABEL,
  leftOutLine,
  moodMap,
  priorityMap,
  type MoodQuadrant,
} from "../../kit/lead-map/index.js";
import { useNow } from "../../components/shared/useNow.js";
import type { LeadValue } from "../../kit/overview/index.js";
import { MineButton } from "../overview/MineButton.js";

const CELL = 100 / COLUMNS;
const label = (list: readonly { value: string; label: string }[], value: string) =>
  list.find((t) => t.value === value)?.label ?? value;
const QUADRANTS: { text: string; style: CSSProperties }[] = [
  { text: "Close these", style: { top: 0, right: 0 } },
  { text: "Start these", style: { bottom: 0, right: 0 } },
  { text: "Check these", style: { top: 0, left: `${CELL}%` } },
  { text: "Park or drop", style: { bottom: 0, left: `${CELL}%` } },
];

/**
 * The Leads map: every open lead placed by the fit of its best angle (left to
 * right) and how far along it is (bottom to top). Positions are worked out,
 * not dragged, so the map stays true as leads change; a dot opens its lead.
 */
export function LeadsMap({
  leads,
  values,
  today,
  me,
  onOpen,
}: {
  leads: readonly Pick<LeadDocument, "header" | "state">[];
  /** Each lead's live proposal value, by lead id. */
  values: Partial<Record<string, LeadValue[]>>;
  today: string;
  /** The signed-in person's address, for Mine. */
  me: string | null;
  onOpen: (id: string) => void;
}) {
  const [mine, setMine] = useState(false);
  const [kind, setKind] = useState("");
  const [layout, setLayout] = useState<"priority" | "mood">("priority");
  const now = useNow();
  const shown = leads.filter((d) => {
    const s = d.state.global;
    return (!mine || (me !== null && s.owner?.toLowerCase() === me.toLowerCase())) && (!kind || s.kind === kind);
  });
  const map = priorityMap(
    shown.map((d) => {
      const s = d.state.global;
      const next = nextAction(s, today);
      return {
        id: d.header.id,
        name: s.name || "Untitled lead",
        status: s.status,
        fits: s.angles.map((a) => a.fit),
        value: values[d.header.id] ?? [],
        slipping: next.kind === "step" && next.overdue,
      };
    }),
  );
  const leftOut = leftOutLine(map.left);

  return (
    <>
      <div className="pb-toolbar pb-mb-8">
        <div className="pb-segmented" role="group" aria-label="Map">
          {(["priority", "mood"] as const).map((l) => (
            <button
              key={l}
              type="button"
              className={`pb-segmented__item${layout === l ? " is-active" : ""}`}
              aria-pressed={layout === l}
              onClick={() => setLayout(l)}
            >
              {l === "priority" ? "Priority" : "Mood"}
            </button>
          ))}
        </div>
        <MineButton on={mine} disabled={!me} onClick={() => setMine(!mine)} />
        <select className="pb-select pb-input--auto" aria-label="Kind" value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="">All kinds</option>
          {VOCABULARY.relationshipKind.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </div>
      {layout === "mood" ? (
        <MoodLayout leads={shown} now={now} onOpen={onOpen} />
      ) : (
      <>
      <div className="pb-map pb-map--grid" role="group" aria-label="Leads map">
        <span className="pb-map__unassessed" />
        {[2, 4].map((c) => (
          <span key={`c${c}`} className="pb-map__line pb-map__line--y" style={{ left: `${c * CELL}%` }} />
        ))}
        {[1, 3, 4].map((r) => (
          <span key={`r${r}`} className="pb-map__line pb-map__line--x" style={{ bottom: `${r * 20}%` }} />
        ))}
        <span className="pb-map__axis pb-map__axis--y" style={{ left: `${3 * CELL}%` }} />
        <span className="pb-map__axis pb-map__axis--x" style={{ top: "auto", bottom: "40%", left: `${CELL}%` }} />
        {QUADRANTS.map((q) => (
          <span key={q.text} className="pb-map__quadrant" style={q.style}>
            {q.text}
          </span>
        ))}
        {MAP_STAGES.map((status, r) => (
          <span key={status} className="pb-map__row-label" style={{ bottom: `${r * 20 + 10}%` }}>
            {label(VOCABULARY.leadStatus, status)}
          </span>
        ))}
        {["Not assessed", ...FIT_ORDER.map((f) => label(VOCABULARY.fit, f))].map((text, c) => (
          <span key={text} className="pb-map__col-label" style={{ left: `${c * CELL}%` }}>
            {text}
          </span>
        ))}
        {map.dots.length === 0 ? (
          <div className="pb-map__empty">
            {shown.length === 0 ? "No lead matches these filters." : "No open lead to place: every lead here is won, lost or parked."}
          </div>
        ) : null}
        {map.dots.map((d) => (
          <button
            key={d.id}
            type="button"
            className="pb-map__dot pb-map__dot--lead"
            style={{ left: `${d.x}%`, bottom: `${d.y}%`, "--pb-dot": `${d.size}px` } as CSSProperties}
            title={d.name}
            aria-label={`${d.name}: ${d.quadrant ? "" : "not assessed, "}${label(VOCABULARY.leadStatus, MAP_STAGES[d.row])}${d.slipping ? ", next step overdue" : ""}. Opens the lead.`}
            onClick={() => onOpen(d.id)}
          >
            <span>{d.name}</span>
            {d.slipping ? <Icon name="slipping" className="pb-map__slip" /> : null}
          </button>
        ))}
      </div>
      <div className="pb-map__caption">
        <span>Left to right: the fit of the lead's best angle</span>
        <span>Bottom to top: how far along it is</span>
        <span>Size: the value of its live proposal, currencies not converted</span>
      </div>
      {leftOut || map.unassessed > 0 ? (
        <p className="pb-small pb-faint pb-mt-8">
          {[
            leftOut,
            map.unassessed > 0
              ? `${map.unassessed === 1 ? "One lead has" : `${map.unassessed} leads have`} no angle yet, so ${map.unassessed === 1 ? "it sits" : "they sit"} under Not assessed: give each an angle with its fit`
              : null,
          ]
            .filter(Boolean)
            .join(". ")}
          .
        </p>
      ) : null}
      </>
      )}
    </>
  );
}

const MOOD_CORNERS: { quadrant: MoodQuadrant; style: CSSProperties }[] = [
  { quadrant: "PROPOSE", style: { top: 0, right: 0 } },
  { quadrant: "REENGAGE", style: { bottom: 0, right: 0 } },
  { quadrant: "CONCERN", style: { top: 0, left: 0 } },
  { quadrant: "PARK", style: { bottom: 0, left: 0 } },
];

/**
 * The Mood layout: each open lead by how its recent interactions went (left
 * to right, from the "How did it go?" answers) and how engaged it is (bottom
 * to top, from how many held interactions there were lately and how recent the
 * last one was). It rates the relationship, never a person, and stays inside
 * the team. Leads with no answer yet are listed under the map.
 */
function MoodLayout({
  leads,
  now,
  onOpen,
}: {
  leads: readonly Pick<LeadDocument, "header" | "state">[];
  now: string;
  onOpen: (id: string) => void;
}) {
  const map = moodMap(
    leads.map((d) => ({
      id: d.header.id,
      name: d.state.global.name || "Untitled lead",
      status: d.state.global.status,
      interactions: d.state.global.interactions,
    })),
    now,
  );
  const leftOut = leftOutLine(map.left);
  return (
    <>
      <div className="pb-map" role="group" aria-label="Mood map">
        <span className="pb-map__axis pb-map__axis--x" />
        <span className="pb-map__axis pb-map__axis--y" />
        <span className="pb-map__end pb-map__end--left">Went badly</span>
        <span className="pb-map__end pb-map__end--right">Went well</span>
        <span className="pb-map__end pb-map__end--bottom">Quiet</span>
        <span className="pb-map__end pb-map__end--top">Active</span>
        {MOOD_CORNERS.map((c) => (
          <span key={c.quadrant} className="pb-map__quadrant" style={c.style}>
            {MOOD_QUADRANT_LABEL[c.quadrant]}
          </span>
        ))}
        {map.dots.length === 0 ? (
          <div className="pb-map__empty">
            {map.unplaced.length > 0
              ? "No lead has a \"How did it go?\" yet. Answer it on a held meeting or call, and the lead appears here."
              : "No open lead to place."}
          </div>
        ) : null}
        {map.dots.map((d) => (
          <button
            key={d.id}
            type="button"
            className="pb-map__dot pb-map__dot--lead"
            style={{ left: `${d.x}%`, bottom: `${d.y}%` }}
            title={d.name}
            aria-label={`${d.name}: ${MOOD_QUADRANT_LABEL[d.quadrant]}. Opens the lead.`}
            onClick={() => onOpen(d.id)}
          >
            <span>{d.name}</span>
          </button>
        ))}
      </div>
      <div className="pb-map__caption">
        <span>Left to right: how the last three held interactions went, the latest counting most</span>
        <span>Bottom to top: how many there were in the last {ENGAGEMENT_DAYS} days, and how recent the last one was</span>
        <span>It rates the relationship, never a person, and stays inside the team</span>
      </div>
      {map.unplaced.length > 0 || leftOut ? (
        <p className="pb-small pb-faint pb-mt-8">
          {[
            leftOut,
            map.unplaced.length > 0
              ? `Not placed yet, with no "How did it go?": ${map.unplaced.map((u) => u.name).join(", ")}`
              : null,
          ]
            .filter(Boolean)
            .join(". ")}
          .
        </p>
      ) : null}
    </>
  );
}
