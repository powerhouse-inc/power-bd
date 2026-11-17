import { describe, expect, it } from "vitest";
import type { ProposalState } from "document-models/proposal";
import {
  deliverable,
  emptyProposal,
  fixed,
  option,
  pkg,
  step,
  workedExample,
} from "../proposal-totals/fixtures.js";
import { checkProposal, type CheckInput } from "./proposal-check.js";

const clause = (
  id: string,
  kind: ProposalState["clauses"][number]["kind"],
) => ({
  id,
  kind,
  title: `Clause ${id}`,
  body: null,
});

/** A proposal that clears every check. */
function clean(overrides: Partial<ProposalState> = {}): ProposalState {
  const base = workedExample();
  return {
    ...base,
    title: "Quillfeather rollout",
    validUntil: "2026-12-31",
    deliverables: [
      ...base.deliverables,
      deliverable("d7", "p2", { pricing: "INCLUDED" }),
    ],
    ...overrides,
  };
}

function run(overrides: Partial<CheckInput> = {}) {
  return checkProposal({
    proposal: clean(),
    playbook: { positioning: [], neverClaims: [] },
    confidentialItems: [],
    decisions: [],
    today: "2026-11-16",
    ...overrides,
  });
}

const codes = (input: Partial<CheckInput>) => run(input).map((f) => f.code);

describe("checkProposal: a clean proposal", () => {
  it("has no findings", () => {
    expect(run()).toEqual([]);
  });
});

describe("PLACEHOLDER_LEFT", () => {
  const withBody = (body: string, extra: Partial<ProposalState> = {}) =>
    clean({
      sections: [
        { id: "s1", kind: "PROSE", title: null, body, positioningId: null },
      ],
      ...extra,
    });

  it("names the section and field holding a placeholder", () => {
    const findings = run({ proposal: withBody("Dear [•], welcome") });
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      code: "PLACEHOLDER_LEFT",
      concerns: { list: "sections", id: "s1", field: "body" },
    });
    expect(findings[0].sentence).toContain("[•]");
  });

  it.each([
    "Price TBD soon",
    "TODO: write this",
    "XXX here",
    "Sign here ____ please",
    "Dear [Client name], hello",
    "[ ]x [Client]",
  ])("flags %s", (body) => {
    expect(codes({ proposal: withBody(body) })).toEqual(["PLACEHOLDER_LEFT"]);
  });

  it.each([
    "The tbd and todo words in lower case, a TBDX, a XXXL shirt",
    "Two __ underscores only",
    "See [the guide](https://example.test) and [ref][1]",
    "- [ ] one\n- [x] two",
    "A claim[^1] with a footnote",
    "Scope [BRI] and [P1]",
    "Empty [] brackets",
  ])("does not flag %s", (body) => {
    expect(codes({ proposal: withBody(body) })).toEqual([]);
  });

  it("treats the code of the proposal, a package or a deliverable as no placeholder", () => {
    expect(codes({ proposal: withBody("[BRI] [P2] [D3]") })).toEqual([]);
  });

  it("reads every kind of text of the proposal", () => {
    const proposal = clean({
      title: "Plan TBD",
      references: [
        { id: "r1", kind: "NOTE", documentId: "doc-1", title: "TODO" },
      ],
      packages: clean().packages.map((p, i) =>
        i === 0 ? { ...p, name: "XXX", summary: "[fill]" } : p,
      ),
      deliverables: clean().deliverables.map((d, i) =>
        i === 0
          ? {
              ...d,
              title: "TBD",
              body: "TBD",
              price: { ...d.price!, note: "TBD" },
            }
          : d,
      ),
      options: clean().options.map((o, i) =>
        i === 0
          ? {
              ...o,
              label: "TBD",
              adjustments: [
                { id: "a1", label: "TBD", amount: 1, condition: "TBD" },
              ],
            }
          : o,
      ),
      paymentSteps: clean().paymentSteps.map((s, i) =>
        i === 0 ? { ...s, label: "TBD" } : s,
      ),
      actors: [{ id: "ac1", code: "AC", name: "TBD", description: "TBD" }],
      useCases: [
        {
          id: "u1",
          code: "U",
          actorId: "ac1",
          packageId: "p1",
          title: "TBD",
          body: "TBD",
        },
      ],
      boundaries: [
        {
          id: "b1",
          kind: "ASSUMPTION",
          packageId: null,
          text: "TBD",
          value: "TBD",
        },
      ],
      sections: [
        {
          id: "s1",
          kind: "PROSE",
          title: "TBD",
          body: "TBD",
          positioningId: null,
        },
      ],
      clauses: [{ ...clause("c1", "OTHER"), title: "TBD", body: "TBD" }],
      annexes: [
        {
          id: "x1",
          kind: "OTHER",
          title: "TBD",
          body: "TBD",
          partOfAgreement: false,
        },
      ],
      figures: [
        {
          id: "f1",
          anchorKind: "SECTION",
          anchorId: "s1",
          file: {
            ref: "attachment://v1:abc",
            name: "a.png",
            type: "image/png",
          },
          caption: "TBD",
        },
      ],
    });
    const found = run({ proposal })
      .filter((f) => f.code === "PLACEHOLDER_LEFT")
      .map((f) => JSON.stringify(f.concerns));
    expect(found).toHaveLength(24);
    expect(found).toContain('{"field":"title"}');
    expect(found).toContain('{"list":"figures","id":"f1","field":"caption"}');
    expect(found).toContain(
      '{"list":"adjustments","id":"a1","field":"condition"}',
    );
  });
});

