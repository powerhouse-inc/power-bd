import { addDocument } from "@powerhousedao/reactor-browser";
import { useState } from "react";
import { topFolderId, type FolderName } from "../../kit/drive-plan.js";
import { VIEW_ONLY } from "../../kit/access/access.js";
import { useDriveBackend, useDriveNodes, useDriveWritable } from "../data/driveData.js";
import { createOnServer } from "../serverWrites.js";
import { useSetSelectedNode } from "./useOpenRecord.js";


/**
 * Creates a record in its top-level folder of the drive. `create` resolves to
 * the new record's id (undefined when it failed, with `error` set) and opens
 * the record unless `open: false`.
 *
 * A shared drive's record is created on its server, so a member's record is
 * accepted like the owner's, and is in the app's live copy as soon as `create`
 * resolves: the caller can fill it in, and it opens, at once. A drive kept
 * only in this browser is written through Connect.
 */
export function useCreateRecord(
  driveId: string,
  folder: FolderName,
  documentType: string,
  failure: string,
) {
  const nodes = useDriveNodes() ?? [];
  const select = useSetSelectedNode();
  const backend = useDriveBackend();
  const writable = useDriveWritable();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const create = async (
    name: string,
    options: { open?: boolean } = {},
  ): Promise<string | undefined> => {
    if (!writable) {
      setError(VIEW_ONLY);
      return undefined;
    }
    setError(null);
    setBusy(true);
    try {
      const parent = topFolderId(nodes, folder);
      let id: string;
      if (backend?.kind === "server") {
        id = await createOnServer(backend.base, driveId, name, documentType, parent);
        await backend.live.syncTree();
      } else {
        id = (await addDocument(driveId, name, documentType, parent)).id;
      }
      if (options.open ?? true) select(id);
      return id;
    } catch (e) {
      setError(e instanceof Error ? e.message : failure);
      return undefined;
    } finally {
      setBusy(false);
    }
  };
  return { create, busy, error, setError };
}
