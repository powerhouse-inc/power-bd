import { searchEntries } from "./entries.js";
import { space, spaceWithConfidential } from "./fixtures.js";
import { excerpt, marks, normalise, queryWords, search } from "./match.js";
import type { Entry } from "./types.js";

const entries = searchEntries(space());
const keys = (query: string, from: readonly Entry[] = entries) =>
  search(from, query).map((h) => h.entry.key);

const entry = (over: Partial<Entry>): Entry => ({
  key: "k",
  group: "lead",
  icon: "leads",
  title: "Title",
  detail: null,
  fields: [],
  tag: null,
  target: { type: "record", id: "k" },
  changedAt: null,
  ...over,
});

describe("normalise and queryWords", () => {
  it("drops case and accents", () => {
    expect(normalise("Inês CALDEIRA")).toBe("ines caldeira");
    expect(normalise("Zürich Café")).toBe("zurich cafe");
  });

  it("splits a query on spaces and drops repeats and blanks", () => {
    expect(queryWords("  Brisa   LABS brisa ")).toEqual(["brisa", "labs"]);
    expect(queryWords("   ")).toEqual([]);
  });
});

describe("search", () => {
  it("finds nothing for an empty query", () => {
    expect(search(entries, "")).toEqual([]);
    expect(search(entries, "   ")).toEqual([]);
  });

  it("matches titles whatever the case or accents typed", () => {
    expect(keys("INES")).toContain("person:org-1:p1");
    expect(keys("inês")).toContain("person:org-1:p1");
    expect(keys("caldéira")).toContain("person:org-1:p1");
  });

  it("matches an organisation's name on its lead, proposal and investor row", () => {
    const found = keys("brisa");
    expect(found).toEqual(
      expect.arrayContaining([
        "lead:lead-1",
        "organisation:org-1",
        "person:org-1:p1",
        "person:org-1:p2",
        "proposal:prop-1",
        "investor:r2",
        "opportunity:opp-1",
      ]),
    );
    expect(found).not.toContain("decision:dec-1");
  });

  it("matches a next step, a person, a short code, a funder and a status label", () => {
    expect(keys("pilot outline")).toEqual(["lead:lead-1"]);
    expect(keys("rui")).toEqual(
      expect.arrayContaining(["person:org-1:p2", "proposal:prop-1"]),
    );
    expect(keys("bri-26-01")).toEqual(["proposal:prop-1"]);
    expect(keys("BRI 26")).toEqual(["proposal:prop-1"]);
    expect(keys("harbour foundation")).toEqual([
      "organisation:org-2",
      "opportunity:opp-1",
      "proposal:prop-3",
    ]);
    expect(keys("in touch")).toContain("lead:lead-1");
    expect(keys("shortlisted")).toEqual(["investor:r1"]);
  });

  it("never matches a stored value", () => {
    expect(keys("IN_TOUCH")).toEqual([]);
    expect(keys("to_evaluate")).toEqual([]);
  });

  it("needs every typed word, in any field and any order", () => {
    expect(keys("brisa sent")).toEqual(["proposal:prop-1"]);
    expect(keys("sent brisa")).toEqual(["proposal:prop-1"]);
    expect(keys("brisa nonsense")).toEqual([]);
  });

  it("says which field matched when it is not the title", () => {
    const [hit] = search(entries, "pilot outline");
    expect(hit.field).toEqual({
      label: "Next step",
      text: "Send the pilot outline",
    });
    const partner = search(entries, "brisa").find(
      (h) => h.entry.key === "opportunity:opp-1",
    );
    expect(partner?.field).toEqual({ label: "Partner", text: "Brisa Labs" });
  });

  it("names no field for a title match, or for one the row already shows", () => {
    const lead = search(entries, "brisa").find(
      (h) => h.entry.key === "lead:lead-1",
    );
    expect(lead?.field).toBeNull();
    // "In touch" is the tag on the row.
    const status = search(entries, "in touch").find(
      (h) => h.entry.key === "lead:lead-1",
    );
    expect(status?.field).toBeNull();
    // The quiet line already reads "BRI-26-01 · Pilot with Brisa Labs".
    const code = search(entries, "bri-26").find(
      (h) => h.entry.key === "proposal:prop-1",
    );
    expect(code?.field).toBeNull();
    // The quiet line already reads "Brisa Labs".
    const person = search(entries, "labs").find(
      (h) => h.entry.key === "person:org-1:p2",
    );
    expect(person?.field).toBeNull();
  });

  it("names the owner by name when the name matched", () => {
    const hit = search(entries, "mara").find(
      (h) => h.entry.key === "lead:lead-1",
    );
    expect(hit?.field).toEqual({ label: "Owner", text: "Mara Lind" });
  });

  it("ranks a title that starts with the query, then other title matches, then other fields", () => {
    const list = [
      entry({ key: "field", title: "Zeta", fields: [{ label: "Notes", text: "harbour" }] }),
      entry({ key: "inside", title: "The harbour fund" }),
      entry({ key: "starts", title: "Harbour fund" }),
      entry({ key: "split", title: "Fund", fields: [{ label: "Notes", text: "harbour" }] }),
    ];
    expect(keys("harbour", list)).toEqual([
      "starts",
      "inside",
      "split",
      "field",
    ]);
    expect(keys("harbour fund", list)).toEqual([
      "starts",
      "inside",
      "split",
    ]);
  });

  it("breaks ties by what changed last, then by title", () => {
    const list = [
      entry({ key: "b", title: "Beta pier" }),
      entry({ key: "old", title: "Old pier", changedAt: "2026-01-01T00:00:00.000Z" }),
      entry({ key: "a", title: "Alpha pier" }),
      entry({ key: "new", title: "New pier", changedAt: "2026-06-01T00:00:00.000Z" }),
    ];
    expect(keys("pier", list)).toEqual(["new", "old", "a", "b"]);
  });

  it("returns nothing for a word that appears only in a confidential item", () => {
    const withSecrets = searchEntries(spaceWithConfidential());
    for (const word of ["lock-in", "zephyrcorp", "jury chair", "quillfeather"])
      expect(search(withSecrets, word)).toEqual([]);
    // The records themselves are still found by what is not confidential.
    expect(keys("brisa", withSecrets)).toContain("lead:lead-1");
  });
});

