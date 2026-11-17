import {
  parkLead,
  reducer as leadReducer,
  setLeadStatus,
  unparkLead,
  utils as leadUtils,
} from "document-models/lead/v1";
import type { LeadState } from "document-models/lead";
import {
  reducer as opportunityReducer,
  setOpportunityStatus,
  utils as opportunityUtils,
} from "document-models/opportunity/v1";
import type { OpportunityState } from "document-models/opportunity";
import { describe, expect, it } from "vitest";
import type { CommonStage } from "../overview/index.js";
import { leadStage, opportunityStage } from "../overview/board.js";
import { ALICE, input, lead, list, opportunity } from "../overview/fixtures.js";
import { cardKey } from "./cards.js";
import {
  canMove,
  cardMove,
  moveCards,
  moveHint,
  moveReassurance,
  moveTargets,
  type MoveCard,
  type MoveOption,
  type MoveOutcome,
} from "./move.js";

const STAGES: CommonStage[] = ["NEW", "ACTIVE", "PARKED", "CLOSED"];
const AT = "2026-11-16T09:00:00.000Z";

type LeadCard = Extract<MoveCard, { kind: "lead" }>;
type OppCard = Extract<MoveCard, { kind: "opportunity" }>;
const aLead = (over: Partial<LeadCard> = {}): LeadCard => ({
  kind: "lead",
  status: "IN_TOUCH",
  leadKind: "SALES",
  owner: ALICE,
  organisationId: "c1",
  parkedFrom: null,
  ...over,
});
const anOpp = (over: Partial<OppCard> = {}): OppCard => ({
  kind: "opportunity",
  status: "TO_EVALUATE",
  owner: ALICE,
  openSubmission: false,
  ...over,
});
const ROW: MoveCard = { kind: "investor-row" };

const statuses = (o: MoveOutcome) =>
  o.kind === "choose" ? o.options.map((x) => x.status) : [];
const why = (o: MoveOutcome) =>
  o.kind === "refused" || o.kind === "decision" ? o.why : "";

