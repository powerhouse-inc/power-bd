import type { InvestorListState } from "document-models/investor-list";
import {
  actions as listActions,
  reducer as listReducer,
  utils as listUtils,
} from "document-models/investor-list/v1";
import type { OpportunityState } from "document-models/opportunity";
import {
  reducer as opportunityReducer,
  setOpportunityStatus,
  utils as opportunityUtils,
} from "document-models/opportunity/v1";
import type { ProposalState } from "document-models/proposal";
import {
  actions as proposalActions,
  reducer as proposalReducer,
  utils as proposalUtils,
} from "document-models/proposal/v1";
import { describe, expect, it } from "vitest";
import { moveAction } from "../../components/shared/board/moveAction.js";
import { ALICE } from "../overview/fixtures.js";
import {
  moveHint,
  moveReassurance,
  type MoveCard,
  type MoveOption,
  type MoveOutcome,
} from "./move.js";
import {
  FUNDING_STATUSES,
  INVESTOR_ROW_STATES,
  PROPOSAL_STATUSES,
  investorRowMove,
  investorRowTargets,
  opportunityStatusMove,
  opportunityStatusTargets,
  proposalMoveCard,
  proposalStatusMove,
  proposalStatusTargets,
  type ProposalCard,
} from "./status-moves.js";

const AT = "2026-11-18T09:00:00.000Z";
type OppCard = Extract<MoveCard, { kind: "opportunity" }>;
const anOpp = (over: Partial<OppCard> = {}): OppCard => ({
  kind: "opportunity",
  status: "TO_EVALUATE",
  owner: ALICE,
  openSubmission: false,
  ...over,
});
const options = (o: MoveOutcome): MoveOption[] =>
  o.kind === "choose"
    ? o.options
    : o.kind === "set" || o.kind === "reason" || o.kind === "confirm"
      ? [o.option]
      : [];
const why = (o: MoveOutcome) =>
  o.kind === "refused" || o.kind === "decision" ? o.why : "";

