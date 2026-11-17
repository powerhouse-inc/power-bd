import {
  addActor,
  addAnnex,
  addClause,
  addFigure,
  addPackage,
  addSection,
  addUseCase,
  reducer,
  removeAnnex,
  removeClause,
  removeFigure,
  removeSection,
  reorderClauses,
  reorderFigures,
  reorderSections,
  updateAnnex,
  updateClause,
  updateFigure,
  updateSection,
} from "document-models/proposal/v1";
import { describe, expect, it } from "vitest";
import {
  approved,
  errors,
  FILE_A,
  FILE_B,
  lastError,
  readyDraft,
} from "./fixtures.js";

type Action = Parameters<typeof reducer>[1];

/** The errors of what was dispatched after the ready draft, skipping `skip` more. */
function errs(document: Parameters<typeof lastError>[0], skip: number) {
  return errors(document).slice(readyDraft().operations.global.length + skip);
}

function run(document = readyDraft(), ...actions: Action[]) {
  return actions.reduce(
    (current, action) => reducer(current, action),
    document,
  );
}

/** The same actions on a draft, then approved: the content is there, the proposal is locked. */
function locked(...actions: Action[]) {
  const draft = run(readyDraft(), ...actions);
  return reducer(draft, approved().operations.global.at(-1)!.action);
}

const NOT_DRAFT = "Only a draft proposal can be edited";
const prose = (id = "s1") =>
  addSection({
    id,
    kind: "PROSE",
    title: "Context",
    body: "Brisa Labs studies tides",
  });
const png = (name = "map.png") => ({ ref: FILE_A, name, type: "image/png" });
const figure = (
  id = "f1",
  anchorId = "s1",
  anchorKind: "SECTION" | "USE_CASE" = "SECTION",
) =>
  addFigure({
    id,
    anchorKind,
    anchorId,
    file: png(),
    caption: "The study area",
  });

describe("a proposal's sections", () => {
  it("adds sections in order, with a playbook positioning where given", () => {
    const document = run(
      readyDraft(),
      addSection({
        id: "s1",
        kind: "PROSE",
        title: "Context",
        body: "Text",
        positioningId: "pos-1",
      }),
      addSection({ id: "s2", kind: "SCOPE" }),
      addSection({ id: "s3", kind: "PROSE" }),
    );
    expect(document.state.global.sections).toEqual([
      {
        id: "s1",
        kind: "PROSE",
        title: "Context",
        body: "Text",
        positioningId: "pos-1",
      },
      { id: "s2", kind: "SCOPE", title: null, body: null, positioningId: null },
      { id: "s3", kind: "PROSE", title: null, body: null, positioningId: null },
    ]);
  });

  it("refuses a repeated id, a generated kind added twice, and an approved proposal", () => {
    const document = run(
      readyDraft(),
      addSection({ id: "s1", kind: "PRICING" }),
      addSection({ id: "s1", kind: "SCOPE" }),
      addSection({ id: "s2", kind: "PRICING" }),
    );
    expect(errs(document, 1)).toEqual([
      "Section s1 already exists",
      "A PRICING section is already in the proposal",
    ]);
    expect(document.state.global.sections).toHaveLength(1);
    expect(lastError(reducer(approved(), prose()))).toBe(NOT_DRAFT);
  });

  it("updates a section; a field left out is unchanged and the kind stays", () => {
    const document = run(
      readyDraft(),
      prose(),
      updateSection({ id: "s1", title: "Background" }),
      updateSection({ id: "s1", body: null, positioningId: "pos-2" }),
    );
    expect(document.state.global.sections).toEqual([
      {
        id: "s1",
        kind: "PROSE",
        title: "Background",
        body: null,
        positioningId: "pos-2",
      },
    ]);
  });

  it("refuses an update to a missing section or on an approved proposal", () => {
    expect(lastError(run(readyDraft(), updateSection({ id: "zz" })))).toBe(
      "Section zz not found",
    );
    expect(
      lastError(
        reducer(locked(prose()), updateSection({ id: "s1", title: "x" })),
      ),
    ).toBe(NOT_DRAFT);
  });

  it("removes a section together with its figures, and keeps other figures", () => {
    const document = run(
      readyDraft(),
      prose("s1"),
      prose("s2"),
      figure("f1", "s1"),
      figure("f2", "s2"),
      figure("f3", "s1"),
      removeSection({ id: "s1" }),
    );
    expect(document.state.global.sections.map((s) => s.id)).toEqual(["s2"]);
    expect(document.state.global.figures.map((f) => f.id)).toEqual(["f2"]);
  });

  it("keeps a use case's figure that shares an id with a removed section", () => {
    const document = run(
      readyDraft(),
      addActor({ id: "a1", code: "CL", name: "Lead" }),
      addUseCase({
        id: "same",
        code: "UC",
        actorId: "a1",
        packageId: "pkg-1",
        title: "T",
      }),
      prose("same2"),
      figure("f1", "same", "USE_CASE"),
      removeSection({ id: "same2" }),
    );
    expect(document.state.global.figures.map((f) => f.id)).toEqual(["f1"]);
  });

  it("refuses to remove a missing section or on an approved proposal", () => {
    expect(lastError(run(readyDraft(), removeSection({ id: "zz" })))).toBe(
      "Section zz not found",
    );
    expect(
      lastError(reducer(locked(prose()), removeSection({ id: "s1" }))),
    ).toBe(NOT_DRAFT);
  });

  it("reorders sections, and refuses a list that is not every id once", () => {
    const base = run(readyDraft(), prose("s1"), prose("s2"), prose("s3"));
    const document = run(
      base,
      reorderSections({ ids: ["s3", "s1", "s2"] }),
      reorderSections({ ids: ["s1", "s2"] }),
      reorderSections({ ids: ["s1", "s1", "s2"] }),
    );
    expect(document.state.global.sections.map((s) => s.id)).toEqual([
      "s3",
      "s1",
      "s2",
    ]);
    expect(errors(document).slice(-2)).toEqual([
      "The new order must list every section exactly once",
      "The new order must list every section exactly once",
    ]);
    expect(
      lastError(reducer(locked(prose()), reorderSections({ ids: ["s1"] }))),
    ).toBe(NOT_DRAFT);
  });
});

