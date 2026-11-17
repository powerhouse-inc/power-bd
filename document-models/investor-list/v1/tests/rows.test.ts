import {
  addRows,
  excludeRow,
  linkRowComparable,
  markRowEngaged,
  reducer,
  relistRow,
  removeRow,
  setRowThesis,
  shortlistRow,
  unlinkRowComparable,
  updateRow,
  utils,
} from "document-models/investor-list/v1";
import { describe, expect, it } from "vitest";

/** "Investor 001" to "Investor 130", as the import of a regional investor map sends them. */
function investorMap() {
  return Array.from({ length: 130 }, (_, index) => {
    const number = String(index + 1).padStart(3, "0");
    return {
      id: `row-${number}`,
      name: `Investor ${number}`,
      website: `investor-${number}.example`,
      sourceList: "Regional investor map",
    };
  });
}

/** Halloway Fund (r1) and Kelvar Institute (r2), added in one action: the first operation. */
function listOfTwo() {
  return reducer(
    utils.createDocument(),
    addRows({
      rows: [
        {
          id: "r1",
          name: "Halloway Fund",
          website: "halloway.example",
          sourceList: "Regional investor map",
        },
        { id: "r2", name: "Kelvar Institute" },
      ],
    }),
  );
}

describe("the investor list", () => {
  it("starts with no rows", () => {
    expect(utils.createDocument().state.global).toStrictEqual({ rows: [] });
  });

  it("adds rows, each one listed and with nothing else recorded yet", () => {
    const document = reducer(
      utils.createDocument(),
      addRows({
        rows: [
          {
            id: "r1",
            name: "Halloway Fund",
            website: "halloway.example",
            sourceList: "Regional investor map",
          },
          { id: "r2", name: "Kelvar Institute" },
        ],
      }),
    );

    expect(document.operations.global[0].error).toBeUndefined();
    expect(document.state.global.rows).toStrictEqual([
      {
        id: "r1",
        name: "Halloway Fund",
        website: "halloway.example",
        sourceList: "Regional investor map",
        state: "LISTED",
        exclusionReason: null,
        thesisNote: null,
        comparables: [],
        organisationId: null,
        leadId: null,
      },
      {
        id: "r2",
        name: "Kelvar Institute",
        website: null,
        sourceList: null,
        state: "LISTED",
        exclusionReason: null,
        thesisNote: null,
        comparables: [],
        organisationId: null,
        leadId: null,
      },
    ]);
  });

  it("imports a map of 130 investors as rows in one action", () => {
    const document = reducer(
      utils.createDocument(),
      addRows({ rows: investorMap() }),
    );
    const { rows } = document.state.global;

    expect(document.operations.global).toHaveLength(1);
    expect(document.operations.global[0].error).toBeUndefined();
    expect(rows).toHaveLength(130);
    expect(rows[0]).toStrictEqual({
      id: "row-001",
      name: "Investor 001",
      website: "investor-001.example",
      sourceList: "Regional investor map",
      state: "LISTED",
      exclusionReason: null,
      thesisNote: null,
      comparables: [],
      organisationId: null,
      leadId: null,
    });
    expect(rows[56].name).toBe("Investor 057");
    expect(rows[129]).toStrictEqual({
      id: "row-130",
      name: "Investor 130",
      website: "investor-130.example",
      sourceList: "Regional investor map",
      state: "LISTED",
      exclusionReason: null,
      thesisNote: null,
      comparables: [],
      organisationId: null,
      leadId: null,
    });
    expect(rows.filter((row) => row.state === "LISTED")).toHaveLength(130);
  });

  it("refuses a batch that repeats an id, and adds none of its rows", () => {
    const document = reducer(
      utils.createDocument(),
      addRows({
        rows: [
          { id: "r1", name: "Halloway Fund" },
          { id: "r2", name: "Kelvar Institute" },
          { id: "r1", name: "Halloway Fund II" },
        ],
      }),
    );

    expect(document.operations.global[0].error).toBe(
      "Row r1 appears more than once in the batch",
    );
    expect(document.state.global.rows).toStrictEqual([]);
  });

  it("refuses a batch holding an id the list already has, and adds none of its rows", () => {
    const document = reducer(
      listOfTwo(),
      addRows({
        rows: [
          { id: "r3", name: "Investor 003" },
          { id: "r2", name: "Kelvar Institute" },
        ],
      }),
    );

    expect(document.operations.global[1].error).toBe("Row r2 already exists");
    expect(document.state.global.rows.map((row) => row.id)).toStrictEqual([
      "r1",
      "r2",
    ]);
  });

  it("refuses a row without a name, in an import and in an update", () => {
    let document = reducer(
      utils.createDocument(),
      addRows({
        rows: [
          { id: "r1", name: "Halloway Fund" },
          { id: "r2", name: "  " },
        ],
      }),
    );
    document = reducer(listOfTwo(), updateRow({ id: "r1", name: " " }));

    expect(document.operations.global[1].error).toBe(
      "A row needs its organisation's name",
    );
    expect(document.state.global.rows[0].name).toBe("Halloway Fund");
    const imported = reducer(
      utils.createDocument(),
      addRows({
        rows: [
          { id: "r1", name: "Halloway Fund" },
          { id: "r2", name: "" },
        ],
      }),
    );
    expect(imported.operations.global[0].error).toBe(
      "A row needs its organisation's name",
    );
    expect(imported.state.global.rows).toStrictEqual([]);
  });

  it("updates the given fields of a row and leaves the others", () => {
    let document = reducer(
      listOfTwo(),
      updateRow({ id: "r1", name: "Halloway Capital", website: null }),
    );
    document = reducer(
      document,
      updateRow({ id: "r2", sourceList: "Referral" }),
    );
    document = reducer(
      document,
      updateRow({ id: "r2", website: "kelvar.example" }),
    );

    expect(
      document.operations.global.slice(1).map((o) => o.error),
    ).toStrictEqual([undefined, undefined, undefined]);
    expect(document.state.global.rows[0]).toMatchObject({
      name: "Halloway Capital",
      website: null,
      sourceList: "Regional investor map",
    });
    expect(document.state.global.rows[1]).toMatchObject({
      name: "Kelvar Institute",
      website: "kelvar.example",
      sourceList: "Referral",
    });
  });

  it("shortlists, excludes with a reason, and relists a row", () => {
    let document = reducer(listOfTwo(), shortlistRow({ id: "r1" }));
    expect(document.state.global.rows[0].state).toBe("SHORTLISTED");

    document = reducer(
      document,
      excludeRow({ id: "r1", reason: "Invests only in later stages" }),
    );
    expect(document.state.global.rows[0]).toMatchObject({
      state: "EXCLUDED",
      exclusionReason: "Invests only in later stages",
    });

    document = reducer(document, relistRow({ id: "r1" }));
    expect(document.state.global.rows[0]).toMatchObject({
      state: "LISTED",
      exclusionReason: null,
    });

    document = reducer(
      document,
      excludeRow({ id: "r1", reason: "Out of scope" }),
    );
    document = reducer(document, shortlistRow({ id: "r1" }));
    expect(document.state.global.rows[0]).toMatchObject({
      state: "SHORTLISTED",
      exclusionReason: null,
    });
    expect(
      document.operations.global.slice(1).map((o) => o.error),
    ).toStrictEqual([undefined, undefined, undefined, undefined, undefined]);
  });

  it("refuses to exclude a row without a reason", () => {
    let document = reducer(listOfTwo(), excludeRow({ id: "r1", reason: "" }));
    document = reducer(document, excludeRow({ id: "r1", reason: "   " }));

    expect(
      document.operations.global.slice(1).map((o) => o.error),
    ).toStrictEqual([
      "Excluding a row needs a reason",
      "Excluding a row needs a reason",
    ]);
    expect(document.state.global.rows[0].state).toBe("LISTED");
  });

  it("sets, replaces and clears the thesis note", () => {
    let document = reducer(
      listOfTwo(),
      setRowThesis({
        id: "r1",
        thesisNote: { id: "phid-note-1", title: "Halloway thesis" },
      }),
    );
    expect(document.state.global.rows[0].thesisNote).toStrictEqual({
      id: "phid-note-1",
      title: "Halloway thesis",
    });
    document = reducer(document, setRowThesis({ id: "r1", thesisNote: null }));
    expect(document.state.global.rows[0].thesisNote).toBeNull();
    expect(
      document.operations.global.slice(1).map((o) => o.error),
    ).toStrictEqual([undefined, undefined]);
  });

  it("links and unlinks comparables, and refuses a repeat or an unknown one", () => {
    let document = reducer(
      listOfTwo(),
      linkRowComparable({
        rowId: "r1",
        comparableId: "phid-c1",
        title: "Brisa Labs round",
      }),
    );
    document = reducer(
      document,
      linkRowComparable({
        rowId: "r1",
        comparableId: "phid-c1",
        title: "Again",
      }),
    );
    document = reducer(
      document,
      linkRowComparable({
        rowId: "r1",
        comparableId: "phid-c2",
        title: "Other round",
      }),
    );
    document = reducer(
      document,
      unlinkRowComparable({ rowId: "r1", comparableId: "phid-c9" }),
    );
    document = reducer(
      document,
      unlinkRowComparable({ rowId: "r1", comparableId: "phid-c1" }),
    );

    expect(
      document.operations.global.slice(1).map((o) => o.error),
    ).toStrictEqual([
      undefined,
      'This note is already linked to "Halloway Fund".',
      undefined,
      'This note is not linked to "Halloway Fund".',
      undefined,
    ]);
    expect(document.state.global.rows[0].comparables).toStrictEqual([
      { id: "phid-c2", title: "Other round" },
    ]);
  });

  it("marks a row engaged and then refuses every change to it", () => {
    let document = reducer(
      listOfTwo(),
      markRowEngaged({
        id: "r1",
        organisationId: "phid-org-1",
        leadId: "phid-lead-1",
      }),
    );
    expect(document.state.global.rows[0]).toMatchObject({
      state: "ENGAGED",
      organisationId: "phid-org-1",
      leadId: "phid-lead-1",
    });
    const before = document.state.global;

    document = reducer(document, updateRow({ id: "r1", name: "New" }));
    document = reducer(document, shortlistRow({ id: "r1" }));
    document = reducer(document, excludeRow({ id: "r1", reason: "No" }));
    document = reducer(document, relistRow({ id: "r1" }));
    document = reducer(document, setRowThesis({ id: "r1", thesisNote: null }));
    document = reducer(
      document,
      linkRowComparable({ rowId: "r1", comparableId: "phid-c1", title: "x" }),
    );
    document = reducer(
      document,
      unlinkRowComparable({ rowId: "r1", comparableId: "phid-c1" }),
    );
    document = reducer(
      document,
      markRowEngaged({
        id: "r1",
        organisationId: "phid-org-2",
        leadId: "phid-lead-2",
      }),
    );
    document = reducer(document, removeRow({ id: "r1" }));

    expect(
      document.operations.global.slice(2).map((o) => o.error),
    ).toStrictEqual(Array(9).fill("Row r1 is engaged and cannot change"));
    expect(document.state.global).toStrictEqual(before);
  });

  it("refuses to engage a row without its organisation or its lead", () => {
    let document = reducer(
      listOfTwo(),
      markRowEngaged({ id: "r1", organisationId: "", leadId: "phid-lead-1" }),
    );
    document = reducer(
      document,
      markRowEngaged({ id: "r1", organisationId: "phid-org-1", leadId: " " }),
    );

    expect(
      document.operations.global.slice(1).map((o) => o.error),
    ).toStrictEqual([
      "Engaging a row needs its organisation",
      "Engaging a row needs its investor lead",
    ]);
    expect(document.state.global.rows[0].state).toBe("LISTED");
  });

  it("removes a row that is not engaged", () => {
    const document = reducer(listOfTwo(), removeRow({ id: "r1" }));

    expect(document.operations.global[1].error).toBeUndefined();
    expect(document.state.global.rows.map((row) => row.id)).toStrictEqual([
      "r2",
    ]);
  });

  it("refuses every operation on a row the list does not have", () => {
    let document = listOfTwo();
    document = reducer(document, updateRow({ id: "r9" }));
    document = reducer(document, shortlistRow({ id: "r9" }));
    document = reducer(document, excludeRow({ id: "r9", reason: "No" }));
    document = reducer(document, relistRow({ id: "r9" }));
    document = reducer(document, setRowThesis({ id: "r9", thesisNote: null }));
    document = reducer(
      document,
      linkRowComparable({ rowId: "r9", comparableId: "phid-c1", title: "x" }),
    );
    document = reducer(
      document,
      unlinkRowComparable({ rowId: "r9", comparableId: "phid-c1" }),
    );
    document = reducer(
      document,
      markRowEngaged({ id: "r9", organisationId: "o", leadId: "l" }),
    );
    document = reducer(document, removeRow({ id: "r9" }));

    expect(
      document.operations.global.slice(1).map((o) => o.error),
    ).toStrictEqual(Array(9).fill("Row r9 not found"));
    expect(document.state.global.rows).toHaveLength(2);
  });
});
