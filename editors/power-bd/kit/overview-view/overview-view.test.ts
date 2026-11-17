import { describe, expect, it } from "vitest";
import type {
  Board,
  DueItem,
  SlippingItem,
  ViewItem,
} from "../overview/index.js";
import {
  dueForMe,
  groupDueByDay,
  openOpportunities,
  slippingForMe,
  visibleBoard,
} from "./index.js";

const ref = (kind: ViewItem["kind"], id: string, name = id) => ({
  kind,
  id,
  name,
});
const items: ViewItem[] = [
  { ...ref("lead", "l1"), status: "IN_TOUCH", owner: "0xAA" },
  { ...ref("opportunity", "o1"), status: "PREPARING", owner: "0xbb" },
  { ...ref("decision", "d1"), status: "OPEN", owner: null },
];
const board: Board = {
  NEW: [{ ...ref("lead", "l1"), stage: "NEW" }],
  ACTIVE: [
    { ...ref("opportunity", "o1"), stage: "ACTIVE" },
    { ...ref("investor-row", "i1"), rowId: "r1", stage: "ACTIVE" },
  ],
  PARKED: [],
  CLOSED: [{ ...ref("opportunity", "o2"), stage: "CLOSED" }],
};

describe("slippingForMe", () => {
  const slipping: SlippingItem[] = [
    { source: ref("lead", "l1"), reasons: ["NO_NEXT_STEP"], since: {} },
    { source: ref("decision", "d1"), reasons: ["NO_OWNER"], since: {} },
  ];
  it("keeps everything without an address", () => {
    expect(slippingForMe(slipping, items, null)).toHaveLength(2);
  });
  it("keeps what the address owns, ignoring letter case", () => {
    expect(slippingForMe(slipping, items, "0xaa")).toEqual([slipping[0]]);
  });
});

describe("dueForMe", () => {
  const due = [{ people: ["0xAA"] }, { people: ["0xcc"] }] as DueItem[];
  it("keeps what concerns the address", () => {
    expect(dueForMe(due, "0xaa")).toEqual([due[0]]);
    expect(dueForMe(due, null)).toHaveLength(2);
  });
});

describe("groupDueByDay", () => {
  it("groups in day order", () => {
    const due = [
      { day: "2026-11-18", label: "b" },
      { day: "2026-11-17", label: "a" },
      { day: "2026-11-18", label: "c" },
    ] as DueItem[];
    const g = groupDueByDay(due);
    expect(g.map((x) => x.day)).toEqual(["2026-11-17", "2026-11-18"]);
    expect(g[1].items.map((i) => i.label)).toEqual(["b", "c"]);
  });
});

describe("openOpportunities", () => {
  it("leaves out the closed ones", () => {
    const opps = [{ id: "o1" }, { id: "o2" }];
    expect(openOpportunities(opps, board)).toEqual([{ id: "o1" }]);
  });
});

describe("visibleBoard", () => {
  it("shows all with no filter", () => {
    expect(visibleBoard(board, items, {}).ACTIVE).toHaveLength(2);
  });
  it("filters by kind, including investor rows", () => {
    const b = visibleBoard(board, items, { kind: "investor-row" });
    expect(b.ACTIVE.map((e) => e.id)).toEqual(["i1"]);
    expect(b.NEW).toEqual([]);
  });
  it("owner and status filters drop entries that cannot match", () => {
    const b = visibleBoard(board, items, { owner: "0xAA" });
    expect(b.NEW.map((e) => e.id)).toEqual(["l1"]);
    expect(b.ACTIVE).toEqual([]);
    expect(b.CLOSED).toEqual([]);
  });
});
