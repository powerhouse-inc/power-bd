import {
  addDocument,
  useNodesInSelectedDrive,
  useSetSelectedNode,
} from "@powerhousedao/reactor-browser";
import { useState } from "react";
import { topFolderId, type FolderName } from "../../kit/drive-plan.js";

/**
 * Creates a record in its top-level folder of the drive. `create` resolves to
 * the new record's id (undefined when it failed, with `error` set) and opens
 * the record unless `open: false`.
 */
export function useCreateRecord(
  driveId: string,
  folder: FolderName,
  documentType: string,
  failure: string,
) {
  const nodes = useNodesInSelectedDrive() ?? [];
  const select = useSetSelectedNode();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const create = async (
    name: string,
    options: { open?: boolean } = {},
  ): Promise<string | undefined> => {
    setError(null);
    setBusy(true);
    try {
      const node = await addDocument(
        driveId,
        name,
        documentType,
        topFolderId(nodes, folder),
      );
      if (options.open ?? true) select(node.id);
      return node.id;
    } catch (e) {
      setError(e instanceof Error ? e.message : failure);
      return undefined;
    } finally {
      setBusy(false);
    }
  };
  return { create, busy, error, setError };
}
