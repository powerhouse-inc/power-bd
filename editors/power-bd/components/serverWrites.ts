import {
  GET_MANY_CHUNK_SIZE,
  GraphQLReactorClient,
  ambientRenownSigner,
  ambientRenownTokenProvider,
  baseDocumentModels,
  makeAuthConnectionParams,
  phDocumentFromGetDocument,
  startDocumentChangesSubscription,
  subscriptionsUrlFromGraphqlUrl,
} from "@powerhousedao/reactor-browser";
import { addFolder, moveNode, setDriveIcon, updateNode } from "@powerhousedao/shared/document-drive";
import { generateId, setName, type PHDocument } from "document-model";
import type { DriveSource, LiveDrive } from "../kit/live-drive/live-drive.js";
import { documentModels } from "../../../document-models/document-models.js";

/**
 * Writes that go straight to a shared drive's server instead of through
 * Connect's copy of it.
 *
 * A Connect that keeps a copy sends new documents to the server later, as a
 * batch the server checks before the document's link to its drive exists:
 * it counts the document as protected with no grants and refuses the whole
 * batch from anyone who is not an admin of the server, and every change
 * behind it waits forever. Created here, a document is checked against the
 * drive it goes into, which every member who may write the drive passes.
 */
const clients = new Map<string, GraphQLReactorClient>();

/** The server's client, signed with the person's Renown identity; the agent's tools use it too. */
export function serverClient(base: string): GraphQLReactorClient {
  let client = clients.get(base);
  if (!client) {
    client = new GraphQLReactorClient({
      url: `${base}/graphql`,
      tokenProvider: ambientRenownTokenProvider,
      signer: ambientRenownSigner,
      documentModels: [...baseDocumentModels, ...documentModels],
      realtime: false,
    });
    clients.set(base, client);
  }
  return client;
}

/** Creates a document in the drive on its server, in `folderId` (top level when absent); returns its id. */
export async function createOnServer(
  base: string,
  driveId: string,
  name: string,
  documentType: string,
  folderId?: string,
): Promise<string> {
  const client = serverClient(base);
  const document = await client.newDocument(documentType, { parentIdentifier: driveId });
  document.header.name = name;
  const created = await client.create(document, driveId);
  const id = created.header.id;
  if (folderId)
    await client.execute(driveId, "main", [moveNode({ srcFolder: id, targetParentFolder: folderId })]);
  return id;
}

/** Adds folders at the drive's top level on its server, in one change. */
export async function addFoldersOnServer(
  base: string,
  driveId: string,
  names: readonly string[],
): Promise<void> {
  await serverClient(base).execute(
    driveId,
    "main",
    names.map((name) => addFolder({ id: generateId(), name, parentFolder: null })),
  );
}

/** Sets the drive's icon on its server. */
export async function setIconOnServer(base: string, driveId: string, icon: string): Promise<void> {
  await serverClient(base).execute(driveId, "main", [setDriveIcon({ icon })]);
}

/** The drive's server as the live copy reads and writes it. */
export function serverDriveSource(base: string, driveId: string): DriveSource {
  const client = serverClient(base);
  const one = (id: string) => client.get<PHDocument>(id);
  return {
    getDrive: () => one(driveId),
    getMany: async (ids) => {
      const out: PHDocument[] = [];
      for (let i = 0; i < ids.length; i += GET_MANY_CHUNK_SIZE) {
        const chunk = ids.slice(i, i + GET_MANY_CHUNK_SIZE);
        try {
          out.push(...(await client.getMany<PHDocument>([...chunk])));
        } catch {
          // One refused or missing record fails a batch: ask one by one and keep the rest.
          const settled = await Promise.allSettled(chunk.map(one));
          for (const s of settled) if (s.status === "fulfilled") out.push(s.value);
        }
      }
      return out;
    },
    execute: (id, actions) => client.execute<PHDocument>(id, "main", [...actions]),
  };
}

/** Renames a record and its entry in the drive, on the server, as Connect's `renameDriveNode` does. */
export async function renameOnServer(base: string, driveId: string, id: string, name: string): Promise<void> {
  const client = serverClient(base);
  await client.execute(id, "main", [setName({ name })]);
  await client.execute(driveId, "main", [updateNode({ id, name })]);
}

/**
 * Listens to the server's change feed and hands this drive's changes to its
 * live copy. The feed carries every document the server changes, whole, so
 * only this drive and its records are taken. `onEvent` hears every event (the
 * feed is alive); `onDown` hears when it gave up.
 */
export function startLiveFeed(
  base: string,
  driveId: string,
  live: LiveDrive,
  { onEvent, onDown }: { onEvent: () => void; onDown: (error: unknown) => void },
): () => void {
  return startDocumentChangesSubscription({
    wsUrl: subscriptionsUrlFromGraphqlUrl(`${base}/graphql`),
    connectionParams: makeAuthConnectionParams(ambientRenownTokenProvider),
    onEvent: (event) => {
      onEvent();
      const parentId = event.context?.parentId ?? null;
      const mine = event.documents.filter((d) => live.holds(d.id));
      if (mine.length === 0 && parentId !== driveId) return;
      void live.change({
        type: event.type,
        documents: mine.map((d) => phDocumentFromGetDocument(d)),
        parentId,
      });
    },
    onError: onDown,
  });
}
