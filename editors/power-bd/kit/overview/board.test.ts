import { describe, expect, it } from "vitest";
import { ALICE, input, lead, list, opportunity } from "./fixtures.js";
import { overview } from "./overview.js";

const stageOf = (kind: "leads" | "opportunities", status: string) => {
  const rec = {
    id: "x",
    state:
      kind === "leads"
        ? lead({ status } as never)
        : opportunity({ status } as never),
  };
  const board = overview(input({ [kind]: [rec] })).board;
  return (Object.keys(board) as (keyof typeof board)[]).find(
    (s) => board[s].length === 1,
  );
};

describe("board", () => {
  it.each([
    ["TO_CONTACT", "NEW"],
    ["IN_TOUCH", "ACTIVE"],
    ["MEETING_SET", "ACTIVE"],
    ["MET", "ACTIVE"],
    ["PROPOSAL", "ACTIVE"],
    ["PARKED", "PARKED"],
    ["WON", "CLOSED"],
    ["LOST", "CLOSED"],
  ])("lead %s is %s", (status, stage) =>
    expect(stageOf("leads", status)).toBe(stage),
  );

  it.each([
    ["TO_EVALUATE", "NEW"],
    ["DECIDING", "NEW"],
    ["PREPARING", "ACTIVE"],
    ["SUBMITTED", "ACTIVE"],
    ["NEXT_STAGE", "ACTIVE"],
    ["WATCHING", "PARKED"],
    ["AWARDED", "CLOSED"],
    ["REJECTED", "CLOSED"],
    ["WITHDRAWN", "CLOSED"],
    ["NO_GO", "CLOSED"],
  ])("opportunity %s is %s", (status, stage) =>
    expect(stageOf("opportunities", status)).toBe(stage),
  );

  it("shows shortlisted investor rows as New, and no other row state", () => {
    const o = overview(
      input({
        investorLists: [
          {
            id: "L1",
            state: list([
              { state: "LISTED" },
              { state: "SHORTLISTED", name: "Zeta Capital" },
              { state: "EXCLUDED" },
              { state: "ENGAGED" },
            ]),
          },
        ],
      }),
    );
    expect(o.board.NEW).toEqual([
      {
        kind: "investor-row",
        id: "L1",
        rowId: "r1",
        name: "Zeta Capital",
        stage: "NEW",
      },
    ]);
    expect(o.board.ACTIVE).toEqual([]);
  });

  it("names the lead entry and falls back to an empty name", () => {
    const o = overview(
      input({
        leads: [{ id: "a", state: lead({ name: null, owner: ALICE }) }],
      }),
    );
    expect(o.board.ACTIVE[0]).toEqual({
      kind: "lead",
      id: "a",
      name: "",
      stage: "ACTIVE",
    });
  });
});
