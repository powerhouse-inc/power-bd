import {
  renameDriveNode,
  useNodesInSelectedDrive,
  useSelectedDriveId,
} from "@powerhousedao/reactor-browser";
import { useEffect } from "react";
import { nameToSync } from "../../kit/record-name/index.js";

/** The name last asked for per record, so one change is sent once however many parts of the page notice it. */
const asked = new Map<string, string>();

function rename(driveId: string, documentId: string, name: string) {
  if (asked.get(documentId) === name) return;
  asked.set(documentId, name);
  renameDriveNode(driveId, documentId, name).catch(() => {
    /* the page already shows the saved name; the entry catches up on the next save or opening */
    asked.delete(documentId);
  });
}

/**
 * Keeps a record's entry in the team's space (and the document's own name) in step with the name
 * its page shows. Call the returned function after the page's name or title was saved.
 * `renameDriveNode` renames the entry and the document together.
 */
export function useRenameRecord(documentId: string) {
  const driveId = useSelectedDriveId();
  return (name: string) => {
    const clean = name.trim();
    if (!driveId || !clean) return;
    rename(driveId, documentId, clean);
  };
}

/**
 * Brings a record's entry in line with its title when the record is opened: a
 * record named before its page renamed the entry would otherwise keep "New
 * lead" in the space's file list and in Connect's toolbar. It sends the same
 * rename a save does, once, and only when a stored name differs.
 */
export function useNameInStep(
  documentId: string,
  documentName: string | null | undefined,
  title: string | null,
) {
  const driveId = useSelectedDriveId();
  const entryName = useNodesInSelectedDrive()?.find(
    (n) => n.id === documentId,
  )?.name;
  const name = nameToSync(title, [documentName, entryName]);
  useEffect(() => {
    // Only a record that has an entry in this space; one opened from elsewhere is left alone.
    if (driveId && name && entryName !== undefined)
      rename(driveId, documentId, name);
  }, [driveId, documentId, name, entryName]);
}