describe("moving a lead", () => {
  it("sets to contact at once when dropped on New", () => {
    expect(cardMove(aLead(), "NEW")).toEqual({
      kind: "set",
      option: {
        act: "LEAD_STATUS",
        status: "TO_CONTACT",
        label: "To contact",
        reason: false,
        final: false,
      },
    });
  });

  it("stays when a to-contact lead is dropped on New", () => {
    expect(cardMove(aLead({ status: "TO_CONTACT" }), "NEW")).toEqual({
      kind: "stay",
    });
  });

  it("asks which active status when dropped on Active", () => {
    const o = cardMove(aLead({ status: "TO_CONTACT" }), "ACTIVE");
    expect(statuses(o)).toEqual(["IN_TOUCH", "MEETING_SET", "MET", "PROPOSAL"]);
  });

  it("offers the other active statuses inside Active, never at once", () => {
    expect(statuses(cardMove(aLead({ status: "MET" }), "ACTIVE"))).toEqual([
      "IN_TOUCH",
      "MEETING_SET",
      "PROPOSAL",
    ]);
  });

  it("stops an investor lead at met", () => {
    const o = cardMove(
      aLead({ status: "TO_CONTACT", leadKind: "INVESTOR" }),
      "ACTIVE",
    );
    expect(statuses(o)).toEqual(["IN_TOUCH", "MEETING_SET", "MET"]);
    expect(o.kind === "choose" && o.note).toBe(
      "An investor lead goes no further than met",
    );
  });

  it("asks why when parked", () => {
    expect(cardMove(aLead(), "PARKED")).toEqual({
      kind: "reason",
      option: {
        act: "PARK_LEAD",
        status: "PARKED",
        label: "Parked",
        reason: true,
        final: false,
        ask: "Why is it parked?",
      },
    });
  });

  it("offers won and lost on Closed; lost needs a reason", () => {
    const o = cardMove(aLead(), "CLOSED");
    expect(o.kind === "choose" && o.options).toEqual([
      {
        act: "LEAD_STATUS",
        status: "WON",
        label: "Won",
        reason: false,
        final: true,
      },
      {
        act: "LEAD_STATUS",
        status: "LOST",
        label: "Lost",
        reason: true,
        final: true,
        ask: "Why was it lost?",
      },
    ]);
  });

  it("closes an investor lead only as lost, asking why", () => {
    const o = cardMove(aLead({ leadKind: "INVESTOR" }), "CLOSED");
    expect(o.kind === "reason" && o.option.status).toBe("LOST");
    expect(o.kind === "reason" && o.note).toBe(
      "An investor lead goes no further than met",
    );
  });

  it("explains what is missing before a lead leaves New", () => {
    const none = aLead({
      status: "TO_CONTACT",
      owner: null,
      organisationId: null,
    });
    expect(why(cardMove(none, "ACTIVE"))).toBe(
      "Give the lead an owner and an organisation first",
    );
    expect(why(cardMove({ ...none, owner: ALICE }, "PARKED"))).toBe(
      "Link the lead to an organisation first",
    );
    expect(why(cardMove({ ...none, organisationId: "c" }, "CLOSED"))).toBe(
      "Give the lead an owner first",
    );
    expect(cardMove(none, "NEW").kind).toBe("stay");
  });

  it("takes a parked lead off hold only into the stage it came from", () => {
    const parked = aLead({ status: "PARKED", parkedFrom: "MET" });
    expect(cardMove(parked, "ACTIVE")).toEqual({
      kind: "set",
      option: {
        act: "UNPARK_LEAD",
        status: "MET",
        label: "Met",
        reason: false,
        final: false,
      },
    });
    expect(why(cardMove(parked, "NEW"))).toBe(
      "Take it off hold first: it returns to Met, in Active",
    );
    expect(why(cardMove(parked, "CLOSED"))).toBe(
      "Take it off hold first: it returns to Met, in Active",
    );
    expect(cardMove(parked, "PARKED").kind).toBe("stay");
    const fresh = aLead({ status: "PARKED", parkedFrom: "TO_CONTACT" });
    expect(cardMove(fresh, "NEW").kind).toBe("set");
    expect(
      why(cardMove(aLead({ status: "PARKED", parkedFrom: null }), "NEW")),
    ).toBe("Open the lead to take it off hold");
  });

  it("refuses every move of a won or lost lead", () => {
    for (const status of ["WON", "LOST"] as const) {
      const closed = aLead({ status });
      expect(cardMove(closed, "CLOSED").kind).toBe("stay");
      for (const stage of ["NEW", "ACTIVE", "PARKED"] as const)
        expect(why(cardMove(closed, stage))).toBe(
          "A won or lost lead is final",
        );
      expect(canMove(closed)).toBe(false);
    }
  });
});

