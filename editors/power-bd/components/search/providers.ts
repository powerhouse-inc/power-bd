import { useEffect, useState } from "react";
import type { ExtraGroup, SearchProvider } from "../../kit/search/index.js";
import { useVaultPaletteSource } from "../vault/useVault.js";
import { vaultSearch } from "../vault/vault.js";

/**
 * Other sources the palette also asks, each shown as a group of its own after
 * the records (see `SearchProvider` in `kit/search/types.ts`). The vault's
 * notes are one: a few of them, under "Notes in the vault", from the vault
 * named in this space's Settings; choosing one opens it in the vault app.
 */
export const SEARCH_PROVIDERS: readonly SearchProvider[] = [
  vaultSearch.provider,
];

/** How long typing must rest before another source is asked. */
const REST_MS = 200;

/** What the registered sources found for `query`; nothing while they are still asked. */
export function useProviderGroups(
  providers: readonly SearchProvider[],
  query: string,
): ExtraGroup[] {
  const [found, setFound] = useState<{ query: string; groups: ExtraGroup[] }>();
  const wanted = query.trim();
  // The vault's provider searches the vault this space's Settings name.
  const vault = useVaultPaletteSource();

  useEffect(() => {
    if (providers.length === 0 || !wanted) return;
    const abort = new AbortController();
    const timer = setTimeout(() => {
      void Promise.all(
        providers.map(async (p) => ({
          id: p.id,
          label: p.label,
          // A source that fails shows no group; the records' results stay.
          entries: await p.search(wanted, abort.signal).catch(() => []),
        })),
      ).then((groups) => {
        if (!abort.signal.aborted) setFound({ query: wanted, groups });
      });
    }, REST_MS);
    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, [providers, wanted, vault]);

  return found?.query === wanted ? found.groups : [];
}
