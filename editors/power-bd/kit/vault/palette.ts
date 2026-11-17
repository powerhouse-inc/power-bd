/**
 * The vault's group in the ⌘K palette: a search provider (see
 * `SearchProvider` in `kit/search/types.ts`) that asks the vault named in
 * Settings and lists a few notes under their own label, so they are never
 * taken for BD records. Choosing one opens it in the vault app. Pure: the
 * search and the opening are handed in.
 */
import type { Entry, SearchProvider } from "../search/types.js";
import type { SearchResult } from "./client.js";
import type { NoteInfo } from "./model.js";
import { SEARCH_RULES, UNTITLED, searchText } from "./search.js";

export const VAULT_PROVIDER_ID = "vault";
export const VAULT_GROUP_LABEL = "Notes in the vault";

/** A note to open: which vault, which note. */
export interface NoteTarget {
  driveId: string;
  noteId: string;
}

/** The palette hands a chosen result back by its ref: this one carries the vault and the note. */
export function noteRef(driveId: string, noteId: string): string {
  return JSON.stringify({ driveId, noteId });
}

export function parseNoteRef(ref: string): NoteTarget | null {
  let value: unknown;
  try {
    value = JSON.parse(ref);
  } catch {
    return null;
  }
  if (typeof value !== "object" || value === null) return null;
  const { driveId, noteId } = value as { driveId?: unknown; noteId?: unknown };
  return typeof driveId === "string" &&
    driveId &&
    typeof noteId === "string" &&
    noteId
    ? { driveId, noteId }
    : null;
}

/** The vault's notes as palette results of their own group. */
export function vaultEntries(
  driveId: string,
  hits: readonly NoteInfo[],
): Entry[] {
  return hits.map((hit) => ({
    key: `vault:${hit.id}`,
    group: VAULT_PROVIDER_ID,
    icon: hit.icon,
    title: hit.title ?? UNTITLED,
    detail: hit.kind ?? "Note in the vault",
    fields: hit.description
      ? [{ label: "Description", text: hit.description }]
      : [],
    tag: null,
    target: {
      type: "provider",
      providerId: VAULT_PROVIDER_ID,
      ref: noteRef(driveId, hit.id),
    },
    changedAt: null,
  }));
}

/** The vault named in Settings, and how to search it. */
export interface VaultSearchSource {
  driveId: string;
  search: (
    text: string,
    limit: number,
    signal: AbortSignal,
  ) => Promise<SearchResult>;
}

/**
 * The palette's vault provider. The palette's providers are fixed, while the
 * vault is named in each space's Settings: `setSource` points the provider at
 * it, and with no source it finds nothing.
 */
export function createVaultSearch(deps: {
  open: (target: NoteTarget) => void;
}): {
  provider: SearchProvider;
  setSource: (source: VaultSearchSource | null) => void;
} {
  let source: VaultSearchSource | null = null;
  return {
    setSource(next) {
      source = next;
    },
    provider: {
      id: VAULT_PROVIDER_ID,
      label: VAULT_GROUP_LABEL,
      async search(query, signal) {
        const text = searchText(query);
        const vault = source;
        if (!text || !vault) return [];
        const result = await vault.search(
          text,
          SEARCH_RULES.paletteLimit,
          signal,
        );
        return result.ok ? vaultEntries(vault.driveId, result.hits) : [];
      },
      open(ref) {
        const target = parseNoteRef(ref);
        if (target) deps.open(target);
      },
    },
  };
}
