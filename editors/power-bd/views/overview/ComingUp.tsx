import { useRef, useState, type Ref } from "react";
import { Icon } from "../../components/Icon.js";
import { fmtDay } from "../../components/shared/relationship/common.js";
import type { DueItem, ItemRef } from "../../kit/overview/index.js";
import {
  DUE_CLASSES,
  dueClass,
  relativeDay,
  stripDayText,
  stripMarks,
  type StripDay,
} from "../../kit/overview-view/index.js";
import { DUE_ICON, dayInstant, key } from "./display.js";
import { MineButton } from "./MineButton.js";
import { OwnerAvatar } from "./OwnerAvatar.js";

/** What is due in the next days: a strip of the days, then each day's items with the people they concern. */
export function ComingUp({
  days,
  strip,
  today,
  windowDays,
  mine,
  canFilter,
  onMine,
  onOpen,
  ref,
}: {
  days: { day: string; items: DueItem[] }[];
  strip: StripDay[];
  today: string;
  windowDays: number;
  mine: boolean;
  canFilter: boolean;
  onMine: () => void;
  onOpen: (r: ItemRef) => void;
  ref?: Ref<HTMLElement>;
}) {
  const list = useRef<HTMLDivElement>(null);
  // The day pointed at: from the strip it also shows the day's items in the list; from the list it only marks the strip.
  const [focus, setFocus] = useState<{ day: string; from: "strip" | "list" } | null>(null);
  const show = (day: string) => {
    setFocus({ day, from: "strip" });
    const box = list.current;
    const group = box?.querySelector<HTMLElement>(`[data-day="${day}"]`);
    // Scrolls the list, never the page: the day's heading comes to the top of the list.
    if (box && group)
      box.scrollTo({
        top: box.scrollTop + group.getBoundingClientRect().top - box.getBoundingClientRect().top,
        behavior: "smooth",
      });
  };
  const leave = () => setFocus(null);

  return (
    <section
      className="pb-stack pb-gap-2"
      aria-label="Coming up"
      tabIndex={-1}
      ref={ref}
    >
      <div className="pb-section__head">
        <h2 className="pb-section__title">Coming up</h2>
        <MineButton on={mine} disabled={!canFilter} onClick={onMine} />
      </div>
      <div
        className="pb-strip"
        role="list"
        aria-label={`The next ${windowDays} days`}
      >
        {strip.map((c) => {
          const { marks, more } = stripMarks(c);
          const text = `${fmtDay(dayInstant(c.day))}, ${relativeDay(c.day, today)}: ${stripDayText(c)}`;
          return (
            <div
              key={c.day}
              role="listitem"
              aria-current={c.today ? "date" : undefined}
              title={text}
              aria-label={text}
              tabIndex={c.total > 0 ? 0 : undefined}
              onMouseEnter={c.total > 0 ? () => show(c.day) : undefined}
              onMouseLeave={leave}
              onFocus={c.total > 0 ? () => show(c.day) : undefined}
              onBlur={leave}
              onClick={c.total > 0 ? () => show(c.day) : undefined}
              className={`pb-strip__day${c.today ? " is-today" : ""}${c.weekend ? " is-weekend" : ""}${c.weekStart ? " is-week-start" : ""}${c.total > 0 ? " has-due" : ""}${focus?.day === c.day ? " is-focus" : ""}`}
            >
              <span className="pb-strip__wd">{c.weekday.slice(0, 1)}</span>
              <span className="pb-strip__num">{c.date}</span>
              <span className="pb-strip__marks">
                {marks.map((m, i) => (
                  <span key={i} className={`pb-strip__mark pb-strip__mark--${m}`} />
                ))}
                {more > 0 ? (
                  <span className="pb-strip__wd">+{more}</span>
                ) : null}
              </span>
            </div>
          );
        })}
      </div>
      <div className="pb-strip__legend">
        {DUE_CLASSES.map((c) => (
          <span key={c.value}>
            <span className={`pb-strip__mark pb-strip__mark--${c.value}`} />
            {c.one.replace(/^./, (l) => l.toUpperCase())}
          </span>
        ))}
      </div>
      {days.length === 0 ? (
        <div className="pb-faint pb-small pb-mt-8">
          {mine
            ? `Nothing of yours is due in the next ${windowDays} days.`
            : `Nothing due in the next ${windowDays} days.`}
        </div>
      ) : (
        // Scrolls inside the section once it runs long, so the board stays in reach.
        <div
          className="pb-list pb-list--scroll"
          role="region"
          aria-label="Items coming up"
          tabIndex={0}
          ref={list}
        >
          {days.map((g) => (
            <div
              key={g.day}
              data-day={g.day}
              className={`pb-list__day${focus?.day === g.day && focus.from === "strip" ? " is-focus" : ""}`}
              onMouseEnter={() => setFocus({ day: g.day, from: "list" })}
              onMouseLeave={leave}
            >
              <div className="pb-list__group">
                <strong>{fmtDay(dayInstant(g.day))}</strong> ·{" "}
                {relativeDay(g.day, today)}
              </div>
              {g.items.map((d, i) => (
                <div
                  className="pb-list__item pb-clickable"
                  key={`${key(d.source)}-${d.due}-${i}`}
                  onClick={() => onOpen(d.source)}
                >
                  <span
                    className={`pb-list__lead pb-list__lead--${dueClass(d.due)}`}
                  >
                    <Icon name={DUE_ICON[d.due]} />
                  </span>
                  <div className="pb-list__main">
                    <span className="pb-list__title">{d.label}</span>
                    <span className="pb-list__sub">
                      {d.source.name}
                      {d.ourTime ? ` · ${d.ourTime} your time` : ""}
                      {d.theirTime &&
                      (d.theirTime !== d.ourTime ||
                        (d.theirDay && d.theirDay !== d.day))
                        ? ` · ${d.theirDay ? fmtDay(dayInstant(d.theirDay)) + ", " : ""}${d.theirTime}${d.theirTimeZone ? ` ${d.theirTimeZone}` : ""} for them`
                        : ""}
                    </span>
                  </div>
                  <div className="pb-list__end">
                    <span className="pb-avatar-stack">
                      {d.people.slice(0, 3).map((p) => (
                        <OwnerAvatar key={p} owner={p} />
                      ))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
