import { dispatchActions } from "@powerhousedao/reactor-browser";
import { addFolder } from "@powerhousedao/shared/document-drive";
import { generateId } from "document-model";

/**
 * Adds folders at the drive's top level in one change, through the same
 * client the drive is read from, and settles when the change was applied.
 * Connect's own `addFolder` reads each new folder back from this browser's
 * copy, which a host that writes straight to the server has not updated yet.
 */
export function addTopFolders(driveId: string, names: readonly string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    dispatchActions(
      names.map((name) => addFolder({ id: generateId(), name, parentFolder: null })),
      driveId,
      (errors) => reject(errors[0] ?? new Error("The folders were not added.")),
      (_result, { rejected }) => {
        if (rejected.length === 0) resolve();
      },
    ).catch(reject);
  });
}
