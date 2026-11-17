import {
  addAngle,
  draftMessage,
  reducer,
  removeAngle,
  updateAngle,
  utils,
} from "document-models/lead/v1";
import { describe, expect, it } from "vitest";

const JONAS = "0x1111111111111111111111111111111111111aaa";

/** The error of each operation, in the order they were dispatched. */
function errors(document: ReturnType<typeof utils.createDocument>) {
  return document.operations.global.map((operation) => operation.error);
}

function withAngle() {
  return reducer(
    utils.createDocument(),
    addAngle({
      id: "angle-1",
      summary: "Sign contracts without leaving the vault",
      fit: "BEST",
      positioningId: "positioning-1",
    }),
  );
}

describe("a lead's angles", () => {
  it("adds an angle with its fit and its playbook positioning", () => {
    const document = reducer(
      withAngle(),
      addAngle({ id: "angle-2", summary: "Research exchange", fit: "LATER" }),
    );

    expect(errors(document)).toStrictEqual([undefined, undefined]);
    expect(document.state.global.angles).toStrictEqual([
      {
        id: "angle-1",
        summary: "Sign contracts without leaving the vault",
        fit: "BEST",
        positioningId: "positioning-1",
      },
      {
        id: "angle-2",
        summary: "Research exchange",
        fit: "LATER",
        positioningId: null,
      },
    ]);
  });

  it("refuses an angle whose id is already used", () => {
    const document = reducer(
      withAngle(),
      addAngle({ id: "angle-1", summary: "Other", fit: "GOOD" }),
    );

    expect(errors(document)[1]).toBe("Angle angle-1 already exists");
    expect(document.state.global.angles).toHaveLength(1);
    expect(document.state.global.angles[0].summary).toBe(
      "Sign contracts without leaving the vault",
    );
  });

  it("updates what is given, leaves the rest, and clears the positioning with null", () => {
    let document = reducer(
      withAngle(),
      updateAngle({ id: "angle-1", fit: "GOOD" }),
    );
    document = reducer(
      document,
      updateAngle({ id: "angle-1", summary: "Shorter summary" }),
    );

    expect(document.state.global.angles[0]).toStrictEqual({
      id: "angle-1",
      summary: "Shorter summary",
      fit: "GOOD",
      positioningId: "positioning-1",
    });

    document = reducer(
      document,
      updateAngle({
        id: "angle-1",
        summary: null,
        fit: null,
        positioningId: null,
      }),
    );
    document = reducer(
      document,
      updateAngle({ id: "angle-1", positioningId: "positioning-2" }),
    );

    expect(errors(document)).toStrictEqual([
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    expect(document.state.global.angles[0]).toStrictEqual({
      id: "angle-1",
      summary: "Shorter summary",
      fit: "GOOD",
      positioningId: "positioning-2",
    });
  });

  it("refuses to update an angle that does not exist", () => {
    const document = reducer(
      withAngle(),
      updateAngle({ id: "angle-9", fit: "GOOD" }),
    );

    expect(errors(document)[1]).toBe("Angle angle-9 not found");
    expect(document.state.global.angles[0].fit).toBe("BEST");
  });

  it("removes an angle and takes it off the messages that use it", () => {
    let document = reducer(
      withAngle(),
      addAngle({ id: "angle-2", summary: "Research exchange", fit: "LATER" }),
    );
    for (const [id, angleId] of [
      ["message-1", "angle-1"],
      ["message-2", "angle-2"],
    ]) {
      document = reducer(
        document,
        draftMessage({
          id,
          channel: "EMAIL",
          body: "Hello",
          angleId,
          draftedBy: JONAS,
          draftedAt: "2026-11-16T09:00:00.000Z",
        }),
      );
    }
    document = reducer(document, removeAngle({ id: "angle-1" }));

    expect(errors(document).at(-1)).toBeUndefined();
    expect(document.state.global.angles.map((a) => a.id)).toStrictEqual([
      "angle-2",
    ]);
    expect(document.state.global.messages.map((m) => m.angleId)).toStrictEqual([
      null,
      "angle-2",
    ]);
  });

  it("refuses to remove an angle that does not exist", () => {
    const document = reducer(withAngle(), removeAngle({ id: "angle-9" }));

    expect(errors(document)[1]).toBe("Angle angle-9 not found");
    expect(document.state.global.angles).toHaveLength(1);
  });
});
