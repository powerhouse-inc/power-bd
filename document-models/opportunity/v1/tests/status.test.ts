import {
  clearBlocked,
  decideGoNoGo,
  markSubmission,
  recordSubmissionOutcome,
  reducer,
  setBlocked,
  setDecideBy,
  setExpectedOpening,
  setOpportunityStatus,
  setOwner,
  utils,
} from "document-models/opportunity/v1";
import { describe, expect, it } from "vitest";

type Doc = ReturnType<typeof utils.createDocument>;
type Status = Doc["state"]["global"]["status"];

const OWNER = "0x1111111111111111111111111111111111111111";
const LEAD = "0x2222222222222222222222222222222222222222";
const AT = "2026-11-02T09:00:00.000Z";

const CLOSED = "A closed opportunity is final";
const GATE =
  "Preparing for the first time and no-go are reached only through the go-or-no-go decision";
const NEEDS_OWNER = "An opportunity past to evaluate needs an owner";
const NEEDS_REASON = "A rejected or withdrawn opportunity needs a reason";

function move(document: Doc, status: Status, reason?: string): Doc {
  return reducer(
    document,
    setOpportunityStatus({ status, reason, changedAt: AT }),
  );
}

function go(document: Doc, id = "go-1"): Doc {
  return reducer(
    document,
    decideGoNoGo({
      id,
      decision: "GO",
      decidedBy: LEAD,
      reason: "Fits our proof cases",
      attemptsLeft: 2,
      decidedAt: AT,
    }),
  );
}

/** An opportunity with an owner, brought to `status` by the moves the rules allow. */
function at(status: Status): Doc {
  let document = reducer(utils.createDocument(), setOwner({ owner: OWNER }));
  const paths: Record<Status, (d: Doc) => Doc> = {
    TO_EVALUATE: (d) => d,
    WATCHING: (d) => move(d, "WATCHING"),
    DECIDING: (d) => move(d, "DECIDING"),
    PREPARING: (d) => go(d),
    SUBMITTED: (d) => move(mark(go(d)), "SUBMITTED"),
    NEXT_STAGE: (d) => move(move(mark(go(d)), "SUBMITTED"), "NEXT_STAGE"),
    AWARDED: (d) => move(move(mark(go(d)), "SUBMITTED"), "AWARDED"),
    REJECTED: (d) =>
      move(move(mark(go(d)), "SUBMITTED"), "REJECTED", "Out of budget"),
    WITHDRAWN: (d) => move(go(d), "WITHDRAWN", "Team capacity"),
    NO_GO: (d) =>
      reducer(
        d,
        decideGoNoGo({
          id: "no-go-1",
          decision: "NO_GO",
          decidedBy: LEAD,
          reason: "Wrong region",
          decidedAt: AT,
        }),
      ),
  };
  document = paths[status](document);
  expect(document.state.global.status).toBe(status);
  expect(document.operations.global.every((o) => o.error === undefined)).toBe(
    true,
  );
  return document;
}

/** A submission marked at `id`, still without an outcome. */
function mark(document: Doc, id = "sub-1"): Doc {
  return reducer(
    document,
    markSubmission({ id, submittedAt: AT, submittedBy: OWNER }),
  );
}

function lastError(document: Doc) {
  return document.operations.global.at(-1)?.error;
}