describe("a proposal's clauses", () => {
  const clause = (id = "c1") =>
    addClause({
      id,
      kind: "LIABILITY",
      title: "Liability",
      body: "Capped at the fee",
    });

  it("adds, updates, reorders and removes clauses", () => {
    const document = run(
      readyDraft(),
      clause("c1"),
      addClause({ id: "c2", kind: "OTHER", title: "Misc" }),
      updateClause({ id: "c1", kind: "TERMINATION", title: "Ending" }),
      updateClause({ id: "c1", body: null, kind: null, title: null }),
      reorderClauses({ ids: ["c2", "c1"] }),
    );
    expect(document.state.global.clauses).toEqual([
      { id: "c2", kind: "OTHER", title: "Misc", body: null },
      { id: "c1", kind: "TERMINATION", title: "Ending", body: null },
    ]);
    expect(
      run(document, removeClause({ id: "c2" })).state.global.clauses.map(
        (c) => c.id,
      ),
    ).toEqual(["c1"]);
  });

  it("refuses repeated, missing and mismatched clauses", () => {
    const document = run(
      readyDraft(),
      clause(),
      clause(),
      updateClause({ id: "zz" }),
      removeClause({ id: "zz" }),
      reorderClauses({ ids: [] }),
    );
    expect(errs(document, 1)).toEqual([
      "Clause c1 already exists",
      "Clause zz not found",
      "Clause zz not found",
      "The new order must list every clause exactly once",
    ]);
  });

  it("refuses every clause operation on an approved proposal", () => {
    const base = locked(clause());
    const results = [
      clause("c2"),
      updateClause({ id: "c1", title: "x" }),
      removeClause({ id: "c1" }),
      reorderClauses({ ids: ["c1"] }),
    ].map((action) => lastError(reducer(base, action)));
    expect(results).toEqual([NOT_DRAFT, NOT_DRAFT, NOT_DRAFT, NOT_DRAFT]);
  });
});

