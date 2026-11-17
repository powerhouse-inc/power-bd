import type { SearchResult } from "./client.js";
import type { NoteInfo } from "./model.js";
import {
  SEARCH_RULES,
  activeIndex,
  moveIndex,
  pickerOptions,
  pickerPhase,
  searchText,
  typedNote,
} from "./search.js";

const hit = (id: string, title: string | null = `Note ${id}`): NoteInfo => ({
  id,
  title,
  description: `About ${id}`,
  kind: "Reference",
  icon: "note",
});

describe("searchText", () => {
  it("sends what was typed, tidied, once it is long enough", () => {
    expect(searchText("  how   many\tattempts ")).toBe("how many attempts");
    expect(searchText("ab")).toBe("ab");
    expect(searchText(" a ")).toBeNull();
    expect(searchText("")).toBeNull();
    expect(SEARCH_RULES.minChars).toBe(2);
  });
});

describe("pickerOptions", () => {
  it("marks the notes already linked, and names an untitled note", () => {
    expect(pickerOptions([hit("a"), hit("b", null)], ["a"])).toEqual([
      { ...hit("a"), linked: true },
      { ...hit("b"), title: "Untitled note", linked: false },
    ]);
  });
});

describe("pickerPhase", () => {
  const ok = (...hits: NoteInfo[]): SearchResult => ({
    ok: true,
    mode: "semantic",
    hits,
  });

  it("can't search without a vault, and says so", () => {
    expect(
      pickerPhase({
        vaultDriveId: null,
        query: "attempts",
        last: null,
        linked: [],
      }),
    ).toEqual({
      phase: "unavailable",
      reason: "no-vault",
      why: "No vault is chosen in Settings, so it can't be searched. Type the note's id instead.",
    });
  });

  it("waits for enough typing", () => {
    expect(
      pickerPhase({ vaultDriveId: "v", query: "a", last: null, linked: [] }),
    ).toEqual({ phase: "idle" });
  });

  it("is searching until the answer for what is typed now arrives, still listing the last answer", () => {
    expect(
      pickerPhase({
        vaultDriveId: "v",
        query: "attempts",
        last: null,
        linked: [],
      }),
    ).toEqual({
      phase: "searching",
      text: "attempts",
      options: [],
    });
    expect(
      pickerPhase({
        vaultDriveId: "v",
        query: "attempts!",
        last: { text: "attempts", result: ok(hit("a")) },
        linked: ["a"],
      }),
    ).toEqual({
      phase: "searching",
      text: "attempts!",
      options: [{ ...hit("a"), linked: true }],
    });
    expect(
      pickerPhase({
        vaultDriveId: "v",
        query: "attempts!",
        last: {
          text: "attempts",
          result: { ok: false, reason: "unreachable" },
        },
        linked: [],
      }),
    ).toEqual({ phase: "searching", text: "attempts!", options: [] });
  });

  it("lists what the vault found", () => {
    expect(
      pickerPhase({
        vaultDriveId: "v",
        query: " attempts ",
        last: { text: "attempts", result: ok(hit("a"), hit("b")) },
        linked: ["b"],
      }),
    ).toEqual({
      phase: "found",
      text: "attempts",
      options: [
        { ...hit("a"), linked: false },
        { ...hit("b"), linked: true },
      ],
    });
  });

  it("says when nothing matched", () => {
    expect(
      pickerPhase({
        vaultDriveId: "v",
        query: "zebra",
        last: { text: "zebra", result: ok() },
        linked: [],
      }),
    ).toEqual({
      phase: "none",
      text: "zebra",
      line: "No note in the vault matches “zebra”.",
    });
  });

  it("says why the vault could not be searched", () => {
    expect(
      pickerPhase({
        vaultDriveId: "v",
        query: "zebra",
        last: { text: "zebra", result: { ok: false, reason: "signed-out" } },
        linked: [],
      }),
    ).toEqual({
      phase: "unavailable",
      reason: "signed-out",
      why: "Sign in to search the vault. Or type the note's id instead.",
    });
  });
});

describe("moveIndex", () => {
  it("walks the options with the arrow keys, round the ends", () => {
    expect(moveIndex(3, -1, "ArrowDown")).toBe(0);
    expect(moveIndex(3, 2, "ArrowDown")).toBe(0);
    expect(moveIndex(3, 0, "ArrowUp")).toBe(2);
    expect(moveIndex(3, -1, "ArrowUp")).toBe(2);
    expect(moveIndex(3, 1, "ArrowUp")).toBe(0);
  });

  it("leaves other keys to the field (Home and End move the caret), and has nowhere to go without options", () => {
    expect(moveIndex(3, 1, "a")).toBeUndefined();
    expect(moveIndex(3, 1, "Home")).toBeUndefined();
    expect(moveIndex(3, 1, "End")).toBeUndefined();
    expect(moveIndex(0, -1, "ArrowDown")).toBe(-1);
  });
});

describe("activeIndex", () => {
  it("is the option the arrows are on, or else the first that can be linked: where Enter goes, so it is filled", () => {
    const options = pickerOptions([hit("a"), hit("b"), hit("c")], ["a"]);
    expect(activeIndex(options, 2)).toBe(2);
    expect(activeIndex(options, 0)).toBe(0);
    expect(activeIndex(options, -1)).toBe(1);
    // Chosen in a longer list that has since shrunk.
    expect(activeIndex(options, 5)).toBe(1);
    expect(activeIndex(pickerOptions([hit("a")], ["a"]), -1)).toBe(-1);
    expect(activeIndex([], -1)).toBe(-1);
  });
});

describe("typedNote", () => {
  it("takes a typed id and title, both required", () => {
    expect(typedNote("  n-1 ", " Programme rules ")).toEqual({
      id: "n-1",
      title: "Programme rules",
    });
    expect(typedNote("n-1", " ")).toBeNull();
    expect(typedNote("", "Programme rules")).toBeNull();
  });
});
