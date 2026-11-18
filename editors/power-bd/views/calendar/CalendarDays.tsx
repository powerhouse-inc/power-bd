import { dispatchActions } from "@powerhousedao/reactor-browser";
import { useRef, useState, type DragEvent } from "react";
import { Icon } from "../../components/Icon.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { fmtDay } from "../../components/shared/relationship/common.js";
import {
  canReschedule,
  dayHint,
  dayMove,
  isLate,
  itemLine,
  itemsByDay,
  type Addable,
  type DayMove,
  type Reschedule,
} from "../../kit/calendar/index.js";
import type { DatedItem } from "../../kit/overview/index.js";
import { dueClass } from "../../kit/overview-view/index.js";
import { AddPanel } from "./AddPanel.js";
import { rescheduleAction } from "./actions.js";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
/** How many items a month's day shows before "n more". */
const MONTH_ROWS = 3;

const keyOf = (i: DatedItem) => `${i.due}:${i.source.id}:${i.itemId ?? ""}`;
const dayName = (day: string) => fmtDay(`${day}T00:00:00.000Z`);

type Confirm = { day: string; key: string; move: Extract<DayMove, { kind: "confirm" }> };

/**
 * The days of a month or a week with their items. An item of the team's own
 * moves to another day by dragging it there; a meeting asks first, because
 * nobody invited is told. A day says, while an item is over it, what a drop
 * does or why it does not take it. Clicking an item opens its record; the
 * plus on a day adds a next step or a meeting there.
 */