describe("OTHER_CURRENCY_IN_TEXT", () => {
  const withBody = (body: string, currency = "EUR") =>
    clean({
      currency,
      sections: [
        { id: "s1", kind: "PROSE", title: null, body, positioningId: null },
      ],
    });
  const flagged = (body: string, currency?: string) =>
    codes({ proposal: withBody(body, currency) }).includes(
      "OTHER_CURRENCY_IN_TEXT",
    );

  it("names the text and the currency found", () => {
    const [f] = run({ proposal: withBody("We charge 5,000 USD up front") });
    expect(f).toMatchObject({
      code: "OTHER_CURRENCY_IN_TEXT",
      concerns: { list: "sections", id: "s1", field: "body" },
    });
    expect(f.sentence).toContain("USD");
  });

  it("finds an ISO code after or before the number", () => {
    expect(flagged("about 100 GBP")).toBe(true);
    expect(flagged("about GBP 100")).toBe(true);
    expect(flagged("about 100 EUR")).toBe(false);
    expect(flagged("EUR 100 and 100 EUR")).toBe(false);
  });

  it("ignores a three-letter word that is no currency, or no number", () => {
    expect(flagged("100 ABC and USD alone and the USA 2026")).toBe(false);
  });

  it("does not fit a symbol to the wrong currency", () => {
    expect(flagged("€5,000")).toBe(false);
    expect(flagged("£5,000")).toBe(true);
    expect(flagged("5.000 $")).toBe(true);
    expect(flagged("¥500")).toBe(true);
  });

  it("accepts $ in a USD proposal and flags it in a EUR one", () => {
    expect(flagged("$5,000", "USD")).toBe(false);
    expect(flagged("$5,000", "EUR")).toBe(true);
    expect(flagged("$5,000", "CAD")).toBe(false);
    expect(flagged("€5,000", "USD")).toBe(true);
  });

  it("fits ¥ to JPY and CNY and £ to GBP", () => {
    expect(flagged("¥500", "JPY")).toBe(false);
    expect(flagged("¥500", "CNY")).toBe(false);
    expect(flagged("£5", "GBP")).toBe(false);
  });

  it("flags nothing while the proposal has no currency", () => {
    expect(
      codes({ proposal: { ...withBody("$5 and 3 USD"), currency: null } }),
    ).toEqual([]);
  });
});