describe("a proposal's annexes", () => {
  const annex = (id = "n1") =>
    addAnnex({
      id,
      kind: "DATA_PROCESSING",
      title: "Data processing",
      body: "Terms",
      partOfAgreement: true,
    });

  it("adds, updates and removes annexes", () => {
    const document = run(
      readyDraft(),
      annex(),
      addAnnex({ id: "n2", kind: "FORM", title: "Intake form" }),
      updateAnnex({
        id: "n2",
        kind: "OTHER",
        title: "Form",
        partOfAgreement: true,
      }),
      updateAnnex({
        id: "n1",
        body: null,
        kind: null,
        title: null,
        partOfAgreement: null,
      }),
    );
    expect(document.state.global.annexes).toEqual([
      {
        id: "n1",
        kind: "DATA_PROCESSING",
        title: "Data processing",
        body: null,
        partOfAgreement: true,
      },
      {
        id: "n2",
        kind: "OTHER",
        title: "Form",
        body: null,
        partOfAgreement: true,
      },
    ]);
    expect(
      run(document, removeAnnex({ id: "n1" })).state.global.annexes.map(
        (a) => a.id,
      ),
    ).toEqual(["n2"]);
  });

  it("refuses repeated and missing annexes", () => {
    const document = run(
      readyDraft(),
      annex(),
      annex(),
      updateAnnex({ id: "zz" }),
      removeAnnex({ id: "zz" }),
    );
    expect(errs(document, 1)).toEqual([
      "Annex n1 already exists",
      "Annex zz not found",
      "Annex zz not found",
    ]);
  });

  it("refuses every annex operation on an approved proposal", () => {
    const base = locked(annex());
    const results = [
      annex("n2"),
      updateAnnex({ id: "n1", title: "x" }),
      removeAnnex({ id: "n1" }),
    ].map((action) => lastError(reducer(base, action)));
    expect(results).toEqual([NOT_DRAFT, NOT_DRAFT, NOT_DRAFT]);
  });
});