export function CalendarDays({
  weeks,
  month,
  items,
  today,
  zone,
  records,
  me,
  onOpen,
  onMore,
}: {
  weeks: string[][];
  /** The month shown (`YYYY-MM`), or null for a week: its days are all "in". */
  month: string | null;
  items: DatedItem[];
  today: string;
  zone: string;
  records: Addable[];
  me: string | null;
  onOpen: (documentId: string) => void;
  /** Shows every item of a day: the week it is in. */
  onMore: (day: string) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const days = weeks.flat();
  const byDay = itemsByDay(items, days);
  const byKey = new Map(items.map((i) => [keyOf(i), i]));
  const [drag, setDrag] = useState<{ key: string; away: boolean } | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragged = drag ? byKey.get(drag.key) : undefined;
  const confirming = confirm ? byKey.get(confirm.key) : undefined;

  /** Sends the change to the item's record; a refusal shows above the days, and the item stays. */
  const apply = (r: Reschedule) => {
    setBusy(true);
    setError(null);
    dispatchActions(rescheduleAction(r), r.documentId, (errors) =>
      setError(errors.at(0)?.message ?? "That was not accepted."),
    )
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "That was not accepted."),
      )
      .finally(() => {
        setBusy(false);
        setConfirm(null);
      });
  };

  /** Closes the question and gives the focus back to the item, which never left its day. */
  const cancel = () => {
    const key = confirm?.key ?? "";
    setConfirm(null);
    requestAnimationFrame(() =>
      root.current
        ?.querySelector<HTMLElement>(`[data-item="${CSS.escape(key)}"]`)
        ?.focus(),
    );
  };

  const zoneOf = (day: string) => {
    const move = dragged ? dayMove(dragged, day, today) : null;
    const accepts = move?.kind === "set" || move?.kind === "confirm";
    const state = !move || move.kind === "stay" ? "" : accepts ? " is-target" : " is-refused";
    return {
      move,
      className: `${state}${over === day && state ? " is-over" : ""}`,
      handlers: {
        onDragOver: (e: DragEvent) => {
          if (!move) return;
          if (accepts) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
          }
          if (over !== day) setOver(day);
        },
        onDragLeave: (e: DragEvent) => {
          const to = e.relatedTarget;
          if (!(to instanceof Node && e.currentTarget.contains(to)))
            setOver((o) => (o === day ? null : o));
        },
        onDrop: (e: DragEvent) => {
          e.preventDefault();
          const key = drag?.key;
          setDrag(null);
          setOver(null);
          if (!key || !move) return;
          if (move.kind === "set") apply(move.reschedule);
          else if (move.kind === "confirm") setConfirm({ day, key, move });
        },
      },
    };
  };

  return (
    <div ref={root}>
      <ErrorLine message={error} />
      <div className={`pb-cal${month ? "" : " pb-cal--week"}`}>
        {WEEKDAYS.map((w, i) => (
          <div className="pb-cal__wd" key={w}>
            {month ? w : `${w} ${Number(weeks[0][i].slice(8))}`}
          </div>
        ))}
        {days.map((day) => {
          const all = byDay.get(day) ?? [];
          const shown = month ? all.slice(0, MONTH_ROWS) : all;
          const more = all.length - shown.length;
          const zone_ = zoneOf(day);
          const hint = zone_.move ? dayHint(zone_.move) : "";
          const cls = [
            "pb-cal__day",
            month && day.slice(0, 7) !== month ? " is-outside" : "",
            day < today ? " is-past" : "",
            day === today ? " is-today" : "",
            zone_.className,
          ].join("");
          return (
            <div className={cls} key={day} data-day={day} {...zone_.handlers}>
              <div className="pb-cal__head">
                <span className="pb-cal__num" aria-label={dayName(day)}>
                  {Number(day.slice(8))}
                </span>
                {records.length > 0 ? (
                  <button
                    type="button"
                    className="pb-btn pb-btn--ghost pb-btn--sm pb-cal__add"
                    aria-label={`Add on ${dayName(day)}`}
                    title={`Add on ${dayName(day)}`}
                    onClick={() => {
                      setConfirm(null);
                      setAdding(adding === day ? null : day);
                    }}
                  >
                    <Icon name="plus" />
                  </button>
                ) : null}
              </div>
              {shown.map((i) => {
                const key = keyOf(i);
                const movable = canReschedule(i, today);
                const line = itemLine(i);
                return (
                  <button
                    type="button"
                    key={key}
                    data-item={key}
                    className={`pb-cal__item${isLate(i, today) ? " is-late" : ""}${drag?.key === key && drag.away ? " is-away" : ""}`}
                    draggable={movable}
                    title={`${line} · ${i.source.name || "Untitled"}${movable ? "" : " · open it to change this date"}`}
                    onClick={() => onOpen(i.source.id)}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", line);
                      e.dataTransfer.effectAllowed = "move";
                      setConfirm(null);
                      setAdding(null);
                      setDrag({ key, away: false });
                      requestAnimationFrame(() =>
                        setDrag((d) => (d?.key === key ? { key, away: true } : d)),
                      );
                    }}
                    onDragEnd={() => {
                      setDrag(null);
                      setOver(null);
                    }}
                  >
                    <span className={`pb-strip__mark pb-strip__mark--${dueClass(i.due)}`} />
                    {i.ourTime ? <span className="pb-cal__time">{i.ourTime}</span> : null}
                    <span className="pb-cal__text">{line}</span>
                  </button>
                );
              })}
              {more > 0 ? (
                <button type="button" className="pb-cal__more" onClick={() => onMore(day)}>
                  {more} more
                </button>
              ) : null}
              {hint ? (
                <div className="pb-board__hint">
                  <Icon name={zone_.move?.kind === "refused" ? "info" : "arrow-right"} />
                  {hint}
                </div>
              ) : null}
              {confirm?.day === day && confirming ? (
                <div
                  className="pb-ask"
                  role="dialog"
                  aria-label={`Move to ${dayName(day)}`}
                  onKeyDown={(e) => {
                    if (e.key !== "Escape") return;
                    e.stopPropagation();
                    cancel();
                  }}
                >
                  <div className="pb-ask__title">
                    Move “{itemLine(confirming)}” to {dayName(day)}
                  </div>
                  <p className="pb-reassure">
                    <Icon name="shield" />
                    {confirm.move.reassurance}
                  </p>
                  <div className="pb-ask__foot">
                    <button type="button" className="pb-btn pb-btn--sm" autoFocus onClick={cancel}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="pb-btn pb-btn--primary pb-btn--sm"
                      disabled={busy}
                      onClick={() => apply(confirm.move.reschedule)}
                    >
                      Move
                    </button>
                  </div>
                </div>
              ) : null}
              {adding === day ? (
                <AddPanel day={day} zone={zone} records={records} me={me} onClose={() => setAdding(null)} />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