describe("moving the status by hand", () => {
  it.each([
    ["WATCHING", "TO_EVALUATE"],
    ["TO_EVALUATE", "WATCHING"],
    ["TO_EVALUATE", "DECIDING"],
    ["DECIDING", "TO_EVALUATE"],
    ["DECIDING", "WATCHING"],
    ["PREPARING", "WITHDRAWN"],
    ["SUBMITTED", "NEXT_STAGE"],
    ["SUBMITTED", "AWARDED"],
    ["SUBMITTED", "REJECTED"],
    ["SUBMITTED", "WITHDRAWN"],
    ["NEXT_STAGE", "NEXT_STAGE"],
    ["NEXT_STAGE", "PREPARING"],
    ["NEXT_STAGE", "AWARDED"],
    ["NEXT_STAGE", "REJECTED"],
    ["NEXT_STAGE", "WITHDRAWN"],
  ] as [Status, Status][])("allows %s to %s", (from, to) => {
    const document = move(at(from), to, "Because");

    expect(lastError(document)).toBeUndefined();
    expect(document.state.global.status).toBe(to);
  });

  it.each([
    [
      "WATCHING",
      [
        "WATCHING",
        "DECIDING",
        "SUBMITTED",
        "NEXT_STAGE",
        "AWARDED",
        "REJECTED",
        "WITHDRAWN",
      ],
    ],
    [
      "TO_EVALUATE",
      [
        "TO_EVALUATE",
        "SUBMITTED",
        "NEXT_STAGE",
        "AWARDED",
        "REJECTED",
        "WITHDRAWN",
      ],
    ],
    [
      "DECIDING",
      [
        "DECIDING",
        "SUBMITTED",
        "NEXT_STAGE",
        "AWARDED",
        "REJECTED",
        "WITHDRAWN",
      ],
    ],
    [
      "PREPARING",
      [
        "WATCHING",
        "TO_EVALUATE",
        "DECIDING",
        "PREPARING",
        "NEXT_STAGE",
        "AWARDED",
        "REJECTED",
      ],
    ],
    [
      "SUBMITTED",
      ["WATCHING", "TO_EVALUATE", "DECIDING", "PREPARING", "SUBMITTED"],
    ],
    ["NEXT_STAGE", ["WATCHING", "TO_EVALUATE", "DECIDING", "SUBMITTED"]],
  ] as [Status, Status[]][])("refuses %s to %s", (from, targets) => {
    for (const to of targets) {
      const before = at(from);
      const after = move(before, to, "Because");

      expect(lastError(after)).toBe(
        `An opportunity cannot move from ${from} to ${to}`,
      );
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });

  it("goes from preparing to submitted when a submission has no outcome yet", () => {
    const document = move(mark(at("PREPARING")), "SUBMITTED");

    expect(lastError(document)).toBeUndefined();
    expect(document.state.global.status).toBe("SUBMITTED");
  });

  it("refuses preparing to submitted without a submission, or when every submission has an outcome", () => {
    const none = at("PREPARING");
    let answered = mark(at("PREPARING"));
    answered = reducer(
      answered,
      recordSubmissionOutcome({
        id: "sub-1",
        result: "PASSED",
        receivedAt: AT,
      }),
    );

    for (const before of [none, answered]) {
      const after = move(before, "SUBMITTED");

      expect(lastError(after)).toBe(
        "Submitting needs a submission that has no outcome yet",
      );
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });

  it("goes to submitted when one of several submissions is still open", () => {
    let document = mark(at("PREPARING"), "sub-1");
    document = reducer(
      document,
      recordSubmissionOutcome({
        id: "sub-1",
        result: "PASSED",
        receivedAt: AT,
      }),
    );
    document = move(mark(document, "sub-2"), "SUBMITTED");

    expect(lastError(document)).toBeUndefined();
  });

  it("reaches preparing for the first time, and no-go, only through the decision", () => {
    for (const from of ["TO_EVALUATE", "DECIDING"] as Status[]) {
      for (const to of ["PREPARING", "NO_GO"] as Status[]) {
        const before = at(from);
        const after = move(before, to, "Because");

        expect(lastError(after)).toBe(GATE);
        expect(after.state.global).toStrictEqual(before.state.global);
      }
    }
    expect(lastError(move(at("WATCHING"), "NO_GO", "x"))).toBe(GATE);
    expect(lastError(move(at("SUBMITTED"), "NO_GO", "x"))).toBe(GATE);
  });

  it.each(["AWARDED", "REJECTED", "WITHDRAWN", "NO_GO"] as Status[])(
    "keeps %s final: every further move is refused",
    (closed) => {
      for (const to of [
        "WATCHING",
        "TO_EVALUATE",
        "PREPARING",
        "NEXT_STAGE",
        closed,
      ] as Status[]) {
        const before = at(closed);
        const after = move(before, to, "Because");

        expect(lastError(after)).toBe(CLOSED);
        expect(after.state.global).toStrictEqual(before.state.global);
      }
    },
  );

  it("needs an owner for any status past to evaluate", () => {
    const fresh = utils.createDocument();
    const toWatching = move(fresh, "WATCHING");
    const toDeciding = move(fresh, "DECIDING");

    expect(lastError(toWatching)).toBeUndefined();
    expect(lastError(toDeciding)).toBe(NEEDS_OWNER);
    expect(toDeciding.state.global.status).toBe("TO_EVALUATE");
  });

  it("needs a reason for rejected and withdrawn, and a blank one does not count", () => {
    for (const reason of [undefined, null, "", "   "]) {
      for (const to of ["REJECTED", "WITHDRAWN"] as Status[]) {
        const before = at("SUBMITTED");
        const after = move(before, to, reason as string);

        expect(lastError(after)).toBe(NEEDS_REASON);
        expect(after.state.global).toStrictEqual(before.state.global);
      }
    }
  });

  it("records the reason and the instant a closing status was reached", () => {
    const rejected = move(at("SUBMITTED"), "REJECTED", "Out of budget");
    const awarded = move(at("SUBMITTED"), "AWARDED");

    expect(rejected.state.global.statusReason).toBe("Out of budget");
    expect(rejected.state.global.closedAt).toBe(AT);
    expect(awarded.state.global.statusReason).toBeNull();
    expect(awarded.state.global.closedAt).toBe(AT);
  });

  it("records no reason and no closing instant for an open status", () => {
    const document = move(at("SUBMITTED"), "NEXT_STAGE", "Passed round one");

    expect(document.state.global.statusReason).toBeNull();
    expect(document.state.global.closedAt).toBeNull();
  });

  it("goes from next stage back to preparing as an ordinary move after the first go", () => {
    const document = move(at("NEXT_STAGE"), "PREPARING");

    expect(lastError(document)).toBeUndefined();
    expect(document.state.global.status).toBe("PREPARING");
    expect(document.state.global.goNoGoDecisions).toHaveLength(1);
  });
});

describe("the go-or-no-go decision", () => {
  const DECISION = {
    id: "go-1",
    decision: "GO" as const,
    decidedBy: LEAD,
    reason: "Fits our proof cases",
    attemptsLeft: 2,
    decidedAt: AT,
  };

  it.each(["TO_EVALUATE", "DECIDING"] as Status[])(
    "starts preparing on a go from %s and records the decision",
    (from) => {
      const document = reducer(at(from), decideGoNoGo(DECISION));

      expect(lastError(document)).toBeUndefined();
      expect(document.state.global.status).toBe("PREPARING");
      expect(document.state.global.statusReason).toBeNull();
      expect(document.state.global.closedAt).toBeNull();
      expect(document.state.global.goNoGoDecisions).toStrictEqual([DECISION]);
    },
  );

  it("records no limit as null", () => {
    const document = reducer(
      at("DECIDING"),
      decideGoNoGo({ ...DECISION, attemptsLeft: undefined }),
    );

    expect(document.state.global.goNoGoDecisions[0].attemptsLeft).toBeNull();
  });

  it.each(["TO_EVALUATE", "DECIDING"] as Status[])(
    "closes the opportunity on a no-go from %s, with the reason and the instant",
    (from) => {
      const document = reducer(
        at(from),
        decideGoNoGo({
          ...DECISION,
          decision: "NO_GO",
          reason: "Wrong region",
        }),
      );

      expect(lastError(document)).toBeUndefined();
      expect(document.state.global.status).toBe("NO_GO");
      expect(document.state.global.statusReason).toBe("Wrong region");
      expect(document.state.global.closedAt).toBe(AT);
      expect(document.state.global.goNoGoDecisions).toHaveLength(1);
      expect(document.state.global.goNoGoDecisions[0].decision).toBe("NO_GO");
    },
  );

  it("is refused from every other status", () => {
    for (const from of [
      "WATCHING",
      "PREPARING",
      "SUBMITTED",
      "NEXT_STAGE",
      "AWARDED",
      "REJECTED",
      "WITHDRAWN",
      "NO_GO",
    ] as Status[]) {
      const before = at(from);
      const after = reducer(before, decideGoNoGo({ ...DECISION, id: "go-9" }));

      expect(lastError(after)).toBe(
        "Go or no-go is decided while the opportunity is to evaluate or deciding",
      );
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });

  it("is refused without an owner", () => {
    const before = utils.createDocument();
    const after = reducer(before, decideGoNoGo(DECISION));

    expect(lastError(after)).toBe(NEEDS_OWNER);
    expect(after.state.global).toStrictEqual(before.state.global);
  });

  it("is refused without a decider", () => {
    for (const decidedBy of [undefined, null]) {
      const before = at("DECIDING");
      const after = reducer(before, decideGoNoGo({ ...DECISION, decidedBy }));

      expect(lastError(after)).toBe("The go-or-no-go decision needs a decider");
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });

  it("is refused without a reason, and a blank one does not count", () => {
    for (const reason of ["", "  "]) {
      const before = at("DECIDING");
      const after = reducer(before, decideGoNoGo({ ...DECISION, reason }));

      expect(lastError(after)).toBe("The go-or-no-go decision needs a reason");
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });
});

describe("blocked", () => {
  it("flags a preparing opportunity with a decision, a text or both", () => {
    const decision = reducer(
      at("PREPARING"),
      setBlocked({ decisionId: "decision-entity" }),
    );
    const text = reducer(
      at("PREPARING"),
      setBlocked({ text: "Waiting for the audit" }),
    );
    const both = reducer(
      at("PREPARING"),
      setBlocked({
        decisionId: "decision-entity",
        text: "Waiting for the audit",
      }),
    );

    expect(decision.state.global.blocked).toStrictEqual({
      decisionId: "decision-entity",
      text: null,
    });
    expect(text.state.global.blocked).toStrictEqual({
      decisionId: null,
      text: "Waiting for the audit",
    });
    expect(both.state.global.blocked).toStrictEqual({
      decisionId: "decision-entity",
      text: "Waiting for the audit",
    });
    expect(both.state.global.status).toBe("PREPARING");
  });

  it("replaces an earlier block", () => {
    let document = reducer(at("PREPARING"), setBlocked({ text: "First" }));
    document = reducer(document, setBlocked({ text: "Second" }));

    expect(document.state.global.blocked).toStrictEqual({
      decisionId: null,
      text: "Second",
    });
  });

  it("is refused outside preparing", () => {
    for (const from of [
      "WATCHING",
      "TO_EVALUATE",
      "DECIDING",
      "SUBMITTED",
      "NEXT_STAGE",
      "AWARDED",
    ] as Status[]) {
      const before = at(from);
      const after = reducer(before, setBlocked({ text: "Waiting" }));

      expect(lastError(after)).toBe(
        "An opportunity can be blocked only while preparing",
      );
      expect(after.state.global.blocked).toBeNull();
    }
  });

  it("is refused when it names neither a decision nor a text", () => {
    for (const input of [
      {},
      { text: "  " },
      { decisionId: null, text: null },
    ]) {
      const before = at("PREPARING");
      const after = reducer(before, setBlocked(input));

      expect(lastError(after)).toBe("Blocked must name a decision or a text");
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });

  it("is lifted without moving the status", () => {
    let document = reducer(at("PREPARING"), setBlocked({ text: "Waiting" }));
    document = reducer(document, clearBlocked({}));

    expect(lastError(document)).toBeUndefined();
    expect(document.state.global.blocked).toBeNull();
    expect(document.state.global.status).toBe("PREPARING");
  });

  it("cannot be lifted when it is not set", () => {
    const after = reducer(at("PREPARING"), clearBlocked({}));

    expect(lastError(after)).toBe("The opportunity is not blocked");
  });

  it("is cleared when the status leaves preparing", () => {
    for (const to of ["SUBMITTED", "WITHDRAWN"] as Status[]) {
      let document = reducer(
        mark(at("PREPARING")),
        setBlocked({ text: "Waiting" }),
      );
      document = move(document, to, "Because");

      expect(lastError(document)).toBeUndefined();
      expect(document.state.global.blocked).toBeNull();
    }
  });
});

describe("the dates", () => {
  it("sets and removes the decide-by day", () => {
    let document = reducer(
      utils.createDocument(),
      setDecideBy({ decideBy: "2026-11-20T00:00:00.000Z" }),
    );
    expect(document.state.global.decideBy).toBe("2026-11-20T00:00:00.000Z");
    document = reducer(document, setDecideBy({ decideBy: null }));

    expect(document.state.global.decideBy).toBeNull();
  });

  it("sets and removes the expected opening day", () => {
    let document = reducer(
      utils.createDocument(),
      setExpectedOpening({ expectedOpening: "2027-02-01T00:00:00.000Z" }),
    );
    expect(document.state.global.expectedOpening).toBe(
      "2027-02-01T00:00:00.000Z",
    );
    document = reducer(document, setExpectedOpening({ expectedOpening: null }));

    expect(document.state.global.expectedOpening).toBeNull();
  });
});
