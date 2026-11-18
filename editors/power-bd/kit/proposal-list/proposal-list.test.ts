import { describe, expect, it } from "vitest";
import { lead, proposalRec } from "../overview/fixtures.js";
import {
  emptyProposal,
  fixed,
  option,
  pkg,
  step,
} from "../proposal-totals/fixtures.js";
import {
  isBlank,
  leadProposalNext,
  openProposalCount,
  proposalBadges,
  proposalNext,
  proposalRows,
  waitLabel,
  waitSummary,
  waitsOn,
  type ProposalRow,
} from "./proposal-list.js";

const TODAY = "2026-11-17";

/** A draft with one priced package in one option and payment steps at 100 %: nothing to fix. */
const clean = (over: Parameters<typeof emptyProposal>[0] = {}) =>
  emptyProposal({
    title: "Pilot reporting",
    leadId: "L",
    packages: [pkg("p1")],
    deliverables: [fixed("d1", "p1", 8000)],
    options: [option("o1", ["p1"])],
    paymentSteps: [step("s1", "ON_SIGNATURE", 100)],
    ...over,
  });

const rows = (
  proposals: { id: string; state: ReturnType<typeof emptyProposal> }[],
  over: Partial<Parameters<typeof proposalRows>[0]> = {},
) =>
  proposalRows({
    proposals,
    leads: [
      {
        id: "L",
        state: lead({ name: "Brisa Labs: pilot", organisationId: "c1" }),
      },
    ],
    organisations: { c1: "Brisa Labs" },
    playbook: undefined,
    decisions: [],
    today: TODAY,
    ...over,
  });

describe("what a proposal waits on", () => {
  const w = (over: Partial<Parameters<typeof waitsOn>[0]>) =>
    waitsOn({
      status: "DRAFT",
      findings: 0,
      blank: false,
      validUntil: null,
      today: TODAY,
      ...over,
    });

  it("is writing while a draft holds nothing", () => {
    expect(w({ blank: true, findings: 1 })).toEqual({ kind: "writing" });
  });
  it("is the findings while a draft has any", () => {
    expect(w({ findings: 3 })).toEqual({ kind: "findings", count: 3 });
  });
  it("is approval when a draft has nothing left to fix", () => {
    expect(w({})).toEqual({ kind: "approval" });
  });
  it("is sending once approved", () => {
    expect(w({ status: "APPROVED" })).toEqual({ kind: "sending" });
  });
  it("is the client's answer once sent, until the valid-until day", () => {
    expect(w({ status: "SENT", validUntil: "2026-12-04T00:00:00.000Z" })).toEqual(
      { kind: "answer", until: "2026-12-04", overdue: false },
    );
    expect(w({ status: "SENT", validUntil: TODAY })).toEqual({
      kind: "answer",
      until: TODAY,
      overdue: false,
    });
    expect(w({ status: "SENT" })).toEqual({
      kind: "answer",
      until: null,
      overdue: false,
    });
  });
  it("is overdue when a sent proposal is past its valid-until day", () => {
    expect(w({ status: "SENT", validUntil: "2026-11-10" })).toEqual({
      kind: "answer",
      until: "2026-11-10",
      overdue: true,
    });
  });
  it("is nothing once answered, withdrawn or superseded", () => {
    for (const status of [
      "ACCEPTED",
      "DECLINED",
      "WITHDRAWN",
      "SUPERSEDED",
    ] as const)
      expect(w({ status })).toEqual({ kind: "nothing" });
  });

  it("words each wait for the list", () => {
    expect(waitLabel({ kind: "writing" })).toBe("Writing");
    expect(waitLabel({ kind: "findings", count: 1 })).toBe("1 finding to fix");
    expect(waitLabel({ kind: "findings", count: 4 })).toBe("4 findings to fix");
    expect(waitLabel({ kind: "approval" })).toBe("Approval");
    expect(waitLabel({ kind: "sending" })).toBe("Sending");
    expect(waitLabel({ kind: "answer", until: null, overdue: false })).toBe(
      "The client's answer",
    );
    expect(
      waitLabel({ kind: "answer", until: "2026-12-04", overdue: false }),
    ).toBe("The client's answer, until Fri 4 Dec");
    expect(
      waitLabel({ kind: "answer", until: "2026-11-10", overdue: true }),
    ).toBe("The client's answer, due since Tue 10 Nov");
    expect(waitLabel({ kind: "nothing" })).toBe("Nothing");
  });

  it("names the next action of each wait", () => {
    expect(proposalNext({ kind: "writing" })?.what).toBe("Write the proposal");
    expect(proposalNext({ kind: "findings", count: 1 })?.what).toBe(
      "Fix 1 finding",
    );
    expect(proposalNext({ kind: "findings", count: 2 })?.what).toBe(
      "Fix 2 findings",
    );
    expect(proposalNext({ kind: "approval" })?.what).toBe(
      "Approve the proposal",
    );
    expect(proposalNext({ kind: "sending" })?.what).toBe("Send the proposal");
    expect(
      proposalNext({ kind: "answer", until: "2026-12-04", overdue: false })
        ?.what,
    ).toBe("Waiting for an answer until Fri 4 Dec");
    expect(
      proposalNext({ kind: "answer", until: null, overdue: false })?.what,
    ).toBe("Waiting for an answer");
    const late = proposalNext({
      kind: "answer",
      until: "2026-11-10",
      overdue: true,
    });
    expect(late?.what).toBe("Record the client's answer");
    expect(late?.why).toContain("Tue 10 Nov");
    expect(proposalNext({ kind: "nothing" })).toBeNull();
  });
});

