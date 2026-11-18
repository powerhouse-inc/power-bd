import { describe, expect, it } from "vitest";
import { lead, opportunity, proposal } from "./fixtures.js";
import { organisationView } from "./organisation.js";

const C = "contact-1";
const base = { leads: [], opportunities: [], investorLists: [], proposals: [] };
const view = (i: Partial<Parameters<typeof organisationView>[0]>) =>
  organisationView({ contactId: C, ...base, ...i });
const person = { contactId: C, personId: "p1" };

describe("organisation view", () => {
  it("gathers a lead by its organisation", () => {
    const r = view({
      leads: [
        { id: "L1", state: lead({ organisationId: C }) },
        { id: "L2", state: lead({ organisationId: "other" }) },
      ],
    });
    expect(r.leads).toEqual([
      { id: "L1", name: "Acme Corp", via: ["ORGANISATION"] },
    ]);
  });

  it("gathers a lead by a contact link, an interaction person and a message recipient", () => {
    const r = view({
      leads: [
        {
          id: "L1",
          state: lead({
            contactLinks: [
              { id: "k", contactId: C, personId: null, role: null, dealRole: null },
            ],
          }),
        },
        {
          id: "L2",
          state: lead({
            interactions: [{ id: "i", people: [person] }] as never,
          }),
        },
        {
          id: "L3",
          state: lead({
            messages: [{ id: "m", recipient: person }] as never,
          }),
        },
      ],
    });
    expect(r.leads.map((l) => [l.id, l.via])).toEqual([
      ["L1", ["CONTACT_LINK"]],
      ["L2", ["INTERACTION"]],
      ["L3", ["MESSAGE"]],
    ]);
  });

  it("lists every way a record names the contact once each", () => {
    const r = view({
      leads: [
        {
          id: "L1",
          state: lead({
            organisationId: C,
            contactLinks: [
              { id: "k", contactId: C, personId: "p1", role: null, dealRole: null },
              { id: "k2", contactId: C, personId: "p2", role: null, dealRole: null },
            ],
          }),
        },
      ],
    });
    expect(r.leads[0].via).toEqual(["ORGANISATION", "CONTACT_LINK"]);
  });

  it("gathers an opportunity as funder, coordinator, partner, link and interaction", () => {
    const r = view({
      opportunities: [
        { id: "O1", state: opportunity({ funderId: C }) },
        { id: "O2", state: opportunity({ coordinatorId: C }) },
        {
          id: "O3",
          state: opportunity({
            partners: [{ id: "x", organisationId: C }] as never,
          }),
        },
        {
          id: "O4",
          state: opportunity({
            contactLinks: [
              { id: "k", contactId: C, personId: null, role: null },
            ],
            interactions: [{ id: "i", people: [person] }] as never,
          }),
        },
        { id: "O5", state: opportunity({ funderId: "other" }) },
      ],
    });
    expect(r.opportunities.map((o) => [o.id, o.via])).toEqual([
      ["O1", ["FUNDER"]],
      ["O2", ["COORDINATOR"]],
      ["O3", ["PARTNER"]],
      ["O4", ["CONTACT_LINK", "INTERACTION"]],
    ]);
  });

  it("gathers investor rows that name the contact", () => {
    const r = view({
      investorLists: [
        {
          id: "IL",
          state: {
            rows: [
              { id: "r1", name: "Fund A", state: "ENGAGED", organisationId: C },
              {
                id: "r2",
                name: "Fund B",
                state: "LISTED",
                organisationId: null,
              },
            ],
          } as never,
        },
      ],
    });
    expect(r.investorRows).toEqual([
      { listId: "IL", rowId: "r1", name: "Fund A", state: "ENGAGED" },
    ]);
  });

  it("gathers proposals by recipient and through a gathered lead", () => {
    const r = view({
      leads: [{ id: "L1", state: lead({ organisationId: C }) }],
      proposals: [
        {
          id: "P1",
          state: proposal({ recipient: { contactId: C, personId: null } }),
        },
        { id: "P2", state: proposal({ leadId: "L1", title: "Scope B" }) },
        { id: "P3", state: proposal({ leadId: "L9" }) },
      ],
    });
    expect(r.proposals).toEqual([
      { id: "P1", name: "Scope A", via: ["RECIPIENT"] },
      { id: "P2", name: "Scope B", via: ["LEAD"] },
    ]);
  });

  it("gathers research from all gathered records, once each, and no record links", () => {
    const ref = (id: string, kind: string, documentId: string) => ({
      id,
      kind,
      documentId,
      title: `T-${documentId}`,
    });
    const r = view({
      leads: [
        {
          id: "L1",
          state: lead({
            organisationId: C,
            references: [
              ref("a", "RESEARCH", "doc-1"),
              ref("b", "DECISION", "dec-1"),
            ] as never,
          }),
        },
      ],
      opportunities: [
        {
          id: "O1",
          state: opportunity({
            funderId: C,
            references: [
              ref("c", "RESEARCH", "doc-1"),
              ref("d", "SOURCE", "doc-2"),
            ] as never,
          }),
        },
      ],
      proposals: [
        {
          id: "P1",
          state: proposal({
            leadId: "L1",
            references: [ref("e", "NOTE", "doc-3")] as never,
          }),
        },
      ],
    });
    expect(r.research).toEqual([
      { documentId: "doc-1", title: "T-doc-1", kind: "RESEARCH" },
      { documentId: "doc-2", title: "T-doc-2", kind: "SOURCE" },
      { documentId: "doc-3", title: "T-doc-3", kind: "NOTE" },
    ]);
  });

  it("is empty when nothing names the contact", () => {
    expect(view({})).toEqual({
      leads: [],
      opportunities: [],
      investorRows: [],
      proposals: [],
      research: [],
    });
  });
});
