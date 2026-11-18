/**
 * The stack's reactor tools (`@powerhousedao/reactor-mcp/tools`) on a shared
 * drive's Switchboard. Connect builds them on its own client, which for a
 * drive it keeps a copy of reads that copy (empty on a member's first visit)
 * and sends changes as sync batches the Switchboard refuses from anyone not
 * its admin. Power BD reads and writes a shared drive on its Switchboard
 * (components/data/driveData.tsx); this gives the agent's tools the same
 * client, signed with the person's own identity.
 *
 * The Switchboard's client lacks a few reads and writes the tools' client
 * type names; this fills them from what it has. The document models come
 * from Connect, which knows every package's.
 */
import type {
  IDriveWriteClient,
  IReactorClient,
  IReactorWriteClient,
  WriteHandle,
  WriteReceipt,
} from "@powerhousedao/reactor";
import type { ReactorToolClient } from "@powerhousedao/reactor-mcp/tools";
import { moveNode } from "@powerhousedao/shared/document-drive";

/** What the Switchboard's client offers (reactor-browser's `GraphQLReactorClient`). */
export type ServerClient = Pick<
  IReactorClient,
  | "get"
  | "find"
  | "getOperations"
  | "getOutgoingRelationships"
  | "getIncomingRelationships"
  | "getOutgoingRelationshipEdges"
  | "getIncomingRelationshipEdges"
  | "newDocument"
> & { readonly write: Pick<IReactorWriteClient, "create" | "execute" | "deleteDocument"> };

/** Where the document models are looked up: Connect's client. */
export type ModelLookups = Pick<
  IReactorClient,
  "getDocumentModelModules" | "getDocumentModelModule" | "getDocumentModelModuleForDocument"
>;

/** A method of `target`, bound to it, with its own type (generics included). */
function bound<T extends object, K extends keyof T>(target: T, key: K): T[K] {
  return (target[key] as (...args: unknown[]) => unknown).bind(target) as T[K];
}

/**
 * Files a new document in a drive: the server puts it at the top, and a move
 * takes it into `parentFolder`. The handle is readable once it is filed.
 */
function addFileOn(server: ServerClient): IDriveWriteClient["addFile"] {
  return async (driveIdentifier, document, parentFolder, signal) => {
    const created = await server.write.create(document, driveIdentifier, signal);
    if (!parentFolder) return created;
    let filed: Promise<WriteReceipt> | undefined;
    const fileIt = () =>
      (filed ??= created.readable.then(async (receipt) => {
        const moved = await server.write.execute(
          driveIdentifier,
          created.branch,
          [moveNode({ srcFolder: created.documentId, targetParentFolder: parentFolder })],
          signal,
        );
        await moved.readable;
        return receipt;
      }));
    const handle: WriteHandle = {
      jobId: created.jobId,
      documentId: created.documentId,
      branch: created.branch,
      get written() {
        return created.written;
      },
      get readable() {
        return fileIt();
      },
      document: bound(created, "document"),
    };
    return handle;
  };
}

/** The reactor tools' client, on the Switchboard's client and Connect's models. */
export function serverToolClient(server: ServerClient, models: ModelLookups): ReactorToolClient {
  return {
    get: bound(server, "get"),
    find: bound(server, "find"),
    getOperations: bound(server, "getOperations"),
    getOutgoingRelationships: bound(server, "getOutgoingRelationships"),
    getIncomingRelationships: bound(server, "getIncomingRelationships"),
    getOutgoingRelationshipEdges: bound(server, "getOutgoingRelationshipEdges"),
    getIncomingRelationshipEdges: bound(server, "getIncomingRelationshipEdges"),
    newDocument: bound(server, "newDocument"),
    resolveIdOrSlug: async (identifier, view, signal) =>
      (await server.get(identifier, view, signal)).header.id,
    getDocumentModelModules: bound(models, "getDocumentModelModules"),
    getDocumentModelModule: bound(models, "getDocumentModelModule"),
    getDocumentModelModuleForDocument: bound(models, "getDocumentModelModuleForDocument"),
    write: {
      create: bound(server.write, "create"),
      execute: bound(server.write, "execute"),
      deleteDocument: bound(server.write, "deleteDocument"),
      createEmpty: async (documentModelType, options, signal) =>
        server.write.create(
          await server.newDocument(documentModelType, options, signal),
          options?.parentIdentifier,
          signal,
        ),
      drives: { addFile: addFileOn(server) },
    },
  };
}
