import type { SearchInput } from "./types.js";

export const MARA = "0x00000000000000000000000000000000000000a1";
export const TOM = "0x00000000000000000000000000000000000000b2";

/** An invented space: one of each kind, and one confidential item on the lead. */
export const space = (over: Partial<SearchInput> = {}): SearchInput => ({
  members: [
    { id: "m1", address: MARA, name: "Mara Lind", active: true },
    { id: "m2", address: TOM, name: "Tom Okafor", active: true },
  ],
  changed: {
    "lead-1": "2026-11-16T09:00:00.000Z",
    "lead-2": "2026-11-10T09:00:00.000Z",
    "opp-1": "2026-11-15T09:00:00.000Z",
    "org-1": "2026-11-01T09:00:00.000Z",
    "org-2": "2026-11-02T09:00:00.000Z",
    "prop-1": "2026-11-17T09:00:00.000Z",
    "dec-1": "2026-11-12T09:00:00.000Z",
    "list-1": "2026-11-17T10:00:00.000Z",
    "book-1": "2026-11-17T11:00:00.000Z",
  },
  leads: [
    {
      id: "lead-1",
      state: {
        name: "Pilot with Brisa Labs",
        kind: "SALES",
        status: "IN_TOUCH",
        statusReason: null,
        owner: MARA,
        organisationId: "org-1",
        nextSteps: [
          { id: "n1", text: "Send the pilot outline", doneAt: null },
          {
            id: "n2",
            text: "Book the kick-off room",
            doneAt: "2026-11-01T09:00:00.000Z",
          },
        ],
        contactLinks: [
          { contactId: "org-1", personId: "p1" },
          { contactId: "org-1", personId: null },
          { contactId: "org-9", personId: "p9" },
        ],
        interactions: [
          { summary: "Intro call about the tide sensors" },
          { summary: null },
        ],
      },
    },
    {
      id: "lead-2",
      state: {
        name: null,
        kind: null,
        status: "WON",
        statusReason: "Signed after the workshop",
        owner: null,
        organisationId: null,
        nextSteps: [],
        contactLinks: [],
        interactions: [],
      },
    },
  ],
  opportunities: [
    {
      id: "opp-1",
      state: {
        name: "Harbour Innovation Fund, round 3",
        status: "PREPARING",
        statusReason: null,
        owner: TOM,
        funderId: "org-2",
        instrument: "GRANT",
        roundLabel: "Autumn window",
        programme: { title: "Blue economy programme" },
        whereToApply: "portal.harbour.example",
        nextSteps: [{ id: "n1", text: "Draft the budget", doneAt: null }],
        partners: [{ organisationId: "org-1", role: "Pilot site" }],
      },
    },
    {
      id: "opp-2",
      state: {
        name: "",
        status: "WATCHING",
        statusReason: null,
        owner: null,
        funderId: null,
        instrument: null,
        roundLabel: null,
        programme: null,
        whereToApply: null,
        nextSteps: [],
        partners: [{ organisationId: "org-9", role: null }],
      },
    },
  ],
  contacts: [
    {
      id: "org-1",
      state: {
        name: "Brisa Labs",
        status: "ACTIVE",
        website: "brisa.example",
        email: "hello@brisa.example",
        notes: "Met at the Lisbon harbour fair",
        tags: ["sensors", "ports"],
        people: [
          {
            id: "p1",
            name: "Inês Caldeira",
            role: "Head of operations",
            email: "ines@brisa.example",
          },
          { id: "p2", name: "Rui Fontes", role: null, email: null },
        ],
      },
    },
    {
      id: "org-2",
      state: {
        name: "Harbour Foundation",
        status: "ARCHIVED",
        website: null,
        email: null,
        notes: null,
        tags: [],
        people: [],
      },
    },
    {
      id: "org-3",
      state: {
        name: null,
        status: "ACTIVE",
        website: null,
        email: null,
        notes: null,
        tags: [],
        people: [],
      },
    },
  ],
  investorLists: [
    {
      id: "list-1",
      state: {
        rows: [
          {
            id: "r1",
            name: "Tallgrass Ventures",
            state: "SHORTLISTED",
            website: "tallgrass.example",
            sourceList: "Climate seed funds 2026",
            exclusionReason: null,
            organisationId: null,
          },
          {
            id: "r2",
            name: "Brisa Capital",
            state: "EXCLUDED",
            website: null,
            sourceList: null,
            exclusionReason: "Only invests after series B",
            organisationId: "org-1",
          },
        ],
      },
    },
  ],
  proposals: [
    {
      id: "prop-1",
      state: {
        title: "Tide sensor pilot",
        code: "BRI-26-01",
        status: "SENT",
        reason: null,
        leadId: "lead-1",
        recipient: { contactId: "org-1", personId: "p2" },
      },
    },
    {
      id: "prop-2",
      state: {
        title: null,
        code: null,
        status: "DRAFT",
        reason: null,
        leadId: "lead-2",
        recipient: null,
      },
    },
    {
      id: "prop-3",
      state: {
        title: "Loose offer",
        code: null,
        status: "WITHDRAWN",
        reason: "Budget froze",
        leadId: null,
        recipient: { contactId: "org-2", personId: null },
      },
    },
  ],
  decisions: [
    {
      id: "dec-1",
      state: {
        question: "Which entity applies to EU calls?",
        status: "OPEN",
        owner: MARA,
        context: "EU calls need an EU-registered applicant",
        answer: null,
        reason: null,
      },
    },
    {
      id: "dec-2",
      state: {
        question: null,
        status: "ANSWERED",
        owner: null,
        context: null,
        answer: "Use the Lisbon entity",
        reason: "Lowest co-funding",
      },
    },
  ],
  playbooks: [
    {
      id: "book-1",
      state: {
        positioning: [
          {
            id: "po1",
            title: "Sensors for small ports",
            text: "We instrument quays without downtime",
            status: "APPROVED",
          },
        ],
        proofCases: [
          {
            id: "pc1",
            title: "Quay 4 retrofit",
            summary: "Cut manual readings by half",
          },
          { id: "pc2", title: "Lagoon study", summary: null },
        ],
        neverClaims: [
          {
            id: "nc1",
            claim: "Certified for offshore use",
            phrases: ["offshore certified", "ATEX rated"],
            reason: "No certificate yet",
          },
          { id: "nc2", claim: "Zero maintenance", phrases: [], reason: null },
        ],
      },
    },
  ],
  ...over,
});

/**
 * The same space with what a lead and an opportunity keep confidential, as the
 * documents carry it. The index must never read it.
 */
export const spaceWithConfidential = (): SearchInput => {
  const base = space();
  const item = (text: string) => ({
    id: "x",
    text,
    addedAt: "2026-11-01T09:00:00.000Z",
    addedBy: MARA,
    subjectContactId: null,
  });
  return {
    ...base,
    leads: base.leads.map((l) => ({
      ...l,
      state: {
        ...l.state,
        confidentialItems: [item("They fear a lock-in with Zephyrcorp")],
      },
    })),
    opportunities: base.opportunities.map((o) => ({
      ...o,
      state: {
        ...o.state,
        confidentialItems: [item("The jury chair is a Quillfeather alumnus")],
      },
    })),
  };
};
