import { localTime } from "../overview/time.js";

/** The slice of an opportunity's state the pure functions here read. */
export type FundingLike = {
  status: string;
  owner?: string | null;
  blocked?: { decisionId?: string | null; text?: string | null } | null;
  steps: {
    id: string;
    kind: string;
    label: string;
    at: string;
    timeZone: string;
    targeted: boolean;
  }[];
  conditions: { state: string }[];
  submissions: {
    id: string;
    submittedAt: string;
    submittedBy: string;
    outcome?: { result: string } | null;
  }[];
  goNoGoDecisions: { decision: string; decidedBy: string; decidedAt: string }[];
  expectedOpening?: string | null;
};

type StepLike = FundingLike["steps"][number];

const CLOSED = ["AWARDED", "REJECTED", "WITHDRAWN", "NO_GO"];
export const isClosed = (status: string) => CLOSED.includes(status);

/**
 * The date a funding list orders by: the targeted cut-off, else the next
 * dated step still to come. `null` when there is neither.
 */
export function deadline(
  s: FundingLike,
  now: string,
): { step: StepLike; targeted: boolean } | null {
  const targeted = s.steps.find((x) => x.targeted);
  if (targeted) return { step: targeted, targeted: true };
  const next = s.steps
    .filter((x) => Date.parse(x.at) >= Date.parse(now))
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
    .at(0);
  return next ? { step: next, targeted: false } : null;
}

/** Deadline order: dated ones soonest first, the rest after, in their given order. */
export function sortByDeadline<T extends { state: FundingLike }>(
  items: readonly T[],
  now: string,
): T[] {
  const keyed = items.map((item) => ({
    item,
    at: deadline(item.state, now)?.step.at,
  }));
  return keyed
    .sort((a, b) =>
      a.at && b.at
        ? Date.parse(a.at) - Date.parse(b.at)
        : a.at
          ? -1
          : b.at
            ? 1
            : 0,
    )
    .map((k) => k.item);
}

export type PathStep = {
  key:
    | "TO_EVALUATE"
    | "DECIDING"
    | "GATE"
    | "PREPARING"
    | "SUBMITTED"
    | "NEXT_STAGE"
    | "AWARDED";
  label: string;
  state: "done" | "current" | "todo";
  gate?: boolean;
  blocked?: boolean;
};

/** The status path with the go-or-no-go decision as a gate between deciding and preparing. */
export function statusPath(s: FundingLike): {
  steps: PathStep[];
  closed: boolean;
} {
  const base: Omit<PathStep, "state">[] = [
    { key: "TO_EVALUATE", label: "To evaluate" },
    { key: "DECIDING", label: "Deciding" },
    { key: "GATE", label: "Go", gate: true },
    { key: "PREPARING", label: "Preparing" },
    { key: "SUBMITTED", label: "Submitted" },
    { key: "NEXT_STAGE", label: "Next stage" },
    { key: "AWARDED", label: "Awarded" },
  ];
  const wentGo = s.goNoGoDecisions.some((d) => d.decision === "GO");
  const index: Record<string, number | undefined> = {
    TO_EVALUATE: 0,
    DECIDING: 1,
    PREPARING: 3,
    SUBMITTED: 4,
    NEXT_STAGE: 5,
    AWARDED: 6,
  };
  const closed = isClosed(s.status);
  const current = index[s.status];
  // Closed without an award: everything reached stays done, nothing is current.
  let doneUpTo = -1;
  if (current !== undefined) doneUpTo = current - 1;
  else if (s.status === "NO_GO") doneUpTo = 2;
  else if (s.status === "REJECTED" || s.status === "WITHDRAWN")
    doneUpTo = wentGo ? 3 : 1;
  if (s.status === "AWARDED") doneUpTo = 6;
  const steps = base.map((b, i): PathStep => {
    const state: PathStep["state"] =
      i === current && s.status !== "AWARDED"
        ? "current"
        : i <= doneUpTo
          ? "done"
          : "todo";
    return {
      ...b,
      label: b.key === "GATE" && s.status === "NO_GO" ? "No-go" : b.label,
      state,
      blocked: b.key === "PREPARING" && !!s.blocked && state === "current",
    };
  });
  return { steps, closed };
}

export function conditionSummary(conditions: readonly { state: string }[]) {
  const count = (state: string) =>
    conditions.filter((c) => c.state === state).length;
  const total = conditions.length;
  const met = count("MET");
  return {
    met,
    total,
    waiting: count("WAITING_ON_DECISION"),
    unknown: count("UNKNOWN"),
    notMet: count("NOT_MET"),
    percent: total === 0 ? 0 : Math.round((met / total) * 100),
  };
}

export type Check = { tone: "ok" | "warn"; text: string; detail?: string };

