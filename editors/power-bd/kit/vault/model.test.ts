import {
  SEARCH_UNAVAILABLE,
  UNAVAILABLE,
  kindIcon,
  kindLabel,
  readNote,
} from "./model.js";

describe("kindLabel", () => {
  it("names a note's kind in plain words", () => {
    expect(kindLabel("REFERENCE", "bai/knowledge-note")).toBe("Reference");
    expect(kindLabel("OBSERVATION", "bai/knowledge-note")).toBe("Observation");
    expect(kindLabel("bug-pattern", null)).toBe("Bug pattern");
    expect(kindLabel("open_question", undefined)).toBe("Open question");
  });

  it("calls every map a map, whatever its tier", () => {
    expect(kindLabel("MOC (TOPIC)", "bai/moc")).toBe("Map");
    expect(kindLabel("MOC (HUB)", null)).toBe("Map");
    expect(kindLabel(null, "bai/moc")).toBe("Map");
  });

  it("calls a source a source", () => {
    expect(kindLabel(null, "bai/source")).toBe("Source");
    expect(kindLabel("SOURCE", "bai/source")).toBe("Source");
  });

  it("drops a tier in brackets and says nothing when there is no kind", () => {
    expect(kindLabel("SCOPE (ENVELOPE)", null)).toBe("Scope");
    expect(kindLabel("  ", "bai/knowledge-note")).toBe("Note");
    expect(kindLabel(null, null)).toBeNull();
    expect(kindLabel("()", "powerhouse/scopeofwork")).toBeNull();
  });
});

describe("kindIcon", () => {
  it("draws sources and maps apart from notes", () => {
    expect(kindIcon("bai/source")).toBe("source");
    expect(kindIcon("bai/moc")).toBe("compass");
    expect(kindIcon("bai/knowledge-note")).toBe("note");
    expect(kindIcon(null)).toBe("note");
  });
});

describe("readNote", () => {
  it("reads what the vault says about a note", () => {
    expect(
      readNote({
        documentId: " n-1 ",
        title: " Orvane counts every attempt ",
        description: "Three refusals bar the entity.",
        noteType: "REFERENCE",
        documentType: "bai/knowledge-note",
        status: "DRAFT",
      }),
    ).toEqual({
      id: "n-1",
      title: "Orvane counts every attempt",
      description: "Three refusals bar the entity.",
      kind: "Reference",
      icon: "note",
    });
  });

  it("keeps a note without a title or description, and leaves them empty", () => {
    expect(readNote({ documentId: "n-2", title: "", description: 7 })).toEqual({
      id: "n-2",
      title: null,
      description: null,
      kind: null,
      icon: "note",
    });
  });

  it("reads nothing from what is not a note", () => {
    expect(readNote(null)).toBeNull();
    expect(readNote("n-3")).toBeNull();
    expect(readNote([{ documentId: "n-4" }])).toBeNull();
    expect(readNote({ title: "No id" })).toBeNull();
    expect(readNote({ documentId: "   " })).toBeNull();
  });
});

describe("the reasons a note can't be read", () => {
  it("has a short line and an icon for each, in the reader's words", () => {
    expect(UNAVAILABLE["no-vault"].why).toBe("No vault is chosen in Settings");
    expect(UNAVAILABLE.missing.why).toBe("No longer in the vault");
    expect(UNAVAILABLE.forbidden.icon).toBe("lock");
    expect(UNAVAILABLE.unreachable.icon).toBe("cloud-off");
    for (const { why } of Object.values(UNAVAILABLE)) {
      expect(why).not.toMatch(/\b(id|PHID|document|drive|error)\b/i);
      expect(why.endsWith(".")).toBe(false);
    }
  });

  it("says why search can't run, and that an id can be typed instead", () => {
    expect(SEARCH_UNAVAILABLE["signed-out"]).toBe(
      "Sign in to search the vault.",
    );
    for (const line of Object.values(SEARCH_UNAVAILABLE))
      expect(line).not.toMatch(/\b(PHID|document|drive|error)\b/i);
  });
});
