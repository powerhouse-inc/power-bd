import { describe, expect, it } from "vitest";
import { ALICE, BOB, decision, input, lead, opportunity } from "./fixtures.js";
import { filterItems, mine, ownerName, viewItems } from "./views.js";

const items = viewItems(
  input({
    leads: [
      { id: "l1", state: lead({ name: "Acme", status: "MET", owner: ALICE }) },
      {
        id: "l2",
        state: lead({ name: "Beta", status: "LOST", owner: null } as never),
      },
    ],
    opportunities: [
      { id: "o1", state: opportunity({ name: "Fund X", owner: BOB }) },
      {
        id: "o2",
        state: opportunity({
          name: "Fund Y",
          owner: ALICE.toUpperCase().replace("0X", "0x"),
        }),
      },
    ],
    decisions: [
      { id: "d1", state: decision({ question: "Apply?", owner: ALICE }) },
    ],
  }),
);

describe("viewItems", () => {
  it("lists leads, opportunities and decisions with status and owner", () => {
    expect(items.map((i) => [i.kind, i.id, i.name, i.status, i.owner])).toEqual(
      [
        ["lead", "l1", "Acme", "MET", ALICE],
        ["lead", "l2", "Beta", "LOST", null],
        ["opportunity", "o1", "Fund X", "PREPARING", BOB],
        [
          "opportunity",
          "o2",
          "Fund Y",
          "PREPARING",
          ALICE.toUpperCase().replace("0X", "0x"),
        ],
        ["decision", "d1", "Apply?", "OPEN", ALICE],
      ],
    );
  });

  it("falls back to an empty name", () => {
    const [i] = viewItems(
      input({ leads: [{ id: "n", state: lead({ name: null }) }] }),
    );
    expect(i.name).toBe("");
  });
});

describe("mine", () => {
  it("keeps what the address owns, ignoring letter case", () => {
    expect(
      mine(items, ALICE.toUpperCase().replace("0X", "0x")).map((i) => i.id),
    ).toEqual(["l1", "o2", "d1"]);
  });
});

describe("filterItems", () => {
  it("filters by kind", () =>
    expect(
      filterItems(items, { kind: "opportunity" }).map((i) => i.id),
    ).toEqual(["o1", "o2"]));
  it("filters by owner", () =>
    expect(filterItems(items, { owner: BOB }).map((i) => i.id)).toEqual([
      "o1",
    ]));
  it("filters by status", () =>
    expect(filterItems(items, { status: "LOST" }).map((i) => i.id)).toEqual([
      "l2",
    ]));
  it("combines filters and keeps everything with none", () => {
    expect(
      filterItems(items, { kind: "lead", owner: ALICE }).map((i) => i.id),
    ).toEqual(["l1"]);
    expect(filterItems(items, {})).toHaveLength(5);
  });
});

describe("ownerName", () => {
  const team = [
    { id: "t1", name: "Ada Example", address: ALICE, active: true },
    { id: "t2", name: "Bo Sample", address: BOB, active: false },
  ];
  it("resolves an active member", () =>
    expect(ownerName(ALICE, team)).toEqual({
      address: ALICE,
      name: "Ada Example",
      active: true,
    }));
  it("resolves a deactivated member, ignoring letter case", () =>
    expect(ownerName(BOB.replace("b2", "B2"), team)).toEqual({
      address: BOB.replace("b2", "B2"),
      name: "Bo Sample",
      active: false,
    }));
  it("shows the address for someone not on the team list", () =>
    expect(ownerName("0xfeed", team)).toEqual({
      address: "0xfeed",
      name: "0xfeed",
      active: false,
    }));
  it("is null without an owner", () =>
    expect(ownerName(null, team)).toBeNull());
});

describe("viewItems: unnamed and unowned", () => {
  it("falls back for an opportunity and a decision without name or owner", () => {
    const got = viewItems(
      input({
        opportunities: [
          { id: "o", state: opportunity({ name: null, owner: null }) },
        ],
        decisions: [
          { id: "d", state: decision({ question: null, owner: null }) },
        ],
      }),
    );
    expect(got.map((i) => [i.name, i.owner])).toEqual([
      ["", null],
      ["", null],
    ]);
  });
});
