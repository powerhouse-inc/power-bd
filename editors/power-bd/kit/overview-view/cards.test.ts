import { describe, expect, it } from "vitest";
import {
  input,
  lead,
  list,
  opportunity,
  proposalRec,
} from "../overview/fixtures.js";
import { cardDetails, cardKey } from "./cards.js";

const step = (
  id: string,
  text: string,
  dueDate: string | null,
  done = false,
) => ({
  id,
  text,
  dueDate,
  doneAt: done ? "2026-11-10T00:00:00.000Z" : null,
  owner: null,
});

const records = input({
  leads: [
    {
      id: "l1",
      state: lead({
        name: "Harbour Studio: pilot",
        kind: "SALES",
        organisationId: "c1",
        nextSteps: [
          step("a", "Send the deck", null),
          step("b", "Call back", "2026-11-25"),
          step("c", "Book a room", "2026-11-20T00:00:00.000Z"),
          step("d", "Old thing", "2026-11-01", true),
        ],
      }),
    },
    {
      id: "l2",
      state: lead({ name: "Quill & Co", organisationId: "c2", nextSteps: [] }),
    },
    {
      id: "l3",
      state: lead({
        name: "Lantern Works",
        kind: "INVESTOR",
        organisationId: "gone",
        nextSteps: [step("a", "Write", null), step("b", "Wait", null)],
      }),
    },
  ],
  proposals: [
    proposalRec("p1", { leadId: "l2", status: "DRAFT" }),
    proposalRec("p2", { leadId: "l1", status: "SENT" }),
  ],
  opportunities: [
    {
      id: "o1",
      state: opportunity({
        name: "Open tools grant",
        funderId: "c3",
        amount: 180000,
        currency: "EUR",
      }),
    },
    { id: "o2", state: opportunity({ name: "No amount yet", amount: 5 }) },
  ],
  investorLists: [
    {
      id: "il",
      state: list([
        {
          id: "r1",
          name: "Tidewater Fund",
          state: "SHORTLISTED",
          organisationId: "c3",
        },
        { id: "r2", name: "Mossgate", state: "SHORTLISTED" },
        { id: "r3", name: "Not shown", state: "LISTED" },
      ]),
    },
  ],
});

const cards = cardDetails(records, {
  organisations: {
    c1: "Harbour Studio",
    c2: " quill & co ",
    c3: "Tidewater Trust",
  },
  changed: { l1: "2026-11-15T08:00:00.000Z", il: "2026-11-12T08:00:00.000Z" },
  leadValues: { l1: [{ currency: "EUR", amount: 8000, upper: 20000 }] },
});
const card = (
  kind: "lead" | "opportunity" | "investor-row",
  id: string,
  rowId?: string,
) => cards.get(cardKey({ kind, id, rowId }))!;

describe("cardKey", () => {
  it("tells the rows of one investor list apart", () => {
    expect(cardKey({ kind: "investor-row", id: "il", rowId: "r1" })).toBe(
      "investor-row:il:r1",
    );
    expect(cardKey({ kind: "lead", id: "l1" })).toBe("lead:l1");
  });
});

describe("cardDetails", () => {
  it("marks a lead by its type, and a lead without one as a lead", () => {
    expect(card("lead", "l1").mark).toBe("SALES");
    expect(card("lead", "l3").mark).toBe("INVESTOR");
    expect(card("lead", "l2").mark).toBe("LEAD");
  });

  it("marks funding and shortlisted investors", () => {
    expect(card("opportunity", "o1").mark).toBe("FUNDING");
    expect(card("investor-row", "il", "r1").mark).toBe("SHORTLISTED");
    expect(cards.has("investor-row:il:r3")).toBe(false);
  });

  it("names the organisation: a lead's, an opportunity's funder, an investor's", () => {
    expect(card("lead", "l1").organisation).toBe("Harbour Studio");
    expect(card("opportunity", "o1").organisation).toBe("Tidewater Trust");
    expect(card("investor-row", "il", "r1").organisation).toBe(
      "Tidewater Trust",
    );
  });

  it("leaves the organisation out when it is unknown, not set, or only repeats the name", () => {
    expect(card("lead", "l3").organisation).toBeNull();
    expect(card("opportunity", "o2").organisation).toBeNull();
    expect(card("investor-row", "il", "r2").organisation).toBeNull();
    expect(card("lead", "l2").organisation).toBeNull();
  });

  it("picks the open next step that is due first", () => {
    expect(card("lead", "l1").nextStep).toEqual({
      text: "Book a room",
      day: "2026-11-20",
    });
  });

  it("falls back to the first open step when none has a date, and to none", () => {
    expect(card("lead", "l3").nextStep).toEqual({ text: "Write", day: null });
    expect(card("lead", "l2").nextStep).toBeNull();
    expect(card("investor-row", "il", "r1").nextStep).toBeNull();
  });

  it("takes a lead's value from its live proposals and an opportunity's from its amount, in its own currency", () => {
    expect(card("lead", "l1").value).toEqual([
      { currency: "EUR", amount: 8000, upper: 20000 },
    ]);
    expect(card("lead", "l2").value).toEqual([]);
    expect(card("opportunity", "o1").value).toEqual([
      { currency: "EUR", amount: 180000 },
    ]);
    expect(card("opportunity", "o2").value).toEqual([]);
    expect(card("investor-row", "il", "r1").value).toEqual([]);
  });

  it("badges a lead that has a proposal; a draft's value stays out of the lead's value", () => {
    expect(card("lead", "l2").proposal).toEqual({
      status: "DRAFT",
      label: "Draft",
      tone: "gray",
      draftValue: "€1k to €4k",
      more: 0,
    });
    expect(card("lead", "l2").value).toEqual([]);
    expect(card("lead", "l1").proposal).toMatchObject({
      status: "SENT",
      draftValue: null,
    });
    expect(card("lead", "l3").proposal).toBeNull();
    expect(card("opportunity", "o1").proposal).toBeNull();
    expect(card("investor-row", "il", "r1").proposal).toBeNull();
  });

  it("says when each last changed; an investor row takes its list's", () => {
    expect(card("lead", "l1").changedAt).toBe("2026-11-15T08:00:00.000Z");
    expect(card("lead", "l2").changedAt).toBeNull();
    expect(card("investor-row", "il", "r2").changedAt).toBe(
      "2026-11-12T08:00:00.000Z",
    );
  });
});
