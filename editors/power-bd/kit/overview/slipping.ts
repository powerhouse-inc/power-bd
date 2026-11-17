import type { DecisionState } from "document-models/decision";
import type { LeadState } from "document-models/lead";
import type { OpportunityState } from "document-models/opportunity";
import { leadStage, opportunityStage } from "./board.js";
import { gatingDecisions } from "./gating.js";
import { isClosedLead, isClosedOpportunity } from "./status.js";
import { localTime } from "./time.js";
import {
  SLIPPING_REASONS,
  type OverviewInput,
  type SlippingItem,
  type SlippingReason,
  type SlippingSince,
} from "./types.js";

type Shared = Pick<LeadState, "owner" | "nextSteps" | "interactions">;

/** Reasons found, each with the earliest start it has (a day or an instant), if any. */
type Found = Map<SlippingReason, string | null>;

const DAY_MS = 86_400_000;

/** Whole days between two `YYYY-MM-DD` days. */
const daysBetween = (from: string, to: string): number =>
  Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS,
  );

/** Every slipping reason of every open lead and opportunity. Closed items never slip. */
export function buildSlipping(
  input: OverviewInput,
  ourZone: string,
): SlippingItem[] {
  const now = Date.parse(input.now);
  const today = localTime(input.now, ourZone).day;
  const decisions = new Map(input.decisions.map((d) => [d.id, d.state]));

  const add = (found: Found, reason: SlippingReason, from: string | null) => {
    const had = found.get(reason);
    if (had === undefined || (from !== null && (had === null || from < had)))
      found.set(reason, from);
  };

  const overdueSince = (id: string): string | null => {
    const d: DecisionState | undefined = decisions.get(id);
    return d && d.status === "OPEN" && d.decideBy && d.decideBy < today
      ? d.decideBy.slice(0, 10)
      : null;
  };

  const common = (s: Shared, gating: string[], active: boolean): Found => {
    const r: Found = new Map();
    const openSteps = s.nextSteps.filter((n) => !n.doneAt);
    if (!s.owner) add(r, "NO_OWNER", null);
    if (active && openSteps.length === 0) add(r, "NO_NEXT_STEP", null);
    for (const n of openSteps)
      if (n.dueDate && n.dueDate < today)
        add(r, "NEXT_STEP_OVERDUE", n.dueDate.slice(0, 10));
    for (const m of s.interactions)
      if (m.status === "SCHEDULED" && m.at && Date.parse(m.at) < now)
        add(r, "MEETING_NOT_RECORDED", m.at);
    for (const id of gating) {
      const since = overdueSince(id);
      if (since) add(r, "DECISION_OVERDUE", since);
    }
    return r;
  };

  const out: SlippingItem[] = [];
  const push = (
    kind: "lead" | "opportunity",
    id: string,
    name: string | null | undefined,
    found: Found,
  ) => {
    const reasons = SLIPPING_REASONS.filter((x) => found.has(x));
    if (!reasons.length) return;
    const since: SlippingItem["since"] = {};
    for (const r of reasons) {
      const from = found.get(r);
      if (from) since[r] = sinceOf(from, ourZone, today);
    }
    out.push({ source: { kind, id, name: name ?? "" }, reasons, since });
  };

  for (const l of input.leads) {
    const s = l.state;
    if (isClosedLead(s.status)) continue;
    const found = common(
      s,
      gatingDecisions("lead", s),
      ["NEW", "ACTIVE"].includes(leadStage(s.status)),
    );
    for (const { state: p } of input.proposals) {
      if (p.leadId !== l.id) continue;
      if (
        p.status === "SENT" &&
        p.validUntil &&
        p.validUntil.slice(0, 10) < today
      )
        add(found, "PROPOSAL_UNANSWERED", p.validUntil.slice(0, 10));
      if (p.status === "ACCEPTED" || p.status === "DECLINED")
        add(found, "PROPOSAL_ANSWER_NOT_REFLECTED", p.answeredAt ?? null);
    }
    push("lead", l.id, s.name, found);
  }
  for (const o of input.opportunities) {
    const s = o.state;
    if (isClosedOpportunity(s.status)) continue;
    const r = common(
      s,
      gatingDecisions("opportunity", s),
      ["NEW", "ACTIVE"].includes(opportunityStage(s.status)),
    );
    const funding = fundingDatePassed(s, today, now);
    if (funding.passed) add(r, "FUNDING_DATE_PASSED", funding.since);
    for (const c of s.conditions) {
      if (c.state === "WAITING_ON_DECISION")
        for (const id of c.decisionIds) {
          const answered = answeredAfter(decisions.get(id), c.checkedAt);
          if (answered) add(r, "DECISION_ANSWERED_REVIEW", answered);
        }
      if (
        s.roundOpenedAt &&
        Date.parse(c.checkedAt) < Date.parse(s.roundOpenedAt)
      )
        add(r, "CONDITION_RECHECK", s.roundOpenedAt);
    }
    push("opportunity", o.id, s.name, r);
  }
  return out;
}

function sinceOf(from: string, zone: string, today: string): SlippingSince {
  const day = from.length === 10 ? from : localTime(from, zone).day;
  return { from, days: Math.max(0, daysBetween(day, today)) };
}

/** The instant a decision was answered, when that is after `checkedAt`. */
const answeredAfter = (
  d: DecisionState | undefined,
  checkedAt: string,
): string | null =>
  d &&
  d.status === "ANSWERED" &&
  d.answeredAt &&
  Date.parse(d.answeredAt) > Date.parse(checkedAt)
    ? d.answeredAt
    : null;

type Passed = { passed: boolean; since: string | null };
const NO: Passed = { passed: false, since: null };

/** The earliest of some instants, or `NO` when there are none. */
const earliest = (instants: string[]): Passed =>
  instants.length ? { passed: true, since: [...instants].sort(byTime)[0] } : NO;
const byTime = (a: string, b: string) => Date.parse(a) - Date.parse(b);

function fundingDatePassed(
  s: OpportunityState,
  today: string,
  now: number,
): Passed {
  switch (s.status) {
    case "TO_EVALUATE":
    case "DECIDING":
      return s.decideBy && s.decideBy < today
        ? { passed: true, since: s.decideBy.slice(0, 10) }
        : NO;
    case "PREPARING":
      return earliest(
        s.steps
          .filter(
            (st) =>
              // Only a cut-off can be targeted; a full-proposal step never is.
              ((st.kind === "CUT_OFF" && st.targeted) ||
                st.kind === "FULL_PROPOSAL") &&
              Date.parse(st.at) < now,
          )
          .map((st) => st.at),
      );
    case "SUBMITTED":
    case "NEXT_STAGE": {
      // "No outcome": the latest submission has none recorded.
      const latest = [...s.submissions]
        .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt))
        .at(0);
      return latest?.outcome
        ? NO
        : earliest(
            s.steps
              .filter(
                (st) =>
                  st.kind === "EXPECTED_RESULT" && Date.parse(st.at) < now,
              )
              .map((st) => st.at),
          );
    }
    default:
      return NO;
  }
}
