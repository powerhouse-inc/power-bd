import { describe, expect, it } from "vitest";
import { renderProposal, type RenderNames } from "./proposal-render.js";
import { emptyProposal } from "../proposal-totals/fixtures.js";

const names: RenderNames = {
  clientName: "Northwind Ltd",
  recipientName: "Ada Example",
  contractingEntityTitle: "Acme Contracting BV",
};

const prose = (id: string, title: string | null, body: string | null) => ({
  id,
  kind: "PROSE" as const,
  title,
  body,
  positioningId: null,
});

describe("renderProposal header, prose and table of contents", () => {
  const state = emptyProposal({
    title: "Briefing Platform",
    sections: [
      prose("s1", "About us", "We build things."),
      prose("s2", "Summary", "A short summary."),
    ],
  });
  const md = renderProposal(state, names);

  it("starts with the title, code and parties", () => {
    expect(md.startsWith("# Briefing Platform\n")).toBe(true);
    expect(md).toContain("Code: BRI");
    expect(md).toContain("Prepared for: Northwind Ltd, attention Ada Example");
    expect(md).toContain("Contracting entity: Acme Contracting BV");
  });

  it("lists the table of contents in section order", () => {
    expect(md).toContain("## Contents\n\n1. About us\n2. Summary\n");
  });

  it("renders a prose section as its title and body, in order", () => {
    expect(md).toContain("## About us\n\nWe build things.\n\n## Summary");
    expect(md.indexOf("## About us")).toBeLessThan(md.indexOf("## Summary"));
  });

  it("falls back to the code for a missing title and omits a missing body", () => {
    const m = renderProposal(
      emptyProposal({ title: null, sections: [prose("s", null, null)] }),
      names,
    );
    expect(m.startsWith("# BRI\n")).toBe(true);
    expect(m).toContain("## Section 1\n");
  });
});

import { deliverable, workedExample } from "../proposal-totals/fixtures.js";
import type { ProposalState } from "document-models/proposal";

const sec = (
  id: string,
  kind: ProposalState["sections"][number]["kind"],
  title: string | null = null,
  body: string | null = null,
) => ({ id, kind, title, body, positioningId: null });

const named = (state: ProposalState): ProposalState => ({
  ...state,
  title: "Briefing Platform",
  validUntil: "2027-01-31",
  packages: state.packages.map((p, i) => ({
    ...p,
    code: `PK${i + 1}`,
    name: ["Core", "Reports", "Insights"][i],
    summary: i === 0 ? "The base platform." : null,
    targetDate: i === 0 ? "2027-03-01" : null,
  })),
});

const full = (): ProposalState => ({
  ...named(workedExample()),
  sections: [
    sec("sc", "SCOPE", "What you get", "Users and use cases."),
    sec("as", "ASSUMPTIONS"),
    sec("de", "DELIVERABLES"),
    sec("pr", "PRICING"),
    sec("sh", "SCHEDULE"),
    sec("ac", "ACCEPTANCE"),
    sec("te", "TERMS"),
    sec("an", "ANNEXES"),
  ],
});

const part = (md: string, heading: string) => {
  const start = md.indexOf(`## ${heading}\n`);
  const next = md.indexOf("\n## ", start + 1);
  return md.slice(start, next === -1 ? undefined : next);
};

describe("scope and figures", () => {
  const state: ProposalState = {
    ...full(),
    actors: [
      { id: "a1", code: "U1", name: "Analyst", description: "Reads reports." },
    ],
    useCases: [
      {
        id: "u1",
        code: "U1.1",
        actorId: "a1",
        packageId: "p1",
        title: "Open a briefing",
        body: "The analyst opens it.",
      },
    ],
    figures: [
      {
        id: "f1",
        anchorKind: "USE_CASE",
        anchorId: "u1",
        file: {
          ref: "attachment://v1:one",
          name: "one.png",
          type: "image/png",
        },
        caption: "Briefing screen",
      },
      {
        id: "f2",
        anchorKind: "SECTION",
        anchorId: "sc",
        file: {
          ref: "attachment://v1:two",
          name: "two.png",
          type: "image/png",
        },
        caption: null,
      },
    ],
  };
  const scope = part(renderProposal(state, names), "What you get");

  it("lists actors and an overview of use cases with actor and package", () => {
    expect(scope).toContain("- **U1 Analyst**: Reads reports.");
    expect(scope).toContain("| U1.1 | Open a briefing | Analyst | PK1 Core |");
  });

  it("puts a use case figure after the use case body", () => {
    expect(scope).toContain(
      "### U1.1 Open a briefing\n\nThe analyst opens it.\n\n![Briefing screen](attachment://v1:one)",
    );
  });

  it("puts a section figure after the section body, falling back to the file name", () => {
    expect(scope.indexOf("Users and use cases.")).toBeLessThan(
      scope.indexOf("![two.png](attachment://v1:two)"),
    );
  });
});

