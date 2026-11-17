import { describe, expect, it } from "vitest";
import { link, lead, NOW, opportunity, proposal } from "./fixtures.js";
import { peopleDue } from "./retention.js";

const run = (i: Partial<Parameters<typeof peopleDue>[0]>) =>
  peopleDue({
    now: NOW,
    retentionMonths: 12,
    leads: [],
    opportunities: [],
    proposals: [],
    ...i,
  });
const ids = (i: Partial<Parameters<typeof peopleDue>[0]>) =>
  run(i).map((p) => `${p.contactId}/${p.personId}`);
const lost = (closedAt: string | null, links = [link("c1", "p1")]) => ({
  status: "LOST" as const,
  closedAt,
  contactLinks: links,
});
const OLD = "2025-11-15T09:00:00.000Z"; // 12 months and a day before NOW
const RECENT = "2025-11-17T09:00:00.000Z"; // just under 12 months

describe("retention", () => {
  it("a person on a lost lead past the period is due", () => {
    const r = run({ leads: [{ id: "L1", state: lead(lost(OLD)) }] });
    expect(r).toEqual([
      {
        contactId: "c1",
        personId: "p1",
        relationships: [{ kind: "lead", id: "L1", closedAt: OLD }],
        dueSince: "2026-11-15T09:00:00.000Z",
        proposals: [],
      },
    ]);
  });

  it("is not due within the period or when the close time is unknown", () => {
    expect(ids({ leads: [{ id: "L1", state: lead(lost(RECENT)) }] })).toEqual(
      [],
    );
    expect(ids({ leads: [{ id: "L1", state: lead(lost(null)) }] })).toEqual([]);
  });

  it("the same person also on an open lead is not due", () => {
    expect(
      ids({
        leads: [
          { id: "L1", state: lead(lost(OLD)) },
          {
            id: "L2",
            state: lead({
              status: "IN_TOUCH",
              contactLinks: [link("c1", "p1")],
            }),
          },
        ],
      }),
    ).toEqual([]);
  });

  it("a person on a won lead or an awarded opportunity is never due", () => {
    expect(
      ids({
        leads: [
          { id: "L1", state: lead(lost(OLD)) },
          {
            id: "L2",
            state: lead({
              status: "WON",
              closedAt: "2020-01-01T00:00:00.000Z",
              contactLinks: [link("c1", "p1")],
            }),
          },
        ],
      }),
    ).toEqual([]);
    expect(
      ids({
        leads: [{ id: "L1", state: lead(lost(OLD)) }],
        opportunities: [
          {
            id: "O1",
            state: opportunity({
              status: "AWARDED",
              closedAt: "2020-01-01T00:00:00.000Z",
              contactLinks: [link("c1", "p1")] as never,
            }),
          },
        ],
      }),
    ).toEqual([]);
  });

  it("an opportunity closed as no-go, rejected or withdrawn counts, and the last close decides", () => {
    const o = (status: string, closedAt: string, p = "p1") => ({
      id: `O-${status}`,
      state: opportunity({
        status: status as never,
        closedAt,
        contactLinks: [link("c1", p)] as never,
      }),
    });
    expect(
      ids({
        opportunities: [
          o("NO_GO", "2024-01-01T00:00:00.000Z"),
          o("REJECTED", "2025-01-01T00:00:00.000Z"),
          o("WITHDRAWN", "2025-02-01T00:00:00.000Z", "p2"),
        ],
      }),
    ).toEqual(["c1/p1", "c1/p2"]);
    expect(
      ids({
        opportunities: [
          o("NO_GO", "2024-01-01T00:00:00.000Z"),
          o("REJECTED", RECENT),
        ],
      }),
    ).toEqual([]);
  });

  it("finds people through interactions and message recipients, not whole-organisation links", () => {
    const state = lead({
      status: "LOST",
      closedAt: OLD,
      contactLinks: [link("c1", null)],
      interactions: [
        { id: "i", people: [{ contactId: "c1", personId: "p2" }] },
      ] as never,
      messages: [
        { id: "m", recipient: { contactId: "c2", personId: "p3" } },
        { id: "m2", recipient: null },
      ] as never,
    });
    expect(ids({ leads: [{ id: "L1", state }] })).toEqual(["c1/p2", "c2/p3"]);
  });

  it("honours a different retention period", () => {
    expect(
      ids({
        retentionMonths: 24,
        leads: [{ id: "L1", state: lead(lost(OLD)) }],
      }),
    ).toEqual([]);
  });

  it("names the proposals that hold a file for each person due", () => {
    const file = { ref: "r", name: "a.pdf", type: "application/pdf" };
    const r = run({
      leads: [{ id: "L1", state: lead(lost(OLD)) }],
      proposals: [
        {
          id: "P1",
          state: proposal({
            title: "Scope A",
            recipient: { contactId: "c1", personId: "p1" },
            sentCopy: file,
            signedCopy: file,
          } as never),
        },
        {
          id: "P2",
          state: proposal({
            title: "Scope B",
            leadId: "L1",
            figures: [{ id: "f", file }] as never,
          }),
        },
        { id: "P3", state: proposal({ leadId: "L1" }) },
        {
          id: "P4",
          state: proposal({
            recipient: { contactId: "c1", personId: "p9" },
            sentCopy: file,
          } as never),
        },
      ],
    });
    expect(r[0].proposals).toEqual([
      { id: "P1", title: "Scope A", files: ["SENT_COPY", "SIGNED_COPY"] },
      { id: "P2", title: "Scope B", files: ["FIGURE"] },
    ]);
  });

  it("lists a person once across two lost leads and gives an unnamed proposal an empty title", () => {
    const file = { ref: "r", name: "a.pdf", type: "application/pdf" };
    const r = run({
      leads: [
        { id: "L1", state: lead(lost(OLD)) },
        { id: "L2", state: lead(lost(OLD)) },
        {
          id: "L3",
          state: lead({
            ...lost(OLD),
            interactions: [
              { id: "i", people: [{ contactId: "c1", personId: "p1" }] },
              { id: "j", people: [{ contactId: "c1", personId: "p1" }] },
            ] as never,
          }),
        },
      ],
      proposals: [
        {
          id: "P1",
          state: proposal({
            title: null,
            leadId: "L2",
            signedCopy: file,
          } as never),
        },
      ],
    });
    expect(r.length).toBe(1);
    expect(r[0].relationships.map((x) => x.id)).toEqual(["L1", "L2", "L3"]);
    expect(r[0].proposals).toEqual([
      { id: "P1", title: "", files: ["SIGNED_COPY"] },
    ]);
  });

  it("treats a proposal's recipient as a person on that proposal's lead", () => {
    const recipient = { contactId: "c7", personId: "p7" };
    const proposals = (leadId: string) => [
      { id: "P1", state: proposal({ leadId, recipient }) },
    ];
    // Lost lead past the period: the recipient is due though on no contact link.
    expect(
      ids({
        leads: [{ id: "L1", state: lead(lost(OLD, [])) }],
        proposals: proposals("L1"),
      }),
    ).toEqual(["c7/p7"]);
    // Lead closed too recently: not due.
    expect(
      ids({
        leads: [{ id: "L1", state: lead(lost(RECENT, [])) }],
        proposals: proposals("L1"),
      }),
    ).toEqual([]);
    // Lead won: never due.
    expect(
      ids({
        leads: [
          { id: "L1", state: lead({ status: "WON", closedAt: OLD } as never) },
        ],
        proposals: proposals("L1"),
      }),
    ).toEqual([]);
  });
});