/** What must be known before the go-or-no-go choice. */
export function goNoGoChecks(
  s: FundingLike,
  ctx: {
    attemptsLeft: number | null;
    max: number | null;
    ourZone: string;
    now: string;
  },
): Check[] {
  const c = conditionSummary(s.conditions);
  const checks: Check[] = [];
  checks.push({
    tone: c.total > 0 && c.met === c.total ? "ok" : "warn",
    text: `${c.met} of ${c.total} conditions met`,
    detail:
      c.waiting > 0
        ? `${c.waiting} waiting on a decision`
        : c.unknown > 0
          ? `${c.unknown} not yet checked`
          : undefined,
  });
  if (ctx.attemptsLeft === null || ctx.max === null) {
    checks.push({ tone: "warn", text: "No attempt limit recorded" });
  } else {
    checks.push({
      tone: ctx.attemptsLeft <= 1 ? "warn" : "ok",
      text: `${ctx.attemptsLeft} of ${ctx.max} attempts left`,
      detail: "An unsuccessful step uses one",
    });
  }
  const d = deadline(s, ctx.now);
  if (!d) checks.push({ tone: "warn", text: "No cut-off recorded" });
  else {
    const t = localTime(d.step.at, ctx.ourZone);
    checks.push({
      tone: d.targeted ? "ok" : "warn",
      text: `Cut-off ${t.day} ${t.time}`,
      detail: d.targeted ? "Your time" : "Not yet chosen as the one we aim for",
    });
  }
  return checks;
}

export type Next =
  | { kind: "none" }
  | { kind: "blocked"; what: string; decisionId?: string }
  | { kind: "owner" }
  | { kind: "decide" }
  | { kind: "outcome" }
  | { kind: "info"; what: string; why: string };

/** The one thing to do now on an opportunity. */
export function nextAction(s: FundingLike, now: string): Next {
  if (isClosed(s.status)) return { kind: "none" };
  if (s.blocked)
    return {
      kind: "blocked",
      what: s.blocked.text || "Get an answer to the decision that blocks this",
      decisionId: s.blocked.decisionId ?? undefined,
    };
  if (s.status !== "TO_EVALUATE" && s.status !== "WATCHING" && !s.owner)
    return { kind: "owner" };
  if (s.submissions.some((x) => !x.outcome) && s.status === "SUBMITTED")
    return { kind: "outcome" };
  switch (s.status) {
    case "WATCHING":
      return {
        kind: "info",
        what: "Wait for the next round",
        why: s.expectedOpening
          ? `Expected to open ${s.expectedOpening}`
          : "No opening date yet",
      };
    case "TO_EVALUATE":
      return s.conditions.length === 0
        ? {
            kind: "info",
            what: "List the conditions",
            why: "Find out who may apply before deciding",
          }
        : {
            kind: "info",
            what: "Move to deciding when the conditions are known",
            why: "Then a person decides go or no-go",
          };
    case "DECIDING":
      return { kind: "decide" };
    case "PREPARING": {
      const d = deadline(s, now);
      return d
        ? {
            kind: "info",
            what: `Prepare for ${d.step.label}`,
            why: "You submit it yourself, then mark the submission here",
          }
        : {
            kind: "info",
            what: "Add the cut-off",
            why: "An application without a date is slipping",
          };
    }
    default:
      return {
        kind: "info",
        what: "Wait for the funder",
        why: "Record the result when it arrives",
      };
  }
}

/** The statuses a person may move to by hand. Go, no-go and the first preparing go through the decision. */
export function allowedMoves(status: string): string[] {
  switch (status) {
    case "WATCHING":
      return ["TO_EVALUATE"];
    case "TO_EVALUATE":
      return ["WATCHING", "DECIDING"];
    case "DECIDING":
      return ["TO_EVALUATE", "WATCHING"];
    case "PREPARING":
      return ["SUBMITTED", "WITHDRAWN"];
    case "SUBMITTED":
      return ["NEXT_STAGE", "AWARDED", "REJECTED", "WITHDRAWN"];
    case "NEXT_STAGE":
      return ["PREPARING", "AWARDED", "REJECTED", "WITHDRAWN"];
    default:
      return [];
  }
}

/** The UTC instant of a wall-clock `YYYY-MM-DDTHH:mm` in an IANA zone. */
export function zonedToInstant(wall: string, timeZone: string): string {
  const asUtc = Date.parse(`${wall}:00.000Z`);
  let guess = asUtc;
  for (let i = 0; i < 2; i++) {
    const t = localTime(new Date(guess).toISOString(), timeZone);
    guess += asUtc - Date.parse(`${t.day}T${t.time}:00.000Z`);
  }
  return new Date(guess).toISOString();
}