describe("sensitivity findings", () => {
  const withBody = (body: string) =>
    clean({
      sections: [
        { id: "s1", kind: "PROSE", title: "Plain", body, positioningId: null },
      ],
    });

  it("passes a never-claim phrase through, naming the text", () => {
    const found = run({
      proposal: withBody("We promise guaranteed returns."),
      playbook: {
        positioning: [],
        neverClaims: [
          {
            id: "nc-1",
            claim: "c",
            reason: null,
            phrases: ["guaranteed returns"],
          },
        ],
      },
    });
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({
      code: "NEVER_CLAIM_PHRASE",
      concerns: { list: "sections", id: "s1", field: "body" },
      sourceItemId: "nc-1",
    });
    expect(found[0].sentence).toContain("guaranteed returns");
  });

  it("passes a quoted confidential item through", () => {
    const found = run({
      proposal: clean({
        title: "The Quillfeather board privately wants a merger with Marnoble",
      }),
      confidentialItems: [
        {
          id: "ci-1",
          text: "The Quillfeather board privately wants a merger with Marnoble before spring ends",
        },
      ],
    });
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({
      code: "CONFIDENTIAL_QUOTED",
      concerns: { field: "title" },
      sourceItemId: "ci-1",
    });
  });
});

describe("package and option findings", () => {
  it("OPTION_MISSING_REQUIRED_PACKAGE names the option", () => {
    const proposal = clean({
      options: [option("oa", ["p1", "p2"]), option("ob", ["p3"])],
    });
    const found = run({ proposal });
    expect(found.map((f) => [f.code, f.concerns])).toEqual([
      ["OPTION_MISSING_REQUIRED_PACKAGE", { list: "options", id: "ob" }],
      ["OPTION_MISSING_REQUIRED_PACKAGE", { list: "options", id: "ob" }],
    ]);
    expect(found[0].sentence).toContain("p1");
  });

  it("PACKAGE_WITHOUT_PRICE: in an option, no own price, no fixed deliverable", () => {
    const proposal = clean({
      packages: [...clean().packages, pkg("p4")],
      deliverables: [
        ...clean().deliverables,
        deliverable("d8", "p4", { pricing: "INCLUDED" }),
      ],
      options: [...clean().options, option("od", ["p4"])],
    });
    expect(run({ proposal }).map((f) => [f.code, f.concerns])).toEqual([
      ["PACKAGE_WITHOUT_PRICE", { list: "packages", id: "p4" }],
    ]);
  });

  it("PACKAGE_WITHOUT_PRICE: a package outside every option is not asked for a price", () => {
    const proposal = clean({
      packages: [...clean().packages, pkg("p4")],
      deliverables: [
        ...clean().deliverables,
        deliverable("d8", "p4", { pricing: "INCLUDED" }),
      ],
    });
    expect(codes({ proposal })).toEqual([]);
  });

  it("PACKAGE_WITHOUT_DELIVERABLE", () => {
    const proposal = clean({
      packages: [...clean().packages, { ...pkg("p4", 100) }],
      options: [...clean().options, option("od", ["p4"])],
    });
    expect(run({ proposal }).map((f) => [f.code, f.concerns])).toEqual([
      ["PACKAGE_WITHOUT_DELIVERABLE", { list: "packages", id: "p4" }],
    ]);
  });

  it("FIXED_PRICE_OUTSIDE_OPTIONS: a fixed deliverable and a priced package", () => {
    const proposal = clean({
      packages: [...clean().packages, pkg("p4", 100), pkg("p5")],
      deliverables: [
        ...clean().deliverables,
        fixed("d8", "p5", 50),
        deliverable("d9", "p4", { pricing: "INCLUDED" }),
      ],
    });
    expect(run({ proposal }).map((f) => [f.code, f.concerns])).toEqual([
      ["FIXED_PRICE_OUTSIDE_OPTIONS", { list: "packages", id: "p4" }],
      ["FIXED_PRICE_OUTSIDE_OPTIONS", { list: "deliverables", id: "d8" }],
    ]);
  });
});

