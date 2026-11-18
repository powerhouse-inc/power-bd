/**
 * A drive's live copy, read from and written to the server that keeps it.
 *
 * Power BD keeps this instead of reading Connect's synced copy: that copy
 * starts empty on a member's first visit, and writes made through it leave as
 * batches the server refuses from anyone who is not its admin. Pure: the
 * server is a port, so the rules here are tested without a network.
 */
import type { Action, PHDocument } from "document-model";
import { asNode } from "../drive/server-drive.js";
import type { NodeLike } from "../drive-plan.js";

/** What the live copy needs from the drive's server. */
export interface DriveSource {
  /** The drive document itself. */
  getDrive: () => Promise<PHDocument>;
  /** These records; one the server refuses or no longer has is left out. */
  getMany: (ids: readonly string[]) => Promise<readonly PHDocument[]>;
  /** Applies actions to a document; returns it with the operations they appended. */
  execute: (id: string, actions: readonly Action[]) => Promise<PHDocument>;
}

export interface LiveDriveSnapshot {
  status: "loading" | "ready" | "failed";
  /** Why the last read failed; the data read before it stays. */
  error?: string;
  drive?: PHDocument;
  /** The tree; undefined until first read. */
  nodes?: readonly NodeLike[];
  /** The records, in the tree's order; undefined until first read. */
  documents?: readonly PHDocument[];
  byId: ReadonlyMap<string, PHDocument>;
}

/** A change the server announced, with the documents as they now are. */
export interface DriveChange {
  type: string;
  documents: readonly PHDocument[];
  parentId?: string | null;
}

/** An action the document did not apply, as Connect reports one. */
export type Rejected = Error & {
  documentId: string;
  scope: string;
  actionId: string;
  actionType: string;
  index: number;
  kind: "reducer-error" | "denied";
};

/** The actions among `actions` whose operations in `document` carry an error. */
export function rejectedActions(document: PHDocument, actions: readonly Action[]): Rejected[] {
  const asked = new Set(actions.map((a) => a.id));
  const out: Rejected[] = [];
  for (const [scope, operations] of Object.entries(document.operations ?? {})) {
    for (const op of operations ?? []) {
      if (!op.error || !asked.has(op.action.id)) continue;
      out.push(
        Object.assign(new Error(op.error), {
          documentId: document.header.id,
          scope,
          actionId: op.action.id,
          actionType: op.action.type,
          index: op.index,
          kind: "reducer-error" as const,
        }),
      );
    }
  }
  return out;
}

/** How far a document has come: the sum of its scopes' revisions. */
function progress(document: PHDocument): number {
  return Object.values(document.header.revision ?? {}).reduce((sum, n) => sum + (n ?? 0), 0);
}

function treeOf(drive: PHDocument): NodeLike[] {
  const nodes = (drive.state as { global?: { nodes?: unknown } } | undefined)?.global?.nodes;
  return Array.isArray(nodes) ? nodes.map(asNode).filter((n): n is NodeLike => n !== undefined) : [];
}

const fileIds = (nodes: readonly NodeLike[]) => nodes.filter((n) => n.kind === "file").map((n) => n.id);
const say = (e: unknown) => (e instanceof Error ? e.message : String(e));

export function createLiveDrive(driveId: string, source: DriveSource) {
  let snapshot: LiveDriveSnapshot = { status: "loading", byId: new Map() };
  const listeners = new Set<() => void>();
  let reading: Promise<void> | undefined;
  let again = false;

  const publish = (next: Partial<LiveDriveSnapshot>) => {
    snapshot = { ...snapshot, ...next };
    for (const listener of listeners) listener();
  };
  const ordered = (nodes: readonly NodeLike[], byId: ReadonlyMap<string, PHDocument>) =>
    fileIds(nodes).flatMap((id) => {
      const d = byId.get(id);
      return d ? [d] : [];
    });

  /** Takes a tree in; reads the records it lists that are not held (all when `fresh`). */
  async function takeTree(drive: PHDocument, fresh: boolean) {
    if (snapshot.drive && progress(drive) < progress(snapshot.drive)) return;
    const nodes = treeOf(drive);
    const ids = fileIds(nodes);
    const wanted = fresh ? ids : ids.filter((id) => !snapshot.byId.has(id));
    const fetched = wanted.length > 0 ? await source.getMany(wanted) : [];
    const byId = new Map<string, PHDocument>();
    for (const id of ids) {
      const held = snapshot.byId.get(id);
      if (held) byId.set(id, held);
    }
    for (const d of fetched) {
      const held = byId.get(d.header.id);
      if (!held || fresh || progress(d) >= progress(held)) byId.set(d.header.id, d);
    }
    publish({ status: "ready", error: undefined, drive, nodes, byId, documents: ordered(nodes, byId) });
  }

  /** Re-reads the tree and every record; one read at a time, a call during one runs after it. */
  function refresh(): Promise<void> {
    if (reading) {
      again = true;
      return reading;
    }
    reading = source
      .getDrive()
      .then((drive) => takeTree(drive, true))
      .catch((e: unknown) => publish({ status: snapshot.nodes ? "ready" : "failed", error: say(e) }))
      .finally(() => {
        reading = undefined;
        if (again) {
          again = false;
          void refresh();
        }
      });
    return reading;
  }

  /** Re-reads the tree only, and the records it lists that are not held yet. */
  async function syncTree(): Promise<void> {
    await takeTree(await source.getDrive(), false);
  }

  /** Takes records in, newer than held; ignores documents not in this drive. */
  function takeRecords(documents: readonly PHDocument[]) {
    const nodes = snapshot.nodes;
    if (!nodes) return;
    const listed = new Set(fileIds(nodes));
    let byId: Map<string, PHDocument> | undefined;
    for (const d of documents) {
      const id = d.header.id;
      if (!listed.has(id)) continue;
      const held = snapshot.byId.get(id);
      if (held && progress(d) < progress(held)) continue;
      byId ??= new Map(snapshot.byId);
      byId.set(id, d);
    }
    if (byId) publish({ byId, documents: ordered(nodes, byId) });
  }

  /** Applies a change the server announced. */
  function change(event: DriveChange): Promise<void> {
    const tree = event.documents.find((d) => d.header.id === driveId);
    const records = event.documents.filter((d) => d.header.id !== driveId);
    if (event.type === "DELETED") {
      const gone = new Set(records.map((d) => d.header.id));
      const nodes = snapshot.nodes;
      if (nodes && records.some((d) => snapshot.byId.has(d.header.id))) {
        const byId = new Map([...snapshot.byId].filter(([id]) => !gone.has(id)));
        publish({ byId, documents: ordered(nodes, byId) });
      }
    } else takeRecords(records);
    if (tree) return takeTree(tree, false).catch((e: unknown) => publish({ error: say(e) }));
    if (event.parentId === driveId) return refresh();
    return Promise.resolve();
  }

  /** Writes to a document on the server and takes the result in at once. */
  async function write(id: string, actions: readonly Action[]) {
    const document = await source.execute(id, actions);
    if (id === driveId) await takeTree(document, false);
    else takeRecords([document]);
    return { document, rejected: rejectedActions(document, actions) };
  }

  return {
    refresh,
    syncTree,
    change,
    write,
    /** Whether a document belongs to this drive (the drive itself or one of its records). */
    holds: (id: string) => id === driveId || snapshot.byId.has(id) || fileIds(snapshot.nodes ?? []).includes(id),
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export type LiveDrive = ReturnType<typeof createLiveDrive>;
