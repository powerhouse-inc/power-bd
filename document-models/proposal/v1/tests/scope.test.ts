import {
  addActor,
  addBoundary,
  addFigure,
  addPackage,
  addUseCase,
  reducer,
  removeActor,
  removeBoundary,
  removeUseCase,
  updateActor,
  updateBoundary,
  updateUseCase,
} from "document-models/proposal/v1";
import { describe, expect, it } from "vitest";
import { approved, errors, FILE_A, lastError, readyDraft } from "./fixtures.js";

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

const actor = (id = "a1", code = "CL") =>
  addActor({ id, code, name: "Research lead", description: "Runs the study" });
const useCase = (id = "u1", code = "UC-1") =>
  addUseCase({
    id,
    code,
    actorId: "a1",
    packageId: "pkg-1",
    title: "Review findings",
    body: "The lead reads the weekly summary",
  });

describe("a proposal's actors", () => {
  it("adds an actor", () => {
    const document = run(readyDraft(), actor());
    expect(document.state.global.actors).toEqual([
      {
        id: "a1",
        code: "CL",
        name: "Research lead",
        description: "Runs the study",
      },
    ]);
  });

  it("adds an actor without a description", () => {
    const document = run(
      readyDraft(),
      addActor({ id: "a1", code: "CL", name: "Research lead" }),
    );
    expect(document.state.global.actors[0].description).toBeNull();
  });

  it("refuses a repeated id and a repeated code", () => {
    const document = run(
      readyDraft(),
      actor(),
      actor("a1", "OTHER"),
      actor("a2", "CL"),
    );
    expect(errs(document, 0)).toEqual([
      undefined,
      "Actor a1 already exists",
      "Actor code CL is already used",
    ]);
    expect(document.state.global.actors).toHaveLength(1);
  });

  it("refuses an actor once the proposal is approved", () => {
    const document = reducer(approved(), actor());
    expect(lastError(document)).toBe("Only a draft proposal can be edited");
    expect(document.state.global.actors).toEqual([]);
  });

  it("updates an actor and leaves out fields unchanged", () => {
    const document = run(
      readyDraft(),
      actor(),
      updateActor({ id: "a1", name: "Study lead" }),
      updateActor({ id: "a1", code: "SL", description: null }),
    );
    expect(document.state.global.actors).toEqual([
      { id: "a1", code: "SL", name: "Study lead", description: null },
    ]);
  });

  it("ignores a null name or code on update, and may keep its own code", () => {
    const document = run(
      readyDraft(),
      actor(),
      updateActor({ id: "a1", code: "CL", name: null }),
      updateActor({ id: "a1", code: null }),
    );
    expect(errs(document, 0)).toEqual([undefined, undefined, undefined]);
    expect(document.state.global.actors[0].name).toBe("Research lead");
    expect(document.state.global.actors[0].code).toBe("CL");
  });

  it("refuses an update to a missing actor, a taken code, or an approved proposal", () => {
    const document = run(
      readyDraft(),
      actor(),
      actor("a2", "OP"),
      updateActor({ id: "zz", name: "x" }),
      updateActor({ id: "a2", code: "CL" }),
    );
    expect(errs(document, 2)).toEqual([
      "Actor zz not found",
      "Actor code CL is already used",
    ]);
    const locked = approvedWith(actor());
    expect(
      lastError(reducer(locked, updateActor({ id: "a1", name: "x" }))),
    ).toBe("Only a draft proposal can be edited");
  });

  it("removes an actor", () => {
    const document = run(readyDraft(), actor(), removeActor({ id: "a1" }));
    expect(document.state.global.actors).toEqual([]);
  });

  it("refuses to remove a missing actor, one a use case points at, or on an approved proposal", () => {
    const document = run(
      readyDraft(),
      actor(),
      useCase(),
      removeActor({ id: "zz" }),
      removeActor({ id: "a1" }),
    );
    expect(errs(document, 2)).toEqual([
      "Actor zz not found",
      "Actor a1 is still used by a use case",
    ]);
    expect(document.state.global.actors).toHaveLength(1);
    const locked = approvedWith(actor());
    expect(lastError(reducer(locked, removeActor({ id: "a1" })))).toBe(
      "Only a draft proposal can be edited",
    );
  });
});