describe("a blank proposal", () => {
  it("holds no package, deliverable, option, section or use case", () => {
    expect(isBlank(emptyProposal())).toBe(true);
    expect(isBlank(emptyProposal({ packages: [pkg("p1")] }))).toBe(false);
    expect(isBlank(clean())).toBe(false);
  });
});

describe("the rows of the Proposals place", () => {
  it("shows a draft with its lead, organisation, range and findings", () => {
    const [r] = rows([
      {
        id: "P1",
        state: clean({
          packages: [pkg("p1"), pkg("p2", 12000)],
          options: [option("o1", ["p1"]), option("o2", ["p1", "p2"])],
          paymentSteps: [],
          validUntil: "2026-12-04",
        }),
      },
    ]);
    expect(r).toMatchObject({
      id: "P1",
      title: "Pilot reporting",
      leadId: "L",
      leadName: "Brisa Labs: pilot",
      organisation: "Brisa Labs",
      status: "DRAFT",
      statusLabel: "Draft",
      tone: "gray",
      value: "€8,000.00 to €20,000.00",
      priced: true,
      valueNote: "draft",
      validUntil: "2026-12-04",
      validUntilLabel: "Fri 4 Dec",
      waitLabel: "2 findings to fix",
    });
    expect(r.wait).toEqual({ kind: "findings", count: 2 });
    expect(r.next?.what).toBe("Fix 2 findings");
  });

  it("waits on approval when a draft is clean, and on writing when it is blank", () => {
    const [a, b] = rows([
      { id: "P1", state: clean() },
      { id: "P2", state: emptyProposal({ leadId: "L" }) },
    ]);
    expect(a.wait).toEqual({ kind: "approval" });
    expect(a.value).toBe("€8,000.00");
    expect(b.wait).toEqual({ kind: "writing" });
    expect(b.title).toBe("Untitled proposal");
    expect(b.value).toBe("No price yet");
    expect(b.priced).toBe(false);
    expect(b.valueNote).toBeNull();
    expect(b.validUntilLabel).toBeNull();
  });

  it("runs the check against the lead's confidential items, the playbook and the decisions", () => {
    const state = clean({
      sections: [
        {
          id: "s1",
          kind: "CUSTOM",
          title: "Why us",
          body: "Delivery is guaranteed by March.",
          positioningId: null,
        },
      ] as unknown as ReturnType<typeof emptyProposal>["sections"],
    });
    const [r] = rows([{ id: "P1", state }], {
      playbook: {
        positioning: [],
        neverClaims: [
          { id: "n1", phrases: ["guaranteed"] },
        ] as unknown as NonNullable<
          Parameters<typeof proposalRows>[0]["playbook"]
        >["neverClaims"],
      },
    });
    expect(r.wait).toEqual({ kind: "findings", count: 1 });
  });

  it("shows the chosen option's total of an accepted proposal, counted", () => {
    const [r] = rows([
      proposalRec("P1", { status: "ACCEPTED", chosenOptionId: "o2" }),
    ]);
    expect(r.value).toBe("€4,000.00");
    expect(r.valueNote).toBeNull();
    expect(r.wait).toEqual({ kind: "nothing" });
    expect(r.next).toBeNull();
  });

  it("marks only a draft's or an approved proposal's value as a draft", () => {
    const by = Object.fromEntries(
      rows([
        proposalRec("a", { status: "APPROVED" }),
        proposalRec("s", { status: "SENT" }),
        proposalRec("d", { status: "DECLINED" }),
      ]).map((r) => [r.id, r.valueNote]),
    );
    expect(by).toEqual({ a: "draft", s: null, d: null });
  });

  it("leaves the lead and organisation empty when they are unknown", () => {
    const [a, b] = rows([
      proposalRec("P1", { leadId: null, currency: null }),
      proposalRec("P2", { leadId: "gone" }),
    ]);
    expect(a.leadId).toBeNull();
    expect(a.leadName).toBeNull();
    expect(a.organisation).toBeNull();
    expect(a.value).toBe("1,000.00 to 4,000.00");
    expect(b.leadName).toBeNull();
    const [c] = rows([proposalRec("P3")], {
      leads: [{ id: "L", state: lead({ name: "", organisationId: null }) }],
    });
    expect(c.leadName).toBe("Untitled lead");
    expect(c.organisation).toBeNull();
  });

  it("puts what waits on us first, then on the client by date, then the rest", () => {
    const order = rows([
      proposalRec("done", { status: "ACCEPTED", chosenOptionId: "o1" }),
      proposalRec("later", { validUntil: "2026-12-20" }),
      proposalRec("open-ended"),
      proposalRec("sooner", { validUntil: "2026-12-01" }),
      proposalRec("late", { validUntil: "2026-11-01" }),
      proposalRec("ours", { status: "APPROVED" }),
    ]).map((r) => r.id);
    expect(order).toEqual([
      "late",
      "ours",
      "sooner",
      "later",
      "open-ended",
      "done",
    ]);
  });

  it("sums who the open proposals wait on", () => {
    const all = rows([
      proposalRec("a", { status: "APPROVED" }),
      proposalRec("s", { validUntil: "2026-12-01" }),
      proposalRec("late", { validUntil: "2026-11-01" }),
      proposalRec("x", { status: "WITHDRAWN" }),
    ]);
    expect(waitSummary(all)).toEqual({ us: 2, client: 1 });
  });
});

