import { searchEntries } from "./entries.js";
import { space } from "./fixtures.js";
import {
  GROUP_CAP,
  QUICK_ACTIONS,
  RECENT_COUNT,
  isShortcut,
  itemIds,
  moveActive,
  noResultsLine,
  paletteSections,
  placeOf,
  recentEntries,
  shortcutKeys,
  type Item,
  type Section,
} from "./palette.js";
import type { Entry } from "./types.js";

const entries = searchEntries(space());
const titles = (s: Section) =>
  s.items.map((i) =>
    i.type === "result"
      ? i.hit.entry.title
      : i.type === "action"
        ? i.action.label
        : `+${i.count}`,
  );
const many = (n: number, group = "lead"): Entry[] =>
  Array.from({ length: n }, (_, i) => ({
    key: `${group}:${i}`,
    group,
    icon: "leads" as const,
    title: `Quay ${String(i).padStart(2, "0")}`,
    detail: null,
    fields: [],
    tag: null,
    target: { type: "record" as const, id: `${group}-${i}` },
    changedAt: null,
  }));

describe("recentEntries", () => {
  it("lists the records changed last, newest first, and nothing that is not a record", () => {
    expect(recentEntries(entries).map((e) => e.key)).toEqual([
      "proposal:prop-1",
      "lead:lead-1",
      "opportunity:opp-1",
      "decision:dec-1",
      "lead:lead-2",
    ]);
    expect(RECENT_COUNT).toBe(5);
    expect(recentEntries(entries, 2)).toHaveLength(2);
  });
});

describe("paletteSections: nothing typed", () => {
  const sections = paletteSections({ entries, query: "  " });

  it("shows recent records, then what can be started", () => {
    expect(sections.map((s) => s.label)).toEqual([
      "Recent",
      "Start something new",
    ]);
    expect(titles(sections[0])).toEqual([
      "Tide sensor pilot",
      "Pilot with Brisa Labs",
      "Harbour Innovation Fund, round 3",
      "Which entity applies to EU calls?",
      "Untitled lead",
    ]);
    expect(titles(sections[1])).toEqual([
      "New lead",
      "New funding opportunity",
      "New organisation",
    ]);
    expect(QUICK_ACTIONS.map((a) => a.id)).toEqual([
      "new-lead",
      "new-opportunity",
      "new-organisation",
    ]);
  });

  it("leaves Recent out of a space with no records yet", () => {
    expect(
      paletteSections({ entries: [], query: "" }).map((s) => s.label),
    ).toEqual(["Start something new"]);
  });
});