describe("moving a funding opportunity on the Funding board", () => {
  it("hands go and no-go to the decision", () => {
    for (const from of ["TO_EVALUATE", "DECIDING"] as const)
      for (const to of ["PREPARING", "NO_GO"] as const) {
        const o = opportunityStatusMove(anOpp({ status: from }), to);
        expect(o.kind).toBe("decision");
        expect(moveHint(o)).toBe("Go or no-go is decided on its page");
      }
  });

  it("moves by hand only as the page allows, saying what comes first", () => {
    expect(
      opportunityStatusMove(anOpp({ status: "WATCHING" }), "TO_EVALUATE").kind,
    ).toBe("set");
    expect(
      why(opportunityStatusMove(anOpp({ status: "WATCHING" }), "DECIDING")),
    ).toMatch(/To evaluate first/);
    expect(
      why(opportunityStatusMove(anOpp({ status: "DECIDING" }), "SUBMITTED")),
    ).toMatch(/Go or no-go comes first/);
    expect(
      why(opportunityStatusMove(anOpp({ status: "PREPARING" }), "AWARDED")),
    ).toBe("Mark it submitted first");
    expect(
      why(opportunityStatusMove(anOpp({ status: "SUBMITTED" }), "DECIDING")),
    ).toMatch(/moves on or closes/);
    expect(
      why(opportunityStatusMove(anOpp({ status: "NEXT_STAGE" }), "SUBMITTED")),
    ).toMatch(/Preparing first/);
    expect(
      why(opportunityStatusMove(anOpp({ status: "SUBMITTED" }), "PREPARING")),
    ).toMatch(/back to Preparing/);
  });

  it("needs an owner past to evaluate, and a submission to submit", () => {
    expect(
      why(
        opportunityStatusMove(
          anOpp({ status: "TO_EVALUATE", owner: null }),
          "DECIDING",
        ),
      ),
    ).toBe("Give it an owner first");
    expect(
      opportunityStatusMove(
        anOpp({ status: "TO_EVALUATE", owner: null }),
        "WATCHING",
      ).kind,
    ).toBe("set");
    expect(
      why(opportunityStatusMove(anOpp({ status: "PREPARING" }), "SUBMITTED")),
    ).toBe("Mark a submission on its page first");
    expect(
      opportunityStatusMove(
        anOpp({ status: "PREPARING", openSubmission: true }),
        "SUBMITTED",
      ).kind,
    ).toBe("set");
  });

  it("asks why when rejected or withdrawn, and to confirm an award", () => {
    const rejected = opportunityStatusMove(
      anOpp({ status: "SUBMITTED" }),
      "REJECTED",
    );
    expect(rejected.kind).toBe("reason");
    const awarded = opportunityStatusMove(
      anOpp({ status: "SUBMITTED" }),
      "AWARDED",
    );
    expect(awarded.kind).toBe("confirm");
    expect(moveReassurance(awarded)).toContain(
      "funding opportunity keeps its history",
    );
  });

  it("refuses every move of a closed opportunity", () => {
    for (const status of ["AWARDED", "REJECTED", "WITHDRAWN", "NO_GO"] as const)
      expect(
        opportunityStatusTargets(anOpp({ status })).some((t) => t.accepts),
      ).toBe(false);
  });

  it("lists every status column in the board's order", () => {
    expect(opportunityStatusTargets(anOpp()).map((t) => t.stage)).toEqual([
      ...FUNDING_STATUSES,
    ]);
  });

  it("agrees with the reducer: what is offered is accepted, with a reason exactly where asked; what is refused is refused", () => {
    let offered = 0;
    for (const status of FUNDING_STATUSES)
      for (const owner of [ALICE, null])
        for (const openSubmission of [true, false]) {
          const state = {
            ...opportunityUtils.createDocument().state.global,
            status,
            owner,
            submissions: openSubmission ? [{ id: "s", outcome: null }] : [],
          } as unknown as OpportunityState;
          const run = (to: OpportunityState["status"], reason?: string) => {
            const next = opportunityReducer(
              opportunityUtils.createDocument({ global: state }),
              setOpportunityStatus({ status: to, reason, changedAt: AT }),
            );
            return {
              error: next.operations.global.at(-1)?.error,
              status: next.state.global.status,
            };
          };
          for (const to of FUNDING_STATUSES) {
            const o = opportunityStatusMove(
              { kind: "opportunity", status, owner, openSubmission },
              to,
            );
            if (o.kind === "refused" || o.kind === "decision") {
              expect(
                run(to, "Because").error,
                `${status} ✗ ${to}`,
              ).toBeTruthy();
              continue;
            }
            for (const option of options(o)) {
              offered++;
              const done = run(to, option.reason ? "Because" : undefined);
              expect(done.error, `${status} → ${to}`).toBeFalsy();
              expect(done.status).toBe(to);
              if (option.reason) expect(run(to).error).toBeTruthy();
            }
          }
        }
    expect(offered).toBeGreaterThan(20);
  });
});