describe("the sidebar count", () => {
  it("counts proposals not yet answered, withdrawn or superseded", () => {
    expect(
      openProposalCount([
        "DRAFT",
        "APPROVED",
        "SENT",
        "ACCEPTED",
        "DECLINED",
        "WITHDRAWN",
        "SUPERSEDED",
      ]),
    ).toBe(3);
    expect(openProposalCount([])).toBe(0);
  });
});

describe("the lead's next action while it is at proposal", () => {
  const row = (id: string, wait: ProposalRow["wait"]): ProposalRow =>
    ({ id, wait, status: wait.kind === "nothing" ? "DECLINED" : "DRAFT" }) as ProposalRow;
  const next = (
    list: ProposalRow[],
    over: { status?: string; kind?: string | null } = {},
  ) =>
    leadProposalNext({
      status: over.status ?? "PROPOSAL",
      kind: over.kind === undefined ? "SALES" : over.kind,
      rows: list,
    });

  it("is nothing of its own before or after the proposal status, or on an investor lead", () => {
    const one = [row("p", { kind: "approval" })];
    expect(next(one, { status: "MET" })).toBeNull();
    expect(next(one, { status: "WON" })).toBeNull();
    expect(next(one, { kind: "INVESTOR" })).toBeNull();
  });

  it("starts a proposal when the lead has none", () => {
    expect(next([])).toEqual({
      what: "Write the proposal",
      why: "This lead is at proposal and has none yet",
      button: "Start a proposal",
      proposalId: null,
    });
  });

  it("starts a new one when none is open", () => {
    const n = next([row("p", { kind: "nothing" })]);
    expect(n?.proposalId).toBeNull();
    expect(n?.why).toBe("No proposal on this lead is open");
  });

  it("leaves the lead's own next action when a proposal was accepted", () => {
    const accepted = { ...row("p", { kind: "nothing" }), status: "ACCEPTED" };
    expect(next([accepted as ProposalRow])).toBeNull();
  });

  it("names the open proposal's action and opens it", () => {
    expect(next([row("p", { kind: "findings", count: 2 })])).toEqual({
      what: "Fix 2 findings",
      why: "Approval opens when nothing is left to fix",
      button: "Open the proposal",
      proposalId: "p",
    });
    expect(next([row("p", { kind: "writing" })])?.what).toBe(
      "Write the proposal",
    );
    expect(
      next([row("p", { kind: "answer", until: "2026-12-04", overdue: false })])
        ?.what,
    ).toBe("Waiting for an answer until Fri 4 Dec");
  });

  it("prefers what the team can do now over waiting", () => {
    const n = next([
      row("sent", { kind: "answer", until: null, overdue: false }),
      row("draft", { kind: "findings", count: 1 }),
      row("approved", { kind: "sending" }),
      row("ready", { kind: "approval" }),
    ]);
    expect(n?.proposalId).toBe("approved");
    expect(n?.what).toBe("Send the proposal");
  });
});

