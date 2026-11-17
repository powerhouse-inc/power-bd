import { describe, expect, it } from "vitest";
import { ALICE, input, lead, proposalRec } from "./fixtures.js";
import { overview } from "./overview.js";

const L = (over: object = {}) => ({ leads: [{ id: "L", state: lead(over) }] });
const run = (over: Parameters<typeof input>[0]) => overview(input(over));

describe("a lead's live proposals and value", () => {
  it("counts the range across options of a sent proposal", () => {
    const r = run({ ...L(), proposals: [proposalRec("P1")] });
    expect(r.leadValues.L).toEqual([
      { currency: "EUR", amount: 1000, upper: 4000 },
    ]);
    expect(r.liveProposals.L).toEqual([
      { id: "P1", title: "Scope A", status: "SENT" },
    ]);
  });

  it("counts the chosen option's total of an accepted proposal", () => {
    const r = run({
      ...L(),
      proposals: [
        proposalRec("P1", { status: "ACCEPTED", chosenOptionId: "o2" }),
      ],
    });
    expect(r.leadValues.L).toEqual([{ currency: "EUR", amount: 4000 }]);
  });

  it("adds an accepted proposal to a sent one, per currency", () => {
    const r = run({
      ...L(),
      proposals: [
        proposalRec("P1", { status: "ACCEPTED", chosenOptionId: "o1" }),
        proposalRec("P2"),
        proposalRec("P3", { currency: "CHF" }),
      ],
    });
    expect(r.leadValues.L).toEqual([
      { currency: "EUR", amount: 2000, upper: 5000 },
      { currency: "CHF", amount: 1000, upper: 4000 },
    ]);
  });

  it("counts no draft, approved, declined, withdrawn or superseded proposal", () => {
    const r = run({
      ...L(),
      proposals: [
        "DRAFT",
        "APPROVED",
        "DECLINED",
        "WITHDRAWN",
        "SUPERSEDED",
      ].map((status, i) => proposalRec(`P${i}`, { status: status as never })),
    });
    expect(r.leadValues).toEqual({});
    expect(r.liveProposals).toEqual({});
  });

  it("lists a live proposal without a value when nothing prices it", () => {
    const r = run({
      ...L(),
      proposals: [
        proposalRec("P1", { options: [] }),
        proposalRec("P2", { status: "ACCEPTED", chosenOptionId: null }),
        proposalRec("P3", { currency: null }),
      ],
    });
    expect(r.leadValues).toEqual({});
    expect(r.liveProposals.L).toHaveLength(3);
  });

  it("ignores a proposal of no lead", () => {
    const r = run({ ...L(), proposals: [proposalRec("P1", { leadId: null })] });
    expect(r.liveProposals).toEqual({});
  });
});

describe("proposals in what is due and what is slipping", () => {
  it("lists the valid-until date of a sent proposal", () => {
    const r = run({
      ...L(),
      proposals: [
        proposalRec("P1", { validUntil: "2026-11-20T00:00:00.000Z" }),
      ],
    });
    expect(r.due).toEqual([
      {
        due: "PROPOSAL_VALID_UNTIL",
        source: { kind: "lead", id: "L", name: "Acme Corp" },
        label: "Proposal valid until",
        day: "2026-11-20",
        people: [ALICE],
      },
    ]);
  });

  it("lists no valid-until date of an accepted proposal or of a closed lead", () => {
    expect(
      run({
        ...L(),
        proposals: [
          proposalRec("P1", {
            status: "ACCEPTED",
            validUntil: "2026-11-20T00:00:00.000Z",
          }),
        ],
      }).due,
    ).toEqual([]);
    expect(
      run({
        ...L({ status: "LOST" }),
        proposals: [
          proposalRec("P1", { validUntil: "2026-11-20T00:00:00.000Z" }),
        ],
      }).due,
    ).toEqual([]);
  });

  it("flags a sent proposal past its valid-until date, with since when", () => {
    const r = run({
      ...L(),
      proposals: [
        proposalRec("P1", { validUntil: "2026-11-12T00:00:00.000Z" }),
      ],
    });
    expect(r.slipping[0].reasons).toEqual(["PROPOSAL_UNANSWERED"]);
    expect(r.slipping[0].since.PROPOSAL_UNANSWERED).toEqual({
      from: "2026-11-12",
      days: 4,
    });
  });

  it("does not flag a sent proposal that is still valid or has no date", () => {
    expect(
      run({
        ...L(),
        proposals: [
          proposalRec("P1", { validUntil: "2026-11-16T00:00:00.000Z" }),
          proposalRec("P2"),
        ],
      }).slipping,
    ).toEqual([]);
  });

  it.each(["ACCEPTED", "DECLINED"])(
    "flags a %s proposal while the lead is open",
    (status) => {
      const r = run({
        ...L(),
        proposals: [
          proposalRec("P1", {
            status: status as never,
            answeredAt: "2026-11-14T08:00:00.000Z",
          }),
        ],
      });
      expect(r.slipping[0].reasons).toEqual(["PROPOSAL_ANSWER_NOT_REFLECTED"]);
      expect(r.slipping[0].since.PROPOSAL_ANSWER_NOT_REFLECTED).toEqual({
        from: "2026-11-14T08:00:00.000Z",
        days: 2,
      });
    },
  );

  it("does not flag an answer on a closed lead or a superseded proposal", () => {
    expect(
      run({
        ...L({ status: "WON" }),
        proposals: [proposalRec("P1", { status: "ACCEPTED" })],
      }).slipping,
    ).toEqual([]);
    expect(
      run({
        ...L(),
        proposals: [proposalRec("P1", { status: "SUPERSEDED" })],
      }).slipping,
    ).toEqual([]);
  });

  it("flags an answer with no recorded instant without a start", () => {
    const r = run({
      ...L(),
      proposals: [proposalRec("P1", { status: "DECLINED" })],
    });
    expect(r.slipping[0].since).toEqual({});
  });
});