describe("moving an investor on the Investors board", () => {
  it("shortlists and puts back on the list at once", () => {
    expect(investorRowMove({ state: "LISTED" }, "SHORTLISTED").kind).toBe(
      "set",
    );
    expect(investorRowMove({ state: "EXCLUDED" }, "LISTED").kind).toBe("set");
    expect(investorRowMove({ state: "SHORTLISTED" }, "LISTED").kind).toBe(
      "set",
    );
  });

  it("asks why when excluded, and says it can come back", () => {
    const o = investorRowMove({ state: "SHORTLISTED" }, "EXCLUDED");
    expect(o.kind).toBe("reason");
    expect(options(o)[0]).toMatchObject({
      act: "EXCLUDE_ROW",
      ask: "Why exclude it?",
    });
    expect(moveReassurance(o)).toBe("You can put it back on the list later.");
  });

  it("starts a relationship only from the shortlist, in its own panel", () => {
    const o = investorRowMove({ state: "SHORTLISTED" }, "ENGAGED");
    expect(o).toMatchObject({
      kind: "decision",
      open: "Start relationship",
      people: false,
    });
    expect(why(investorRowMove({ state: "LISTED" }, "ENGAGED"))).toMatch(
      /Shortlist it first/,
    );
  });

  it("refuses every move of an engaged investor", () => {
    expect(
      investorRowTargets({ state: "ENGAGED" }).some((t) => t.accepts),
    ).toBe(false);
  });

  it("agrees with the reducer", () => {
    let offered = 0;
    for (const from of INVESTOR_ROW_STATES) {
      const state = {
        ...listUtils.createDocument().state.global,
        rows: [
          {
            id: "r1",
            name: "Tallgrass",
            website: null,
            sourceList: null,
            state: from,
            exclusionReason: null,
            thesisNote: null,
            comparables: [],
            organisationId: null,
            leadId: null,
          },
        ],
      } as InvestorListState;
      const run = (action: Parameters<typeof listReducer>[1]) => {
        const next = listReducer(
          listUtils.createDocument({ global: state }),
          action,
        );
        return {
          error: next.operations.global.at(-1)?.error,
          state: next.state.global.rows[0]?.state,
        };
      };
      for (const to of INVESTOR_ROW_STATES) {
        const o = investorRowMove({ state: from }, to);
        if (o.kind === "refused" && to !== "ENGAGED") {
          // What the board refuses, the reducer refuses too; engaging is the page's rule (from the shortlist only).
          const attempt =
            to === "LISTED"
              ? listActions.relistRow({ id: "r1" })
              : to === "SHORTLISTED"
                ? listActions.shortlistRow({ id: "r1" })
                : listActions.excludeRow({ id: "r1", reason: "Because" });
          expect(run(attempt).error, `${from} ✗ ${to}`).toBeTruthy();
          continue;
        }
        for (const option of options(o)) {
          offered++;
          const done = run(
            moveAction(
              option,
              option.reason ? "Because" : undefined,
              "r1",
            ),
          );
          expect(done.error, `${from} → ${to}`).toBeFalsy();
          expect(done.state).toBe(to);
          if (option.reason)
            expect(
              run(
                moveAction(option, "", "r1") as Parameters<
                  typeof listReducer
                >[1],
              ).error,
            ).toBeTruthy();
        }
      }
    }
    expect(offered).toBeGreaterThanOrEqual(6);
  });
});