describe("the proposal badge of a lead", () => {
  it("is absent for a lead without a proposal", () => {
    expect(proposalBadges([])).toEqual({});
    expect(proposalBadges([proposalRec("P", { leadId: null })])).toEqual({});
  });

  it("shows a draft's value marked as a draft", () => {
    const b = proposalBadges([proposalRec("P", { status: "DRAFT" })]).L;
    expect(b).toEqual({
      status: "DRAFT",
      label: "Draft",
      tone: "gray",
      draftValue: "€1k to €4k",
      more: 0,
    });
  });

  it("shows no value of its own once sent or accepted: the lead's value has it", () => {
    expect(proposalBadges([proposalRec("P")]).L?.draftValue).toBeNull();
    expect(
      proposalBadges([
        proposalRec("P", { status: "ACCEPTED", chosenOptionId: "o1" }),
      ]).L?.draftValue,
    ).toBeNull();
  });

  it("shows no value for a draft without a price or a currency", () => {
    expect(
      proposalBadges([proposalRec("P", { status: "DRAFT", options: [] })]).L?.draftValue,
    ).toBeNull();
    expect(
      proposalBadges([proposalRec("P", { status: "APPROVED", currency: null })])
        .L?.draftValue,
    ).toBe("1,000.00 to 4,000.00");
  });

  it("shows one amount when every option costs the same", () => {
    expect(
      proposalBadges([
        proposalRec("P", {
          status: "APPROVED",
          options: [
            { id: "o1", label: "Only", packageIds: ["p1"], adjustments: [] },
          ],
        } as unknown as Parameters<typeof proposalRec>[1]),
      ]).L?.draftValue,
    ).toBe("€1k");
  });

  it("leads with the furthest proposal and counts the others", () => {
    const b = proposalBadges([
      proposalRec("old", { status: "SUPERSEDED" }),
      proposalRec("draft", { status: "DRAFT" }),
      proposalRec("sent"),
      proposalRec("other", { leadId: "M", status: "DECLINED" }),
    ]);
    expect(b.L).toMatchObject({ status: "SENT", label: "Sent", more: 2 });
    expect(b.M).toMatchObject({ status: "DECLINED", tone: "red", more: 0 });
  });
});