describe("paletteSections: a query", () => {
  it("groups results by kind, in a fixed order, with the kind's plural name", () => {
    const sections = paletteSections({ entries, query: "brisa" });
    expect(sections.map((s) => [s.label, s.items.length])).toEqual([
      ["Leads", 1],
      ["Funding opportunities", 1],
      ["Proposals", 1],
      ["Organisations", 1],
      ["People", 2],
      ["Investors", 1],
    ]);
    expect(sections[0].id).toBe("lead");
  });

  it("keeps the ranking inside a group", () => {
    const [people] = paletteSections({ entries, query: "brisa" }).filter(
      (s) => s.id === "person",
    );
    expect(titles(people)).toEqual(["Inês Caldeira", "Rui Fontes"]);
  });

  it("caps a group and counts the rest", () => {
    const sections = paletteSections({ entries: many(9), query: "quay" });
    expect(GROUP_CAP).toBe(5);
    expect(titles(sections[0])).toEqual([
      "Quay 00",
      "Quay 01",
      "Quay 02",
      "Quay 03",
      "Quay 04",
      "+4",
    ]);
    const more = sections[0].items.at(-1);
    expect(more).toMatchObject({ type: "more", group: "lead", label: "4 more leads" });
  });

  it("shows one over the cap whole: a row saying \"1 more\" would cost the same line", () => {
    const [s] = paletteSections({ entries: many(6), query: "quay" });
    expect(s.items).toHaveLength(6);
    expect(s.items.every((i) => i.type === "result")).toBe(true);
  });

  it("shows a group whole once it is expanded", () => {
    const [s] = paletteSections({
      entries: many(9),
      query: "quay",
      expanded: ["lead"],
    });
    expect(s.items).toHaveLength(9);
  });

  it("offers a quick action whose words were typed", () => {
    const sections = paletteSections({ entries, query: "new org" });
    expect(sections.map((s) => s.label)).toEqual(["Start something new"]);
    expect(titles(sections[0])).toEqual(["New organisation"]);
  });

  it("returns no section when nothing matches", () => {
    expect(paletteSections({ entries, query: "zzzz" })).toEqual([]);
  });

  it("gives every item its own id, safe for an element id", () => {
    const ids = itemIds(paletteSections({ entries, query: "brisa" }));
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

describe("paletteSections: results of another source", () => {
  const note: Entry = {
    key: "vault:n1",
    group: "vault",
    icon: "note",
    title: "Brisa Labs: call notes",
    detail: null,
    fields: [],
    tag: null,
    target: { type: "provider", providerId: "vault", ref: "n1" },
    changedAt: null,
  };

  it("adds a group of its own after the records, capped the same way", () => {
    const sections = paletteSections({
      entries,
      query: "brisa",
      extra: [{ id: "vault", label: "Notes in the vault", entries: [note] }],
    });
    const last = sections.at(-1);
    expect(last?.label).toBe("Notes in the vault");
    expect(last && titles(last)).toEqual(["Brisa Labs: call notes"]);
    const capped = paletteSections({
      entries: [],
      query: "quay",
      extra: [{ id: "vault", label: "Notes in the vault", entries: many(8, "vault") }],
    });
    expect(capped[0].items.at(-1)).toMatchObject({
      type: "more",
      label: "3 more",
    });
  });

  it("shows no group for a source that found nothing, and none without a query", () => {
    const extra = [{ id: "vault", label: "Notes in the vault", entries: [] }];
    expect(
      paletteSections({ entries, query: "brisa", extra }).some(
        (s) => s.id === "vault",
      ),
    ).toBe(false);
    expect(
      paletteSections({
        entries,
        query: "",
        extra: [{ ...extra[0], entries: [note] }],
      }).some((s) => s.id === "vault"),
    ).toBe(false);
  });
});

describe("moveActive", () => {
  const sections = paletteSections({ entries, query: "brisa" });
  const ids = itemIds(sections);

  it("starts on the first result", () => {
    expect(moveActive(sections, null, "ArrowDown")).toBe(ids[0]);
    expect(moveActive(sections, "gone", "ArrowDown")).toBe(ids[0]);
    expect(moveActive(sections, null, "ArrowUp")).toBe(ids.at(-1));
  });

  it("moves down and up across groups and wraps at the ends", () => {
    expect(moveActive(sections, ids[0], "ArrowDown")).toBe(ids[1]);
    expect(moveActive(sections, ids[1], "ArrowUp")).toBe(ids[0]);
    expect(moveActive(sections, ids.at(-1) ?? null, "ArrowDown")).toBe(ids[0]);
    expect(moveActive(sections, ids[0], "ArrowUp")).toBe(ids.at(-1));
  });

  it("jumps to the ends with Page Up and Page Down", () => {
    expect(moveActive(sections, ids[2], "PageUp")).toBe(ids[0]);
    expect(moveActive(sections, ids[2], "PageDown")).toBe(ids.at(-1));
  });

  it("leaves other keys alone, and has nowhere to go without results", () => {
    expect(moveActive(sections, ids[0], "a")).toBeUndefined();
    expect(moveActive(sections, ids[0], "Home")).toBeUndefined();
    expect(moveActive([], null, "ArrowDown")).toBeNull();
  });
});

describe("noResultsLine", () => {
  it("names what was typed and where search looks", () => {
    expect(noResultsLine("  zzzz ")).toEqual({
      title: "Nothing matches “zzzz”",
      text: "Search looks at names, organisations, people, next steps, proposal codes and statuses. Try fewer or shorter words.",
    });
  });
});

describe("items", () => {
  it("carry what a row needs", () => {
    const [first] = paletteSections({ entries, query: "pilot outline" })[0]
      .items;
    expect(first).toMatchObject({
      type: "result",
      hit: { field: { label: "Next step" } },
    });
  });
});

describe("placeOf", () => {
  it("names the place each kind of result lives in", () => {
    expect(
      ["lead", "opportunity", "proposal", "organisation", "person", "investor", "decision", "playbook"].map(placeOf),
    ).toEqual([
      "leads",
      "funding",
      "proposals",
      "organisations",
      "organisations",
      "investors",
      "decisions",
      "playbook",
    ]);
  });

  it("has no place for the results of another source", () => {
    expect(placeOf("vault")).toBeNull();
  });

  it("names the place a quick action's record lands in", () => {
    expect(QUICK_ACTIONS.map((a) => a.place)).toEqual([
      "leads",
      "funding",
      "organisations",
    ]);
  });
});

describe("shortcutKeys", () => {
  it("shows the key the person's keyboard has", () => {
    expect(shortcutKeys("MacIntel")).toEqual(["⌘", "K"]);
    expect(shortcutKeys("iPad")).toEqual(["⌘", "K"]);
    expect(shortcutKeys("Linux x86_64")).toEqual(["Ctrl", "K"]);
    expect(shortcutKeys("")).toEqual(["Ctrl", "K"]);
  });

  it("knows the shortcut when it is pressed", () => {
    expect(isShortcut({ key: "k", metaKey: true, ctrlKey: false })).toBe(true);
    expect(isShortcut({ key: "K", metaKey: false, ctrlKey: true })).toBe(true);
    expect(isShortcut({ key: "k", metaKey: false, ctrlKey: false })).toBe(false);
    expect(isShortcut({ key: "j", metaKey: true, ctrlKey: false })).toBe(false);
    expect(
      isShortcut({ key: "k", metaKey: true, ctrlKey: false, altKey: true }),
    ).toBe(false);
  });
});