/** An approved proposal that already holds what the actions made, via a draft. */
function approvedWith(...actions: Action[]) {
  const draft = run(readyDraft(), ...actions);
  return reducer(draft, {
    ...approved().operations.global.at(-1)!.action,
  });
}

describe("a proposal's use cases", () => {
  it("adds a use case", () => {
    const document = run(readyDraft(), actor(), useCase());
    expect(document.state.global.useCases).toEqual([
      {
        id: "u1",
        code: "UC-1",
        actorId: "a1",
        packageId: "pkg-1",
        title: "Review findings",
        body: "The lead reads the weekly summary",
      },
    ]);
  });

  it("adds a use case without a body", () => {
    const document = run(
      readyDraft(),
      actor(),
      addUseCase({
        id: "u1",
        code: "UC-1",
        actorId: "a1",
        packageId: "pkg-1",
        title: "T",
      }),
    );
    expect(document.state.global.useCases[0].body).toBeNull();
  });

  it("refuses a repeated id or code, an unknown actor or package, and an approved proposal", () => {
    const document = run(
      readyDraft(),
      actor(),
      useCase(),
      useCase("u1", "UC-2"),
      useCase("u2", "UC-1"),
      addUseCase({
        id: "u3",
        code: "UC-3",
        actorId: "zz",
        packageId: "pkg-1",
        title: "T",
      }),
      addUseCase({
        id: "u3",
        code: "UC-3",
        actorId: "a1",
        packageId: "zz",
        title: "T",
      }),
    );
    expect(errs(document, 2)).toEqual([
      "Use case u1 already exists",
      "Use case code UC-1 is already used",
      "Actor zz not found",
      "Package zz not found",
    ]);
    expect(document.state.global.useCases).toHaveLength(1);
    const locked = reducer(approved(), useCase());
    expect(lastError(locked)).toBe("Only a draft proposal can be edited");
  });

  it("updates a use case; a field left out is unchanged", () => {
    const document = run(
      readyDraft(),
      actor(),
      actor("a2", "OP"),
      addPackage({ id: "pkg-2", code: "BRI-2", name: "Rollout" }),
      useCase(),
      updateUseCase({ id: "u1", title: "Read findings" }),
      updateUseCase({
        id: "u1",
        code: "UC-9",
        actorId: "a2",
        packageId: "pkg-2",
        body: null,
      }),
      updateUseCase({
        id: "u1",
        code: "UC-9",
        title: null,
        actorId: null,
        packageId: null,
      }),
    );
    expect(errs(document, 0).filter(Boolean)).toEqual([]);
    expect(document.state.global.useCases).toEqual([
      {
        id: "u1",
        code: "UC-9",
        actorId: "a2",
        packageId: "pkg-2",
        title: "Read findings",
        body: null,
      },
    ]);
  });

  it("refuses an update to a missing use case, a taken code, an unknown actor or package", () => {
    const document = run(
      readyDraft(),
      actor(),
      useCase(),
      useCase("u2", "UC-2"),
      updateUseCase({ id: "zz", title: "x" }),
      updateUseCase({ id: "u2", code: "UC-1" }),
      updateUseCase({ id: "u2", actorId: "zz" }),
      updateUseCase({ id: "u2", packageId: "zz" }),
    );
    expect(errs(document, 3)).toEqual([
      "Use case zz not found",
      "Use case code UC-1 is already used",
      "Actor zz not found",
      "Package zz not found",
    ]);
    const locked = approvedWith(actor(), useCase());
    expect(
      lastError(reducer(locked, updateUseCase({ id: "u1", title: "x" }))),
    ).toBe("Only a draft proposal can be edited");
  });

  it("removes a use case together with its figures, and keeps the others", () => {
    const figure = (id: string, anchorId: string) =>
      addFigure({
        id,
        anchorKind: "USE_CASE",
        anchorId,
        file: { ref: FILE_A, name: "flow.png", type: "image/png" },
      });
    const document = run(
      readyDraft(),
      actor(),
      useCase(),
      useCase("u2", "UC-2"),
      figure("f1", "u1"),
      figure("f2", "u2"),
      removeUseCase({ id: "u1" }),
    );
    expect(document.state.global.useCases.map((u) => u.id)).toEqual(["u2"]);
    expect(document.state.global.figures.map((f) => f.id)).toEqual(["f2"]);
  });

  it("refuses to remove a missing use case or on an approved proposal", () => {
    expect(lastError(run(readyDraft(), removeUseCase({ id: "zz" })))).toBe(
      "Use case zz not found",
    );
    const locked = approvedWith(actor(), useCase());
    expect(lastError(reducer(locked, removeUseCase({ id: "u1" })))).toBe(
      "Only a draft proposal can be edited",
    );
  });
});