describe("deliverables and assumptions", () => {
  const state: ProposalState = {
    ...full(),
    boundaries: [
      {
        id: "b1",
        kind: "EXCLUSION",
        packageId: "p1",
        text: "No migration",
        value: null,
      },
      {
        id: "b2",
        kind: "ASSUMPTION",
        packageId: "p1",
        text: "Users",
        value: "40",
      },
      {
        id: "b3",
        kind: "GUARANTEE",
        packageId: null,
        text: "Uptime",
        value: "99%",
      },
    ],
  };
  const md = renderProposal(state, names);

  it("lists deliverables per package with boundaries", () => {
    const d = part(md, "Deliverables");
    expect(d).toContain("### PK1 Core\n\nThe base platform.");
    expect(d).toContain("- **D1** Title d1");
    expect(d).toContain("- Exclusion: No migration");
    expect(d).toContain("- Assumption: Users (40)");
    expect(d.indexOf("### PK1")).toBeLessThan(d.indexOf("### PK2"));
  });

  it("lists proposal-wide boundaries under assumptions", () => {
    expect(part(md, "Assumptions")).toContain("- Guarantee: Uptime (99%)");
  });

  it("keeps deliverable code and title identical in scope and price table", () => {
    expect(part(md, "Deliverables")).toContain("**D4** Title d4");
    expect(part(md, "Pricing")).toContain("| D4 | Title d4 | €2,500.00 |");
  });

  it("changes every heading when a package is renamed", () => {
    const renamed = renderProposal(
      {
        ...state,
        packages: state.packages.map((p) =>
          p.id === "p1" ? { ...p, code: "ZZ9", name: "Foundation" } : p,
        ),
      },
      names,
    );
    expect(renamed).toContain("### ZZ9 Foundation");
    expect(renamed).toContain("| ZZ9 | Foundation |");
    expect(renamed.includes("PK1")).toBe(false);
    expect(renamed.includes("Core")).toBe(false);
    expect(renamed).toContain("**Option oc**: ZZ9, PK2, PK3");
  });
});