describe("excerpt", () => {
  it("keeps a short text whole", () => {
    expect(excerpt("Send the pilot outline", ["pilot"])).toBe(
      "Send the pilot outline",
    );
  });

  it("cuts a long text around the first matching word, on word edges", () => {
    const long =
      "We met at the fair and talked for an hour about moorings, then about the harbour sensors they bought last year and why half of them failed in winter";
    const cut = excerpt(long, ["sensors"], 60);
    expect(cut).toContain("sensors");
    expect(cut.length).toBeLessThanOrEqual(62);
    expect(cut.startsWith("…")).toBe(true);
    expect(cut.endsWith("…")).toBe(true);
    expect(long).toContain(cut.slice(1, -1));
  });

  it("starts at the beginning when the match is early or absent", () => {
    const long = "Harbour sensors ".repeat(12).trim();
    expect(excerpt(long, ["harbour"], 40).startsWith("Harbour")).toBe(true);
    expect(excerpt(long, ["nothing"], 40).startsWith("Harbour")).toBe(true);
    expect(excerpt(long, [], 40).endsWith("…")).toBe(true);
  });

  it("cuts inside a word only when the text has no space to cut at", () => {
    expect(excerpt("a".repeat(200), ["a"], 40)).toBe(`${"a".repeat(40)}…`);
  });

  it("ends without an ellipsis when the cut reaches the end", () => {
    const long = `${"filler words ".repeat(10)}and at last the quay`;
    const cut = excerpt(long, ["quay"], 40);
    expect(cut.startsWith("…")).toBe(true);
    expect(cut.endsWith("quay")).toBe(true);
  });
});

describe("marks", () => {
  it("marks each typed word where it stands, accents kept", () => {
    expect(marks("Inês Caldeira", ["ines"])).toEqual([
      { text: "Inês", marked: true },
      { text: " Caldeira", marked: false },
    ]);
    expect(marks("Brisa Labs and Brisa Capital", ["brisa", "cap"])).toEqual([
      { text: "Brisa", marked: true },
      { text: " Labs and ", marked: false },
      { text: "Brisa", marked: true },
      { text: " ", marked: false },
      { text: "Cap", marked: true },
      { text: "ital", marked: false },
    ]);
  });

  it("marks nothing without words or without a match", () => {
    expect(marks("Brisa Labs", [])).toEqual([
      { text: "Brisa Labs", marked: false },
    ]);
    expect(marks("Brisa Labs", ["zzz"])).toEqual([
      { text: "Brisa Labs", marked: false },
    ]);
  });

  it("stays in step when a letter normalises to more than one", () => {
    // "İ" lower-cases to "i" plus a combining dot, which normalising drops.
    expect(marks("İstanbul port", ["port"])).toEqual([
      { text: "İstanbul ", marked: false },
      { text: "port", marked: true },
    ]);
    expect(marks("ǅ port", ["port"]).at(-1)).toEqual({
      text: "port",
      marked: true,
    });
  });
});