describe("PAYMENT_NOT_100", () => {
  it("flags steps adding to 90", () => {
    const proposal = clean({
      paymentSteps: [
        step("s1", "ON_SIGNATURE", 40),
        step("s2", "ON_ACCEPTANCE", 50),
      ],
    });
    const [f] = run({ proposal });
    expect(f).toMatchObject({
      code: "PAYMENT_NOT_100",
      concerns: { field: "paymentSteps" },
    });
    expect(f.sentence).toContain("90");
  });

  it("flags no steps at all, accepts thirds that add up", () => {
    expect(codes({ proposal: clean({ paymentSteps: [] }) })).toEqual([
      "PAYMENT_NOT_100",
    ]);
    const third = 100 / 3;
    expect(
      codes({
        proposal: clean({
          paymentSteps: [
            step("a", "ON_SIGNATURE", third),
            step("b", "ON_DATE", third),
            step("c", "ON_ACCEPTANCE", third),
          ],
        }),
      }),
    ).toEqual([]);
  });
});

describe("CLAUSE_MISSING and DATA_ANNEX_MISSING", () => {
  it("names each missing clause of a binding proposal", () => {
    const proposal = clean({
      bindingOnSignature: true,
      clauses: [clause("c1", "LIABILITY")],
    });
    const found = run({ proposal });
    expect(found.map((f) => [f.code, f.concerns])).toEqual([
      ["CLAUSE_MISSING", { field: "clauses" }],
      ["CLAUSE_MISSING", { field: "clauses" }],
    ]);
    expect(found.map((f) => f.sentence).join(" ")).toMatch(/termination/i);
    expect(found.map((f) => f.sentence).join(" ")).toMatch(/governing/i);
  });

  it("accepts a binding proposal with all three, and a non-binding one with none", () => {
    expect(
      codes({
        proposal: clean({
          bindingOnSignature: true,
          clauses: [
            clause("c1", "LIABILITY"),
            clause("c2", "TERMINATION"),
            clause("c3", "GOVERNING_LAW"),
          ],
        }),
      }),
    ).toEqual([]);
    expect(codes({ proposal: clean({ bindingOnSignature: false }) })).toEqual(
      [],
    );
  });

  it("DATA_ANNEX_MISSING when personal data is processed without the annex", () => {
    const annex = (kind: "DATA_PROCESSING" | "FORM") => ({
      id: "x1",
      kind,
      title: "Annex",
      body: null,
      partOfAgreement: true,
    });
    const [f] = run({
      proposal: clean({
        processesPersonalData: true,
        annexes: [annex("FORM")],
      }),
    });
    expect(f).toMatchObject({
      code: "DATA_ANNEX_MISSING",
      concerns: { field: "annexes" },
    });
    expect(
      codes({
        proposal: clean({
          processesPersonalData: true,
          annexes: [annex("DATA_PROCESSING")],
        }),
      }),
    ).toEqual([]);
  });
});

describe("POSITIONING_NOT_APPROVED", () => {
  const positioning = (status: "DRAFT" | "APPROVED" | "RETIRED") => ({
    id: "pos-1",
    title: "Position",
    text: "t",
    status,
    approvedBy: null,
    approvedAt: null,
    comparables: [],
    proofCaseIds: [],
  });
  const section = (positioningId: string | null) =>
    clean({
      sections: [
        { id: "s1", kind: "PROSE", title: null, body: null, positioningId },
      ],
    });

  it.each(["DRAFT", "RETIRED"] as const)(
    "flags a section from a %s positioning",
    (status) => {
      const [f] = run({
        proposal: section("pos-1"),
        playbook: { positioning: [positioning(status)], neverClaims: [] },
      });
      expect(f).toMatchObject({
        code: "POSITIONING_NOT_APPROVED",
        concerns: { list: "sections", id: "s1" },
      });
    },
  );

  it("flags a positioning the playbook no longer holds", () => {
    expect(codes({ proposal: section("gone") })).toEqual([
      "POSITIONING_NOT_APPROVED",
    ]);
  });

  it("accepts an approved positioning and a section from none", () => {
    expect(
      codes({
        proposal: section("pos-1"),
        playbook: { positioning: [positioning("APPROVED")], neverClaims: [] },
      }),
    ).toEqual([]);
    expect(codes({ proposal: section(null) })).toEqual([]);
  });
});