describe("pricing", () => {
  const md = renderProposal(
    {
      ...full(),
      options: full().options.map((o) =>
        o.id === "oc"
          ? {
              ...o,
              adjustments: o.adjustments.map((a) => ({
                ...a,
                condition: "If all is committed at the start",
              })),
            }
          : o,
      ),
    },
    names,
  );
  const pricing = part(md, "Pricing");

  it("renders a price table per option with its total", () => {
    expect(pricing).toContain("### Option oa");
    expect(pricing).toContain("| PK1 | Core | |");
    expect(pricing).toContain("| D1 | Title d1 | €3,000.00 |");
    expect(pricing).toContain("| | **Total** | **€16,000.00** |");
    expect(pricing).toContain("| | **Total** | **€21,000.00** |");
    expect(pricing).toContain("| | **Total** | **€25,000.00** |");
  });

  it("shows a package priced as a whole and its deliverables as included", () => {
    expect(pricing).toContain("| PK2 | Reports | €5,000.00 |");
    expect(pricing).toContain("| D6 | Title d6 | Included |");
  });

  it("shows an adjustment with its condition", () => {
    expect(pricing).toContain(
      "| | Adjustment adj (If all is committed at the start) | -€3,000.00 |",
    );
  });

  it("shows payment amounts per option", () => {
    expect(pricing).toContain("| Step s1 | On signature | €6,250.00 |");
    expect(pricing).toContain("| Step s2 | On acceptance | €18,750.00 |");
  });

  it("formats an on-date step with its date", () => {
    const m = renderProposal(
      {
        ...full(),
        paymentSteps: [
          {
            id: "x",
            label: "Final",
            trigger: "ON_DATE",
            percentage: 100,
            date: "2027-06-30",
          },
        ],
      },
      names,
    );
    expect(m).toContain("| Final | On 2027-06-30 | €16,000.00 |");
  });

  it("lists recurring costs and rates", () => {
    const state = full();
    const m = renderProposal(
      {
        ...state,
        deliverables: [
          ...state.deliverables,
          deliverable("d7", "p1", {
            pricing: "RECURRING",
            amount: 200,
            period: "MONTH",
            until: "2027-12-31",
          }),
          deliverable("d8", "p1", {
            pricing: "RECURRING",
            amount: 100,
            upperAmount: 300,
            period: "QUARTER",
          }),
          deliverable("d9", "p1", {
            pricing: "RATE",
            amount: 150,
            unit: "HOUR",
          }),
          deliverable("d10", "p1", {
            pricing: "RATE",
            amount: 800,
            upperAmount: 900,
            unit: "DAY",
          }),
          { ...deliverable("d11", "p1", { pricing: "INCLUDED" }), price: null },
        ],
      },
      names,
    );
    const p = part(m, "Pricing");
    expect(p).toContain("#### Recurring costs");
    expect(p).toContain(
      "- PK1 D7 Title d7: €200.00 per month, until 2027-12-31",
    );
    expect(p).toContain("- PK1 D8 Title d8: €100.00 to €300.00 per quarter");
    expect(p).toContain("- PK1 D9 Title d9: €150.00 per hour");
    expect(p).toContain("- PK1 D10 Title d10: €800.00 to €900.00 per day");
    expect(p).toContain(
      "| D7 | Title d7 | €200.00 per month, until 2027-12-31 |",
    );
    expect(p).toContain("| D11 | Title d11 | — |");
  });

  it("formats amounts in the proposal's currency, and plainly without one", () => {
    const gbp = renderProposal({ ...full(), currency: "GBP" }, names);
    expect(gbp).toContain("| D1 | Title d1 | £3,000.00 |");
    const none = renderProposal({ ...full(), currency: null }, names);
    expect(none).toContain("| D1 | Title d1 | 3,000.00 |");
  });
});

describe("schedule, acceptance, terms and annexes", () => {
  const state: ProposalState = {
    ...full(),
    boundaries: [
      {
        id: "b1",
        kind: "CLIENT_INPUT",
        packageId: "p1",
        text: "Sample data",
        value: null,
      },
    ],
    clauses: [
      { id: "c1", kind: "LIABILITY", title: "Liability", body: "Capped." },
      { id: "c2", kind: "GOVERNING_LAW", title: "Governing law", body: null },
    ],
    annexes: [
      {
        id: "n1",
        kind: "DATA_PROCESSING",
        title: "Data processing",
        body: "Terms.",
        partOfAgreement: true,
      },
      {
        id: "n2",
        kind: "FORM",
        title: "Acceptance form",
        body: null,
        partOfAgreement: false,
      },
    ],
  };
  const md = renderProposal(state, names);

  it("lists target dates and client inputs in the schedule", () => {
    const s = part(md, "Schedule");
    expect(s).toContain("| PK1 Core | 2027-03-01 |");
    expect(s).toContain("- Sample data (PK1 Core)");
  });

  it("lists every option with its total and a tick box", () => {
    const a = part(md, "Acceptance");
    expect(a).toContain("- [ ] **Option oa**: PK1, total €16,000.00");
    expect(a).toContain("- [ ] **Option ob**: PK1, PK2, total €21,000.00");
    expect(a).toContain("- [ ] **Option oc**: PK1, PK2, PK3, total €25,000.00");
    expect(a).toContain("Valid until: 2027-01-31");
    expect(a).toContain("Signed for Northwind Ltd by Ada Example:");
    expect(a).toContain("Signed for Acme Contracting BV:");
  });

  it("omits valid-until when there is none", () => {
    expect(
      part(renderProposal({ ...state, validUntil: null }, names), "Acceptance"),
    ).not.toContain("Valid until");
  });

  it("numbers the clauses", () => {
    const t = part(md, "Terms");
    expect(t).toContain("### 1. Liability\n\nCapped.");
    expect(t).toContain("### 2. Governing law\n");
  });

  it("letters the annexes and flags those part of the agreement", () => {
    const a = part(md, "Annexes");
    expect(a).toContain(
      "### Annex A: Data processing\n\nPart of the agreement on signature.\n\nTerms.",
    );
    expect(a).toContain("### Annex B: Acceptance form");
    expect(a).not.toMatch(/Annex B[\s\S]*Part of the agreement/);
  });
});