describe("moving a funding opportunity", () => {
  it("hands go or no-go to the decision, never deciding it", () => {
    for (const status of ["TO_EVALUATE", "DECIDING"] as const)
      for (const stage of ["ACTIVE", "CLOSED"] as const)
        expect(cardMove(anOpp({ status }), stage)).toEqual({
          kind: "decision",
          why: "Go or no-go is the team lead's decision, taken by a person on the opportunity's page",
        });
  });

  it("watches at once from New, and evaluates at once from Parked", () => {
    const park = cardMove(anOpp({ status: "DECIDING" }), "PARKED");
    expect(park.kind === "set" && park.option).toEqual({
      act: "OPPORTUNITY_STATUS",
      status: "WATCHING",
      label: "Watching",
      reason: false,
      final: false,
    });
    const back = cardMove(anOpp({ status: "WATCHING" }), "NEW");
    expect(back.kind === "set" && back.option.status).toBe("TO_EVALUATE");
  });

  it("offers the other New status inside New, as a choice", () => {
    expect(statuses(cardMove(anOpp(), "NEW"))).toEqual(["DECIDING"]);
    expect(statuses(cardMove(anOpp({ status: "DECIDING" }), "NEW"))).toEqual([
      "TO_EVALUATE",
    ]);
  });

  it("needs an owner past to evaluate", () => {
    expect(why(cardMove(anOpp({ owner: null }), "NEW"))).toBe(
      "Give it an owner first",
    );
    // Watching needs none.
    expect(cardMove(anOpp({ owner: null }), "PARKED").kind).toBe("set");
  });

  it("refuses a watched opportunity anywhere but New", () => {
    const watching = anOpp({ status: "WATCHING" });
    for (const stage of ["ACTIVE", "CLOSED"] as const)
      expect(why(cardMove(watching, stage))).toBe(
        "Move it to New first: a watched opportunity is evaluated before anything else",
      );
    expect(cardMove(watching, "PARKED").kind).toBe("stay");
  });

  it("submits only with a submission that has no outcome", () => {
    const preparing = anOpp({ status: "PREPARING" });
    expect(why(cardMove(preparing, "ACTIVE"))).toBe(
      "Mark a submission on its page first",
    );
    expect(
      statuses(cardMove({ ...preparing, openSubmission: true }, "ACTIVE")),
    ).toEqual(["SUBMITTED"]);
  });

  it("withdraws from preparing with a reason", () => {
    expect(cardMove(anOpp({ status: "PREPARING" }), "CLOSED")).toEqual({
      kind: "reason",
      option: {
        act: "OPPORTUNITY_STATUS",
        status: "WITHDRAWN",
        label: "Withdrawn",
        reason: true,
        final: true,
        ask: "Why was it withdrawn?",
      },
    });
  });

  it("closes a submitted opportunity three ways", () => {
    const o = cardMove(anOpp({ status: "SUBMITTED" }), "CLOSED");
    expect(
      o.kind === "choose" &&
        o.options.map((x) => [x.status, x.reason, x.final, x.ask]),
    ).toEqual([
      ["AWARDED", false, true, undefined],
      ["REJECTED", true, true, "Why was it rejected?"],
      ["WITHDRAWN", true, true, "Why was it withdrawn?"],
    ]);
  });

  it("moves on inside Active", () => {
    expect(
      statuses(cardMove(anOpp({ status: "SUBMITTED" }), "ACTIVE")),
    ).toEqual(["NEXT_STAGE"]);
    expect(
      statuses(cardMove(anOpp({ status: "NEXT_STAGE" }), "ACTIVE")),
    ).toEqual(["PREPARING"]);
  });

  it("does not go back to New or Parked after the go decision", () => {
    for (const status of ["PREPARING", "SUBMITTED", "NEXT_STAGE"] as const) {
      expect(why(cardMove(anOpp({ status }), "NEW"))).toBe(
        "After the go decision a funding opportunity does not go back to New",
      );
      expect(why(cardMove(anOpp({ status }), "PARKED"))).toBe(
        "After the go decision a funding opportunity moves on or closes; it is not parked",
      );
    }
  });

  it("refuses closing while nobody owns it", () => {
    const o = cardMove(anOpp({ status: "SUBMITTED", owner: null }), "CLOSED");
    expect(why(o)).toBe("Give it an owner first");
  });

  it("refuses every move of a closed opportunity", () => {
    for (const status of [
      "AWARDED",
      "REJECTED",
      "WITHDRAWN",
      "NO_GO",
    ] as const) {
      const closed = anOpp({ status });
      expect(cardMove(closed, "CLOSED").kind).toBe("stay");
      expect(why(cardMove(closed, "ACTIVE"))).toBe(
        "A closed funding opportunity is final",
      );
      expect(canMove(closed)).toBe(false);
    }
  });
});

describe("moving a shortlisted investor", () => {
  it("stays in New and is refused elsewhere, saying where to start", () => {
    expect(cardMove(ROW, "NEW").kind).toBe("stay");
    for (const stage of ["ACTIVE", "PARKED", "CLOSED"] as const)
      expect(why(cardMove(ROW, stage))).toBe(
        "Start a relationship from the investor's row first",
      );
    expect(canMove(ROW)).toBe(false);
  });
});

