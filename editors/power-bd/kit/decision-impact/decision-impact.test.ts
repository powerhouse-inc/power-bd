import { describe, expect, it } from "vitest";
import { decisionImpact } from "./decision-impact.js";
import { lead, opportunity, proposal } from "./fixtures.js";

const D = "dec-1";
const ref = (documentId: string, kind = "DECISION") => ({
  id: "r",
  kind,
  documentId,
  title: "t",
});
const run = (i: Partial<Parameters<typeof decisionImpact>[0]>) =>
  decisionImpact({
    decisionId: D,
    leads: [],
    opportunities: [],
    proposals: [],
    ...i,
  });

describe("decision impact", () => {
  it("lists the conditions that wait on the decision", () => {
    const r = run({
      opportunities: [
        {
          id: "O1",
          state: opportunity({
            conditions: [
              { id: "c1", text: "Need entity", decisionIds: [D] },
              { id: "c2", text: "Other", decisionIds: ["x"] },
            ] as never,
          }),
        },
      ],
    });
    expect(r.conditions).toEqual([
      {
        id: "O1",
        name: "Fund X",
        closed: false,
        conditionId: "c1",
        text: "Need entity",
      },
    ]);
    expect(r.blocked).toEqual([]);
  });

  it("lists opportunities blocked on the decision", () => {
    const r = run({
      opportunities: [
        {
          id: "O1",
          state: opportunity({ blocked: { decisionId: D, text: "w" } }),
        },
        {
          id: "O2",
          state: opportunity({ blocked: { decisionId: "x", text: "w" } }),
        },
      ],
    });
    expect(r.blocked).toEqual([{ id: "O1", name: "Fund X", closed: false }]);
  });

  it("lists leads, opportunities and proposals that reference the decision", () => {
    const r = run({
      leads: [
        { id: "L1", state: lead({ references: [ref(D)] as never }) },
        { id: "L2", state: lead({ references: [ref("x")] as never }) },
        { id: "L3", state: lead({ references: [ref(D, "NOTE")] as never }) },
      ],
      opportunities: [
        { id: "O1", state: opportunity({ references: [ref(D)] as never }) },
      ],
      proposals: [
        { id: "P1", state: proposal({ references: [ref(D)] as never }) },
        { id: "P2", state: proposal({ references: [ref("x")] as never }) },
      ],
    });
    expect(r.leads).toEqual([{ id: "L1", name: "Acme Corp", closed: false }]);
    expect(r.opportunities).toEqual([
      { id: "O1", name: "Fund X", closed: false },
    ]);
    expect(r.proposals).toEqual([{ id: "P1", name: "Scope A", closed: false }]);
  });

  it("marks closed records as closed", () => {
    const r = run({
      leads: [
        {
          id: "L1",
          state: lead({ status: "LOST", references: [ref(D)] as never }),
        },
      ],
      opportunities: [
        {
          id: "O1",
          state: opportunity({
            status: "NO_GO",
            blocked: { decisionId: D, text: "w" },
          }),
        },
      ],
      proposals: [
        {
          id: "P1",
          state: proposal({
            status: "DECLINED",
            references: [ref(D)] as never,
          }),
        },
      ],
    });
    expect([
      r.leads[0].closed,
      r.blocked[0].closed,
      r.proposals[0].closed,
    ]).toEqual([true, true, true]);
  });

  it("is empty when nothing points at the decision", () => {
    expect(run({})).toEqual({
      conditions: [],
      blocked: [],
      leads: [],
      opportunities: [],
      proposals: [],
    });
  });

  it("shows an empty name for a record that has none", () => {
    const r = run({
      leads: [
        {
          id: "L1",
          state: lead({ name: null, references: [ref(D)] as never }),
        },
      ],
      opportunities: [
        {
          id: "O1",
          state: opportunity({
            name: null,
            blocked: { decisionId: D, text: "w" },
          }),
        },
      ],
      proposals: [
        {
          id: "P1",
          state: proposal({ title: null, references: [ref(D)] as never }),
        },
      ],
    });
    expect([r.leads[0].name, r.blocked[0].name, r.proposals[0].name]).toEqual([
      "",
      "",
      "",
    ]);
  });
});