describe("incomplete records", () => {
  it("renders a title-less, code-less proposal and dangling references without failing", () => {
    const md = renderProposal(
      emptyProposal({
        title: null,
        code: null,
        useCases: [
          {
            id: "u",
            code: "U1",
            actorId: "gone",
            packageId: "gone",
            title: "Orphan",
            body: null,
          },
        ],
        sections: [sec("sc", "SCOPE")],
      }),
      names,
    );
    expect(md.startsWith("# Proposal\n")).toBe(true);
    expect(md).not.toContain("Code:");
    expect(md).toContain("| U1 | Orphan | | |");
  });

  it("shows a dash for an incomplete recurring price and zero for a fixed price without amount", () => {
    const base = full();
    const md = renderProposal(
      {
        ...base,
        deliverables: [
          deliverable("x1", "p1", { pricing: "RECURRING" }),
          deliverable("x2", "p1", { pricing: "RATE" }),
          deliverable("x3", "p1", { pricing: "FIXED" }),
        ],
        options: base.options.slice(0, 1),
      },
      names,
    );
    expect(md).toContain("| X1 | Title x1 | — |");
    expect(md).toContain("| X2 | Title x2 | — |");
    expect(md).toContain("| X3 | Title x3 | €0.00 |");
  });

  it("escapes pipes in table cells", () => {
    const base = full();
    const md = renderProposal(
      {
        ...base,
        deliverables: [{ ...base.deliverables[0], title: "A | B" }],
      },
      names,
    );
    expect(md).toContain("| D1 | A \\| B |");
  });

  it("omits payments and options when there are none", () => {
    const md = renderProposal(
      { ...full(), paymentSteps: [], options: [] },
      names,
    );
    expect(md).not.toContain("#### Payments");
    expect(md).not.toContain("- [ ]");
  });
});

describe("optional parts that are left out", () => {
  const base = () => full();

  it("lists an actor without a description, and a deliverable with a body", () => {
    const b = base();
    const md = renderProposal(
      {
        ...b,
        actors: [{ id: "a1", code: "U1", name: "Analyst", description: null }],
        deliverables: [{ ...b.deliverables[0], body: "Shipped monthly." }],
      },
      names,
    );
    expect(md).toContain("- **U1 Analyst**\n");
    expect(md).toContain("- **D1** Title d1: Shipped monthly.");
  });

  it("names no package for client input that belongs to none", () => {
    const b = base();
    const md = renderProposal(
      {
        ...b,
        boundaries: [
          {
            id: "b1",
            kind: "CLIENT_INPUT",
            packageId: null,
            text: "Sample data",
            value: null,
          },
        ],
      },
      names,
    );
    expect(md).toContain("- Sample data\n");
  });

  it("leaves the schedule out when nothing is dated or needed", () => {
    const b = base();
    const md = renderProposal(
      {
        ...b,
        packages: b.packages.map((p) => ({ ...p, targetDate: null })),
        boundaries: [],
      },
      names,
    );
    expect(md).not.toContain("Target date");
    expect(md).not.toContain("Subject to:");
  });

  it("shows an unpriced deliverable of a priced package as included", () => {
    const b = base();
    const md = renderProposal(
      {
        ...b,
        packages: b.packages.map((p) => ({ ...p, price: 100 })),
        deliverables: b.deliverables.map((d) => ({ ...d, price: null })),
      },
      names,
    );
    expect(md).toContain("| D1 | Title d1 | Included |");
  });
});