describe("targets, hints and reassurance", () => {
  it("lists the four stages with what a drop does", () => {
    const targets = moveTargets(aLead());
    expect(targets.map((t) => [t.stage, t.outcome.kind, t.accepts])).toEqual([
      ["NEW", "set", true],
      ["ACTIVE", "choose", true],
      ["PARKED", "reason", true],
      ["CLOSED", "choose", true],
    ]);
    expect(canMove(aLead())).toBe(true);
    expect(
      moveTargets(anOpp()).map((t) => [t.stage, t.outcome.kind, t.accepts]),
    ).toEqual([
      ["NEW", "choose", true],
      ["ACTIVE", "decision", true],
      ["PARKED", "set", true],
      ["CLOSED", "decision", true],
    ]);
    expect(moveTargets(ROW).every((t) => !t.accepts)).toBe(true);
  });

  it("says in a short line what a drop does", () => {
    const hints = (card: MoveCard) =>
      STAGES.map((s) => moveHint(cardMove(card, s)));
    expect(hints(aLead())).toEqual([
      "Becomes To contact",
      "Pick: Meeting set, Met or Proposal",
      "Becomes Parked · asks why",
      "Pick: Won or Lost",
    ]);
    expect(hints(anOpp({ status: "SUBMITTED" }))).toEqual([
      "After the go decision a funding opportunity does not go back to New",
      "Pick: Next stage",
      "After the go decision a funding opportunity moves on or closes; it is not parked",
      "Pick: Awarded, Rejected or Withdrawn",
    ]);
    expect(moveHint(cardMove(anOpp(), "ACTIVE"))).toBe(
      "Go or no-go is decided on its page",
    );
    expect(moveHint({ kind: "stay" })).toBe("");
    expect(
      moveHint(
        cardMove(aLead({ status: "PARKED", parkedFrom: "MET" }), "ACTIVE"),
      ),
    ).toBe("Comes off hold · returns to Met");
  });

  it("reassures where a move closes or parks", () => {
    expect(moveReassurance(cardMove(aLead(), "CLOSED"))).toBe(
      "Nothing is deleted: a closed lead keeps its history. Closing is final.",
    );
    expect(
      moveReassurance(cardMove(anOpp({ status: "PREPARING" }), "CLOSED")),
    ).toBe(
      "Nothing is deleted: a closed funding opportunity keeps its history. Closing is final.",
    );
    expect(moveReassurance(cardMove(aLead(), "PARKED"))).toBe(
      "Nothing is lost: taken off hold, it returns to where it was.",
    );
    expect(moveReassurance(cardMove(aLead(), "ACTIVE"))).toBeNull();
    expect(moveReassurance(cardMove(aLead(), "NEW"))).toBeNull();
    expect(moveReassurance(cardMove(ROW, "ACTIVE"))).toBeNull();
  });

  it("reads each card's facts from the records", () => {
    const cards = moveCards(
      input({
        leads: [
          {
            id: "l1",
            state: lead({
              status: "PARKED",
              parkedFrom: "MET",
              kind: "INVESTOR",
              organisationId: "c1",
            }),
          },
          { id: "l2", state: lead({ owner: null }) },
        ],
        opportunities: [
          {
            id: "o1",
            state: opportunity({
              submissions: [{ id: "s", outcome: null }],
            } as unknown as Partial<OpportunityState>),
          },
          {
            id: "o2",
            state: opportunity({
              owner: "",
              submissions: [{ id: "s", outcome: { result: "REJECTED" } }],
            } as unknown as Partial<OpportunityState>),
          },
        ],
        investorLists: [
          { id: "i1", state: list([{ state: "SHORTLISTED" }, {}]) },
        ],
      }),
    );
    expect(cards.get(cardKey({ kind: "lead", id: "l1" }))).toEqual({
      kind: "lead",
      status: "PARKED",
      leadKind: "INVESTOR",
      owner: ALICE,
      organisationId: "c1",
      parkedFrom: "MET",
    });
    expect(cards.get(cardKey({ kind: "lead", id: "l2" }))).toEqual({
      kind: "lead",
      status: "IN_TOUCH",
      leadKind: null,
      owner: null,
      organisationId: null,
      parkedFrom: null,
    });
    expect(cards.get(cardKey({ kind: "opportunity", id: "o1" }))).toEqual({
      kind: "opportunity",
      status: "PREPARING",
      owner: ALICE,
      openSubmission: true,
    });
    expect(cards.get(cardKey({ kind: "opportunity", id: "o2" }))).toEqual({
      kind: "opportunity",
      status: "PREPARING",
      owner: null,
      openSubmission: false,
    });
    expect(
      cards.get(cardKey({ kind: "investor-row", id: "i1", rowId: "r0" })),
    ).toEqual({ kind: "investor-row" });
    expect(cards.size).toBe(5);
  });
});

