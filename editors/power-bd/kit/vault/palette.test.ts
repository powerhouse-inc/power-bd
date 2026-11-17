import type { SearchResult } from "./client.js";
import type { NoteInfo } from "./model.js";
import {
  VAULT_GROUP_LABEL,
  VAULT_PROVIDER_ID,
  createVaultSearch,
  noteRef,
  parseNoteRef,
  vaultEntries,
} from "./palette.js";
import { SEARCH_RULES } from "./search.js";

const hit = (id: string, over: Partial<NoteInfo> = {}): NoteInfo => ({
  id,
  title: `Note ${id}`,
  description: `About ${id}`,
  kind: "Reference",
  icon: "note",
  ...over,
});

describe("noteRef", () => {
  it("carries the vault and the note, and reads back", () => {
    const ref = noteRef("vault-1", "note-1");
    expect(parseNoteRef(ref)).toEqual({ driveId: "vault-1", noteId: "note-1" });
  });

  it("reads nothing from a ref it did not write", () => {
    for (const ref of [
      "",
      "note-1",
      "{",
      "[]",
      "null",
      '{"driveId":"v"}',
      '{"driveId":1,"noteId":"n"}',
      '{"driveId":"","noteId":"n"}',
    ])
      expect(parseNoteRef(ref)).toBeNull();
  });
});

describe("vaultEntries", () => {
  it("lists each note as a result of the vault's own group", () => {
    expect(
      vaultEntries("vault-1", [
        hit("a"),
        hit("b", {
          title: null,
          kind: null,
          description: null,
          icon: "compass",
        }),
      ]),
    ).toEqual([
      {
        key: "vault:a",
        group: VAULT_PROVIDER_ID,
        icon: "note",
        title: "Note a",
        detail: "Reference",
        fields: [{ label: "Description", text: "About a" }],
        tag: null,
        target: {
          type: "provider",
          providerId: VAULT_PROVIDER_ID,
          ref: noteRef("vault-1", "a"),
        },
        changedAt: null,
      },
      {
        key: "vault:b",
        group: VAULT_PROVIDER_ID,
        icon: "compass",
        title: "Untitled note",
        detail: "Note in the vault",
        fields: [],
        tag: null,
        target: {
          type: "provider",
          providerId: VAULT_PROVIDER_ID,
          ref: noteRef("vault-1", "b"),
        },
        changedAt: null,
      },
    ]);
    expect(VAULT_GROUP_LABEL).toBe("Notes in the vault");
  });
});

describe("createVaultSearch", () => {
  const signal = new AbortController().signal;
  const source = (result: SearchResult) => {
    const search = vi.fn(
      (_text: string, _limit: number, _signal: AbortSignal) =>
        Promise.resolve(result),
    );
    return { driveId: "vault-1", search };
  };

  it("is the palette's vault group", () => {
    const { provider } = createVaultSearch({ open: () => {} });
    expect(provider.id).toBe(VAULT_PROVIDER_ID);
    expect(provider.label).toBe(VAULT_GROUP_LABEL);
  });

  it("finds nothing until a vault is chosen", async () => {
    const { provider } = createVaultSearch({ open: () => {} });
    expect(await provider.search("attempts", signal)).toEqual([]);
  });

  it("asks the vault named in Settings, a few results at most", async () => {
    const vault = createVaultSearch({ open: () => {} });
    const s = source({ ok: true, mode: "semantic", hits: [hit("a")] });
    vault.setSource(s);
    const entries = await vault.provider.search(
      "  how many   attempts ",
      signal,
    );
    expect(s.search).toHaveBeenCalledWith(
      "how many attempts",
      SEARCH_RULES.paletteLimit,
      signal,
    );
    expect(entries.map((e) => e.key)).toEqual(["vault:a"]);
  });

  it("does not ask for a word too short to search", async () => {
    const vault = createVaultSearch({ open: () => {} });
    const s = source({ ok: true, mode: "semantic", hits: [hit("a")] });
    vault.setSource(s);
    expect(await vault.provider.search("a", signal)).toEqual([]);
    expect(s.search).not.toHaveBeenCalled();
  });

  it("shows no group when the vault could not be searched", async () => {
    const vault = createVaultSearch({ open: () => {} });
    vault.setSource(source({ ok: false, reason: "forbidden" }));
    expect(await vault.provider.search("attempts", signal)).toEqual([]);
    vault.setSource(null);
    expect(await vault.provider.search("attempts", signal)).toEqual([]);
  });

  it("opens the chosen note in its vault, and ignores a ref it can't read", () => {
    const open = vi.fn();
    const { provider } = createVaultSearch({ open });
    provider.open(noteRef("vault-1", "note-1"));
    provider.open("not a ref");
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith({ driveId: "vault-1", noteId: "note-1" });
  });
});