describe("a proposal's figures", () => {
  it("adds figures to a prose section and to a use case", () => {
    const document = run(
      readyDraft(),
      prose(),
      addActor({ id: "a1", code: "CL", name: "Lead" }),
      addUseCase({
        id: "u1",
        code: "UC",
        actorId: "a1",
        packageId: "pkg-1",
        title: "T",
      }),
      figure("f1", "s1"),
      addFigure({
        id: "f2",
        anchorKind: "USE_CASE",
        anchorId: "u1",
        file: png("flow.png"),
      }),
    );
    expect(document.state.global.figures).toEqual([
      {
        id: "f1",
        anchorKind: "SECTION",
        anchorId: "s1",
        file: { ref: FILE_A, name: "map.png", type: "image/png" },
        caption: "The study area",
      },
      {
        id: "f2",
        anchorKind: "USE_CASE",
        anchorId: "u1",
        file: { ref: FILE_A, name: "flow.png", type: "image/png" },
        caption: null,
      },
    ]);
  });

  it("refuses a repeated id and a figure with no home", () => {
    const document = run(
      readyDraft(),
      prose(),
      addSection({ id: "s2", kind: "SCOPE" }),
      figure(),
      figure(),
      figure("f2", "zz"),
      figure("f3", "s2"),
      figure("f4", "s1", "USE_CASE"),
    );
    expect(errs(document, 3)).toEqual([
      "Figure f1 already exists",
      "zz is not a prose section or a use case of this proposal",
      "s2 is not a prose section or a use case of this proposal",
      "s1 is not a prose section or a use case of this proposal",
    ]);
    expect(document.state.global.figures).toHaveLength(1);
  });

  it("refuses a file without a name or a type", () => {
    const document = run(
      readyDraft(),
      prose(),
      addFigure({
        id: "f1",
        anchorKind: "SECTION",
        anchorId: "s1",
        file: { ref: FILE_A, name: " ", type: "image/png" },
      }),
      addFigure({
        id: "f1",
        anchorKind: "SECTION",
        anchorId: "s1",
        file: { ref: FILE_A, name: "a.png", type: "" },
      }),
    );
    expect(errs(document, 1)).toEqual([
      "A file needs a name",
      "A file needs a type",
    ]);
    expect(document.state.global.figures).toEqual([]);
  });

  it("replaces a figure's file on a draft, and refuses once the proposal is approved", () => {
    const document = run(
      readyDraft(),
      prose(),
      figure(),
      updateFigure({
        id: "f1",
        file: { ref: FILE_B, name: "map-v2.png", type: "image/png" },
      }),
    );
    expect(document.state.global.figures[0].file).toEqual({
      ref: FILE_B,
      name: "map-v2.png",
      type: "image/png",
    });
    expect(document.state.global.figures[0].caption).toBe("The study area");
    const base = locked(prose(), figure());
    const refused = reducer(
      base,
      updateFigure({
        id: "f1",
        file: { ref: FILE_B, name: "x.png", type: "image/png" },
      }),
    );
    expect(lastError(refused)).toBe(NOT_DRAFT);
    expect(refused.state.global.figures[0].file.ref).toBe(FILE_A);
  });

  it("changes or clears a caption, and keeps the file when none is sent", () => {
    const document = run(
      readyDraft(),
      prose(),
      figure(),
      updateFigure({ id: "f1", caption: "Study area, 2026" }),
      updateFigure({ id: "f1", caption: null, file: null }),
    );
    expect(document.state.global.figures[0].caption).toBeNull();
    expect(document.state.global.figures[0].file.name).toBe("map.png");
  });

  it("refuses an update with a bad file, or to a missing figure", () => {
    const document = run(
      readyDraft(),
      prose(),
      figure(),
      updateFigure({ id: "zz" }),
      updateFigure({
        id: "f1",
        file: { ref: FILE_B, name: "", type: "image/png" },
      }),
      updateFigure({
        id: "f1",
        file: { ref: FILE_B, name: "a.png", type: " " },
      }),
    );
    expect(errs(document, 2)).toEqual([
      "Figure zz not found",
      "A file needs a name",
      "A file needs a type",
    ]);
    expect(document.state.global.figures[0].file.ref).toBe(FILE_A);
  });

  it("removes a figure, and refuses a missing one or an approved proposal", () => {
    const document = run(
      readyDraft(),
      prose(),
      figure(),
      removeFigure({ id: "f1" }),
      removeFigure({ id: "f1" }),
    );
    expect(document.state.global.figures).toEqual([]);
    expect(lastError(document)).toBe("Figure f1 not found");
    expect(
      lastError(reducer(locked(prose(), figure()), removeFigure({ id: "f1" }))),
    ).toBe(NOT_DRAFT);
  });

  it("reorders the figures of one section only", () => {
    const document = run(
      readyDraft(),
      prose("s1"),
      prose("s2"),
      figure("f1", "s1"),
      figure("f2", "s2"),
      figure("f3", "s1"),
      reorderFigures({
        anchorKind: "SECTION",
        anchorId: "s1",
        ids: ["f3", "f1"],
      }),
    );
    expect(document.state.global.figures.map((f) => f.id)).toEqual([
      "f3",
      "f2",
      "f1",
    ]);
  });

  it("refuses a figure order that is not exactly the anchor's figures", () => {
    const document = run(
      readyDraft(),
      prose("s1"),
      prose("s2"),
      figure("f1", "s1"),
      figure("f2", "s2"),
      reorderFigures({
        anchorKind: "SECTION",
        anchorId: "s1",
        ids: ["f1", "f2"],
      }),
      reorderFigures({ anchorKind: "USE_CASE", anchorId: "s1", ids: ["f1"] }),
    );
    expect(errors(document).slice(-2)).toEqual([
      "The new order must list every figure of this section or use case exactly once",
      "The new order must list every figure of this section or use case exactly once",
    ]);
    const base = locked(prose(), figure());
    expect(
      lastError(
        reducer(
          base,
          reorderFigures({
            anchorKind: "SECTION",
            anchorId: "s1",
            ids: ["f1"],
          }),
        ),
      ),
    ).toBe(NOT_DRAFT);
  });
});

describe("a package that a use case or a boundary points at", () => {
  it("cannot be removed", async () => {
    const {
      removePackage,
      addBoundary,
      addUseCase: uc,
      addActor: ac,
    } = await import("document-models/proposal/v1");
    const document = run(
      readyDraft(),
      addPackage({ id: "p2", code: "BRI-2", name: "Extra" }),
      addPackage({ id: "p3", code: "BRI-3", name: "More" }),
      ac({ id: "a1", code: "CL", name: "Lead" }),
      uc({ id: "u1", code: "UC", actorId: "a1", packageId: "p2", title: "T" }),
      addBoundary({ id: "b1", kind: "EXCLUSION", packageId: "p3", text: "t" }),
      removePackage({ id: "p2" }),
      removePackage({ id: "p3" }),
    );
    expect(errors(document).slice(-2)).toEqual([
      "Package p2 is still used by a deliverable, an option or another package",
      "Package p3 is still used by a deliverable, an option or another package",
    ]);
  });
});