describe("VALID_UNTIL_PASSED", () => {
  it("flags a date before today, not today, not a later one, not none", () => {
    const f = run({ proposal: clean({ validUntil: "2026-11-15" }) });
    expect(f.map((x) => [x.code, x.concerns])).toEqual([
      ["VALID_UNTIL_PASSED", { field: "validUntil" }],
    ]);
    expect(codes({ proposal: clean({ validUntil: "2026-11-16" }) })).toEqual(
      [],
    );
    expect(codes({ proposal: clean({ validUntil: "2027-01-01" }) })).toEqual(
      [],
    );
    expect(codes({ proposal: clean({ validUntil: null }) })).toEqual([]);
  });
});

describe("DECISION_OPEN", () => {
  const ref = (kind: "DECISION" | "NOTE") => ({
    id: "r1",
    kind,
    documentId: "dec-1",
    title: "Which entity signs",
  });

  it("flags a referenced decision that is open", () => {
    const [f] = run({
      proposal: clean({ references: [ref("DECISION")] }),
      decisions: [{ id: "dec-1", status: "OPEN" }],
    });
    expect(f).toMatchObject({
      code: "DECISION_OPEN",
      concerns: { list: "references", id: "r1" },
    });
  });

  it("ignores answered, withdrawn, unknown and non-decision references", () => {
    expect(
      codes({
        proposal: clean({ references: [ref("DECISION")] }),
        decisions: [{ id: "dec-1", status: "ANSWERED" }],
      }),
    ).toEqual([]);
    expect(
      codes({
        proposal: clean({ references: [ref("DECISION")] }),
        decisions: [{ id: "dec-1", status: "WITHDRAWN" }],
      }),
    ).toEqual([]);
    expect(
      codes({ proposal: clean({ references: [ref("DECISION")] }) }),
    ).toEqual([]);
    expect(
      codes({
        proposal: clean({ references: [ref("NOTE")] }),
        decisions: [{ id: "dec-1", status: "OPEN" }],
      }),
    ).toEqual([]);
  });
});

describe("an empty draft", () => {
  it("is not a crash", () => {
    expect(codes({ proposal: emptyProposal() })).toEqual(["PAYMENT_NOT_100"]);
  });
});

describe("finding sentences name items for a person, never by id", () => {
  it("names a deliverable by code and title", () => {
    const base = clean();
    const found = run({
      proposal: clean({
        deliverables: base.deliverables.map((d) =>
          d.id === "d1"
            ? {
                ...d,
                code: "BL-P1-D2",
                title: "Signing flow",
                body: "Fill in [•]",
              }
            : d,
        ),
      }),
    });
    expect(found.map((f) => f.sentence)).toEqual([
      'Deliverable BL-P1-D2 "Signing flow" still holds a placeholder: [•].',
    ]);
  });

  it("names a section by its title and an option by its label", () => {
    const found = run({
      proposal: clean({
        sections: [
          {
            id: "s9f3",
            kind: "PROSE",
            title: "Our approach",
            body: "TBD",
            positioningId: null,
          },
        ],
        options: [option("oa", ["p1", "p2"]), option("ob", ["p3"])],
      }),
    });
    const sentences = found.map((f) => f.sentence).join("\n");
    expect(sentences).toContain(
      'Section "Our approach" still holds a placeholder: TBD.',
    );
    expect(sentences).toContain(
      'Option "Option ob" needs package P1 "p1", which it does not include.',
    );
  });

  it("names the section of an unapproved positioning by its title", () => {
    const found = run({
      proposal: clean({
        sections: [
          {
            id: "s9f3",
            kind: "PROSE",
            title: "Why us",
            body: null,
            positioningId: "pos-1",
          },
        ],
      }),
    });
    expect(found.map((f) => f.sentence)).toEqual([
      'Section "Why us" was taken from a positioning that is no longer approved.',
    ]);
  });
});