describe("a proposal's boundaries", () => {
  const boundary = (id = "b1") =>
    addBoundary({
      id,
      kind: "ASSUMPTION",
      packageId: "pkg-1",
      text: "Interviews take place in one city",
      value: "12 interviews",
    });

  it("adds a boundary", () => {
    const document = run(readyDraft(), boundary());
    expect(document.state.global.boundaries).toEqual([
      {
        id: "b1",
        kind: "ASSUMPTION",
        packageId: "pkg-1",
        text: "Interviews take place in one city",
        value: "12 interviews",
      },
    ]);
  });

  it("adds a boundary for the whole proposal", () => {
    const document = run(
      readyDraft(),
      addBoundary({
        id: "b1",
        kind: "EXCLUSION",
        text: "Travel is not included",
      }),
    );
    expect(document.state.global.boundaries[0]).toEqual({
      id: "b1",
      kind: "EXCLUSION",
      packageId: null,
      text: "Travel is not included",
      value: null,
    });
  });

  it("refuses a repeated id, an unknown package and an approved proposal", () => {
    const document = run(
      readyDraft(),
      boundary(),
      boundary(),
      addBoundary({ id: "b2", kind: "GUARANTEE", packageId: "zz", text: "t" }),
    );
    expect(errs(document, 1)).toEqual([
      "Boundary b1 already exists",
      "Package zz not found",
    ]);
    expect(lastError(reducer(approved(), boundary()))).toBe(
      "Only a draft proposal can be edited",
    );
  });

  it("updates a boundary; a field left out is unchanged, null clears an optional field", () => {
    const document = run(
      readyDraft(),
      boundary(),
      updateBoundary({ id: "b1", kind: "CLIENT_INPUT" }),
      updateBoundary({
        id: "b1",
        text: "Interviews are remote",
        value: null,
        packageId: null,
      }),
      updateBoundary({ id: "b1", kind: null, text: null }),
    );
    expect(document.state.global.boundaries).toEqual([
      {
        id: "b1",
        kind: "CLIENT_INPUT",
        packageId: null,
        text: "Interviews are remote",
        value: null,
      },
    ]);
    const moved = run(
      document,
      updateBoundary({ id: "b1", packageId: "pkg-1", value: "8" }),
    );
    expect(moved.state.global.boundaries[0]).toMatchObject({
      packageId: "pkg-1",
      value: "8",
    });
  });

  it("refuses an update to a missing boundary, an unknown package or an approved proposal", () => {
    const document = run(
      readyDraft(),
      boundary(),
      updateBoundary({ id: "zz", text: "x" }),
      updateBoundary({ id: "b1", packageId: "zz" }),
    );
    expect(errs(document, 1)).toEqual([
      "Boundary zz not found",
      "Package zz not found",
    ]);
    const locked = approvedWith(boundary());
    expect(
      lastError(reducer(locked, updateBoundary({ id: "b1", text: "x" }))),
    ).toBe("Only a draft proposal can be edited");
  });

  it("removes a boundary, and refuses a missing one or an approved proposal", () => {
    const document = run(
      readyDraft(),
      boundary(),
      removeBoundary({ id: "b1" }),
      removeBoundary({ id: "b1" }),
    );
    expect(document.state.global.boundaries).toEqual([]);
    expect(lastError(document)).toBe("Boundary b1 not found");
    const locked = approvedWith(boundary());
    expect(lastError(reducer(locked, removeBoundary({ id: "b1" })))).toBe(
      "Only a draft proposal can be edited",
    );
  });
});
