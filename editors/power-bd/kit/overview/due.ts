import { addDays, localTime } from "./time.js";
import type { DueItem, DueKind, ItemRef, OverviewInput } from "./types.js";
import { isClosedLead, isClosedOpportunity } from "./status.js";

type Context = { today: string; last: string; now: number; ourZone: string };

const ref = (
  kind: ItemRef["kind"],
  id: string,
  name: string | null | undefined,
): ItemRef => ({ kind, id, name: name ?? "" });

/** What falls inside the due window, in date order. Overdue items are slipping, not due. */
export function buildDue(input: OverviewInput, ourZone: string): DueItem[] {
  const today = localTime(input.now, ourZone).day;
  const ctx: Context = {
    today,
    last: addDays(today, input.settings.dueWindowDays),
    now: Date.parse(input.now),
    ourZone,
  };
  const items: DueItem[] = [];

  const wholeDay = (
    due: DueKind,
    source: ItemRef,
    label: string,
    stored: string | null | undefined,
    people: (string | null | undefined)[],
  ) => {
    // A whole day is stored at 00:00 UTC: only its date part counts.
    const date = stored?.slice(0, 10);
    if (date && date >= ctx.today && date <= ctx.last) {
      items.push({
        due,
        source,
        label,
        day: date,
        people: people.filter((p): p is string => !!p),
      });
    }
  };
  const instant = (
    due: DueKind,
    source: ItemRef,
    label: string,
    at: string | null | undefined,
    zone: string | null | undefined,
    people: string[],
  ) => {
    if (!at || Date.parse(at) < ctx.now) return;
    const ours = localTime(at, ourZone);
    if (ours.day > ctx.last) return;
    const theirTimeZone = zone ?? ourZone;
    const theirs = localTime(at, theirTimeZone);
    items.push({
      due,
      source,
      label,
      day: ours.day,
      ourTime: ours.time,
      theirDay: theirs.day,
      theirTime: theirs.time,
      theirTimeZone,
      people,
    });
  };

  for (const l of input.leads) {
    if (isClosedLead(l.state.status)) continue;
    const source = ref("lead", l.id, l.state.name);
    for (const n of l.state.nextSteps)
      if (!n.doneAt)
        wholeDay("NEXT_STEP", source, n.text, n.dueDate, [n.owner]);
    for (const m of l.state.interactions) {
      if (m.status === "SCHEDULED")
        instant("MEETING", source, m.summary ?? m.kind, m.at, m.timeZone, [
          ...m.teamMembers,
        ]);
    }
  }
  for (const o of input.opportunities) {
    const s = o.state;
    if (isClosedOpportunity(s.status)) continue;
    const source = ref("opportunity", o.id, s.name);
    for (const n of s.nextSteps)
      if (!n.doneAt)
        wholeDay("NEXT_STEP", source, n.text, n.dueDate, [n.owner]);
    for (const m of s.interactions) {
      if (m.status === "SCHEDULED")
        instant("MEETING", source, m.summary ?? m.kind, m.at, m.timeZone, [
          ...m.teamMembers,
        ]);
    }
    for (const st of s.steps)
      instant(
        "OPPORTUNITY_STEP",
        source,
        st.label,
        st.at,
        st.timeZone,
        s.owner ? [s.owner] : [],
      );
    if (s.status === "TO_EVALUATE" || s.status === "DECIDING")
      wholeDay("DECIDE_BY", source, "Decide by", s.decideBy, [s.owner]);
    if (s.status === "WATCHING")
      wholeDay(
        "EXPECTED_OPENING",
        source,
        "Expected opening",
        s.expectedOpening,
        [s.owner],
      );
  }
  for (const d of input.decisions) {
    if (d.state.status === "OPEN")
      wholeDay(
        "DECIDE_BY",
        ref("decision", d.id, d.state.question),
        "Decide by",
        d.state.decideBy,
        [d.state.owner],
      );
  }

  const leads = new Map(input.leads.map((l) => [l.id, l.state]));
  for (const { state: p } of input.proposals) {
    const l = p.leadId ? leads.get(p.leadId) : undefined;
    if (p.status !== "SENT" || !p.leadId || !l || isClosedLead(l.status))
      continue;
    wholeDay(
      "PROPOSAL_VALID_UNTIL",
      ref("lead", p.leadId, l.name),
      "Proposal valid until",
      p.validUntil?.slice(0, 10),
      [l.owner],
    );
  }

  const key = (i: DueItem) => `${i.day} ${i.ourTime ?? ""}`;
  return items.sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0));
}