describe("moving a proposal on the Proposals board", () => {
  const two = [
    { id: "o1", label: "Pilot" },
    { id: "o2", label: "Full rollout" },
  ];
  const aProposal = (over: Partial<ProposalCard> = {}): ProposalCard => ({
    status: "SENT",
    options: two,
    ...over,
  });

  it("leaves approving and marking sent to a person on the page", () => {
    expect(
      proposalStatusMove(aProposal({ status: "DRAFT" }), "APPROVED"),
    ).toMatchObject({
      kind: "decision",
      open: "Open to approve",
      people: true,
    });
    expect(
      proposalStatusMove(aProposal({ status: "APPROVED" }), "SENT"),
    ).toMatchObject({
      kind: "decision",
      open: "Open to mark sent",
      people: true,
    });
  });

  it("asks to confirm reopening an approved draft", () => {
    const o = proposalStatusMove(aProposal({ status: "APPROVED" }), "DRAFT");
    expect(o.kind).toBe("confirm");
    expect(options(o)[0]).toMatchObject({
      act: "REOPEN_PROPOSAL",
      verb: "Reopen to edit",
    });
    expect(moveReassurance(o)).toMatch(/clears the approval/);
  });

  it("asks which option was accepted, or confirms the only one", () => {
    const many = proposalStatusMove(aProposal(), "ACCEPTED");
    expect(many.kind).toBe("choose");
    expect(options(many).map((x) => x.label)).toEqual([
      "Pilot",
      "Full rollout",
    ]);
    expect(moveHint(many)).toBe("Becomes Accepted · asks which option");
    const one = proposalStatusMove(
      aProposal({ options: [two[0]] }),
      "ACCEPTED",
    );
    expect(one.kind).toBe("confirm");
    expect(options(one)[0]).toMatchObject({
      label: "Accepted",
      verb: "The client accepted “Pilot”",
    });
    expect(
      why(proposalStatusMove(aProposal({ options: [] }), "ACCEPTED")),
    ).toMatch(/Add an option/);
  });

  it("asks why when declined or withdrawn", () => {
    expect(proposalStatusMove(aProposal(), "DECLINED").kind).toBe("reason");
    for (const from of ["DRAFT", "APPROVED", "SENT"] as const)
      expect(
        proposalStatusMove(aProposal({ status: from }), "WITHDRAWN").kind,
      ).toBe("reason");
  });

  it("supersedes only through a revision, and keeps ended proposals", () => {
    expect(why(proposalStatusMove(aProposal(), "SUPERSEDED"))).toMatch(
      /revision/,
    );
    for (const status of [
      "ACCEPTED",
      "DECLINED",
      "WITHDRAWN",
      "SUPERSEDED",
    ] as const)
      expect(
        proposalStatusTargets(aProposal({ status })).some((t) => t.accepts),
      ).toBe(false);
  });

  it("reads a proposal's facts from its record", () => {
    const s = {
      ...proposalUtils.createDocument().state.global,
      status: "SENT",
      options: [{ id: "o1", label: "Pilot", packageIds: [], adjustments: [] }],
    } as unknown as ProposalState;
    expect(proposalMoveCard(s)).toEqual({
      status: "SENT",
      options: [{ id: "o1", label: "Pilot" }],
    });
  });

  it("agrees with the reducer", () => {
    let offered = 0;
    for (const from of PROPOSAL_STATUSES)
      for (const opts of [two, []]) {
        const state = {
          ...proposalUtils.createDocument().state.global,
          status: from,
          options: opts.map((o) => ({ ...o, packageIds: [], adjustments: [] })),
        } as unknown as ProposalState;
        const run = (action: Parameters<typeof proposalReducer>[1]) => {
          const next = proposalReducer(
            proposalUtils.createDocument({ global: state }),
            action,
          );
          return {
            error: next.operations.global.at(-1)?.error,
            status: next.state.global.status,
          };
        };
        for (const to of PROPOSAL_STATUSES) {
          const o = proposalStatusMove({ status: from, options: opts }, to);
          if (o.kind === "refused" && to !== "SUPERSEDED") {
            // What the board refuses, the reducer refuses too. Superseding is the page's rule: only a revision marked sent does it.
            const attempt =
              to === "DRAFT"
                ? proposalActions.reopenProposal({})
                : to === "APPROVED"
                  ? proposalActions.approveProposal({
                      approvedBy: ALICE,
                      approvedAt: AT,
                    })
                  : to === "SENT"
                    ? proposalActions.markProposalSent({
                        sentBy: ALICE,
                        sentAt: AT,
                      })
                    : to === "ACCEPTED"
                      ? proposalActions.recordProposalAnswer({
                          accepted: true,
                          chosenOptionId: opts[0]?.id ?? "o1",
                          answeredAt: AT,
                        })
                      : to === "DECLINED"
                        ? proposalActions.recordProposalAnswer({
                            accepted: false,
                            reason: "Because",
                            answeredAt: AT,
                          })
                        : proposalActions.withdrawProposal({
                            reason: "Because",
                          });
            expect(run(attempt).error, `${from} ✗ ${to}`).toBeTruthy();
            continue;
          }
          for (const option of options(o)) {
            offered++;
            const done = run(
              moveAction(
                option,
                option.reason ? "Because" : undefined,
              ),
            );
            expect(done.error, `${from} → ${to}`).toBeFalsy();
            expect(done.status).toBe(to);
            if (option.reason)
              expect(
                run(
                  moveAction(option, "") as Parameters<
                    typeof proposalReducer
                  >[1],
                ).error,
              ).toBeTruthy();
          }
        }
      }
    expect(offered).toBeGreaterThanOrEqual(8);
  });
});
