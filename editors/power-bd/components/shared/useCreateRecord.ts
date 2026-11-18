import { addDocument, useSetSelectedNode } from "@powerhousedao/reactor-browser";
import { useState } from "react";
import { topFolderId, type FolderName } from "../../kit/drive-plan.js";
import { useDriveBackend, useDriveNodes } from "../data/driveData.js";
import { createOnServer, waitForArrival } from "../serverWrites.js";

/** Said when a record was saved on the server but has not reached this browser yet. */
export const ARRIVING = "Saved. It will appear here in a moment.";

/**
 * Creates a record in its top-level folder of the drive. `create` resolves to
 * the new record's id (undefined when it failed, with `error` set) and opens
 * the record unless `open: false`.
 *
 * A shared drive's record is created on its server, so a member's record is
 * accepted like the owner's, and is in the app's live copy as soon as `create`
 * resolves, so the caller can fill it in at once. Opening it waits until
 * Connect also holds it, since Connect opens the record. A drive kept only in
 * this browser is written through Connect.
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
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const create = async (
    name: string,
    options: { open?: boolean } = {},
  ): Promise<string | undefined> => {
    setError(null);
    setBusy(true);
    try {
      const parent = topFolderId(nodes, folder);
      let id: string;
      if (backend?.kind === "server") {
        id = await createOnServer(backend.base, driveId, name, documentType, parent);
        await backend.live.syncTree();
        const open = options.open ?? true;
        if (open && !(await waitForArrival(driveId, id))) {
          setError(ARRIVING);
          return id;
        }
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