/** Every offer is checked against the reducers the models run. */
describe("agrees with the reducers", () => {
  const options = (o: MoveOutcome): MoveOption[] =>
    o.kind === "choose"
      ? o.options
      : o.kind === "set" || o.kind === "reason"
        ? [o.option]
        : [];

  const LEAD_STATUSES = [
    "TO_CONTACT",
    "IN_TOUCH",
    "MEETING_SET",
    "MET",
    "PROPOSAL",
    "WON",
    "LOST",
    "PARKED",
  ] as const;

  it("lead: what is offered is accepted, with a reason exactly where asked", () => {
    let offered = 0;
    for (const status of LEAD_STATUSES)
      for (const leadKind of ["SALES", "INVESTOR"] as const)
        for (const owner of [ALICE, null])
          for (const organisationId of ["c1", null])
            for (const parkedFrom of status === "PARKED"
              ? (["TO_CONTACT", "MET"] as const)
              : [null]) {
              const state = {
                ...leadUtils.createDocument().state.global,
                status,
                kind: leadKind,
                owner,
                organisationId,
                parkedFrom,
              } as LeadState;
              const card: MoveCard = {
                kind: "lead",
                status,
                leadKind,
                owner,
                organisationId,
                parkedFrom,
              };
              for (const stage of STAGES)
                for (const option of options(cardMove(card, stage))) {
                  offered++;
                  const run = (reason?: string) => {
                    const doc = leadUtils.createDocument({ global: state });
                    const action =
                      option.act === "PARK_LEAD"
                        ? parkLead({ reason: reason ?? "", parkedAt: AT })
                        : option.act === "UNPARK_LEAD"
                          ? unparkLead({})
                          : setLeadStatus({
                              status: option.status as LeadState["status"],
                              reason,
                              changedAt: AT,
                            });
                    const next = leadReducer(doc, action);
                    return {
                      error: next.operations.global.at(-1)?.error,
                      status: next.state.global.status,
                    };
                  };
                  const done = run(option.reason ? "Because" : undefined);
                  expect(
                    done.error,
                    `${status} → ${option.status}`,
                  ).toBeFalsy();
                  expect(done.status).toBe(option.status);
                  expect(leadStage(done.status)).toBe(stage);
                  if (option.reason) expect(run().error).toBeTruthy();
                }
            }
    expect(offered).toBeGreaterThan(40);
  });

  it("opportunity: what is offered is accepted, with a reason exactly where asked", () => {
    let offered = 0;
    const STATUSES = [
      "WATCHING",
      "TO_EVALUATE",
      "DECIDING",
      "PREPARING",
      "SUBMITTED",
      "NEXT_STAGE",
      "AWARDED",
      "REJECTED",
      "WITHDRAWN",
      "NO_GO",
    ] as const;
    for (const status of STATUSES)
      for (const owner of [ALICE, null])
        for (const openSubmission of [true, false]) {
          const state = {
            ...opportunityUtils.createDocument().state.global,
            status,
            owner,
            submissions: openSubmission ? [{ id: "s", outcome: null }] : [],
          } as unknown as OpportunityState;
          const card: MoveCard = {
            kind: "opportunity",
            status,
            owner,
            openSubmission,
          };
          for (const stage of STAGES)
            for (const option of options(cardMove(card, stage))) {
              offered++;
              const run = (reason?: string) => {
                const next = opportunityReducer(
                  opportunityUtils.createDocument({ global: state }),
                  setOpportunityStatus({
                    status: option.status as OpportunityState["status"],
                    reason,
                    changedAt: AT,
                  }),
                );
                return {
                  error: next.operations.global.at(-1)?.error,
                  status: next.state.global.status,
                };
              };
              const done = run(option.reason ? "Because" : undefined);
              expect(done.error, `${status} → ${option.status}`).toBeFalsy();
              expect(opportunityStage(done.status)).toBe(stage);
              if (option.reason) expect(run().error).toBeTruthy();
            }
        }
    expect(offered).toBeGreaterThan(20);
  });
});
