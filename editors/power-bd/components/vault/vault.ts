import {
  DEFAULT_REQUEST_TIMEOUT_MS,
  ambientRenownTokenProvider,
  getDriveNode,
  getNodeTarget,
  getPHStore,
  openTarget,
  resolveSwitchboard,
  subgraphUrlFromGraphqlUrl,
  withRequestDeadline,
} from "@powerhousedao/reactor-browser";
import {
  OPEN_WHY,
  createNoteStore,
  createVaultClient,
  createVaultSearch,
  type NoteTarget,
} from "../../kit/vault/index.js";

/** The vault package's knowledge-graph subgraph, served next to its Switchboard's GraphQL. */
const KNOWLEDGE_GRAPH = "knowledgeGraph";

/**
 * Reads the vault as the person signed in to Connect: the vault drive's
 * Switchboard comes from Connect's own directory, and their Renown token goes
 * with each request (none when signed out, so an open vault still answers).
 * A vault that has not answered by the stack's request deadline counts as
 * unreachable, so a link or a search never waits for ever.
 */
export const vaultClient = createVaultClient({
  fetch: withRequestDeadline(DEFAULT_REQUEST_TIMEOUT_MS),
  endpoint: async (driveId, signal) => {
    const switchboard = await resolveSwitchboard(getPHStore()?.switchboards, {
      documentId: driveId,
      signal,
    });
    return subgraphUrlFromGraphqlUrl(switchboard.graphqlUrl, KNOWLEDGE_GRAPH);
  },
  token: ambientRenownTokenProvider,
});

/** Every linked note on the page, asked about together. */
export const noteStore = createNoteStore({
  lookup: (driveId, ids) => vaultClient.lookup(driveId, ids),
});

/**
 * Opens a note in the vault app: Connect switches to the vault's drive with
 * the note open there. When that can't be done from this browser, a toast
 * says why instead of leaving the click unanswered.
 */
export async function openVaultNote({
  driveId,
  noteId,
}: NoteTarget): Promise<void> {
  const store = getPHStore();
  const drive = store?.drives?.find((d) => d.header.id === driveId);
  const node = drive
    ? await getDriveNode(driveId, noteId, store ? { store } : undefined)
    : undefined;
  const target = drive && node ? getNodeTarget(node, drive) : undefined;
  if (target) openTarget(target);
  else
    store?.toast?.(drive ? OPEN_WHY.notListed : OPEN_WHY.notOpenHere, {
      type: "warning",
    });
}

/** The ⌘K palette's vault group (registered in `components/search/providers.ts`). */
export const vaultSearch = createVaultSearch({
  open: (target) => {
    void openVaultNote(target);
  },
});
