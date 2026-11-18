import type { PHDocument } from "document-model";
import { useEffect, useMemo, useState } from "react";
import { deleteVerdict, deleteWords, placeAfterDelete } from "../../kit/record-delete/index.js";
import { useDriveDocuments, useDriveWritable, useDriveWrite } from "../data/driveData.js";
import { Icon } from "../Icon.js";
import { useGoToPlace } from "../PlaceContext.js";
import { ErrorLine } from "./ErrorLine.js";
import { useSetSelectedNode } from "./useOpenRecord.js";

/** Why a record could not be deleted, for its page when it opens again. */
const failures = new Map<string, string>();

/**
 * The end of a record page: deleting the record, for everyone in the space.
 * It asks first, says it can't be undone and what keeps the history instead.
 * When other records link to it, or a proposal was sent, it says why the
 * record stays and offers no button. A view-only member sees nothing here,
 * and the space's own records (settings, playbook, investor list) have none.
 *
 * Deleting closes the record first, so nothing goes on reading it while it is
 * deleted; if the server refuses, the record opens again and says why.
 */
export function DeleteRecord({ document }: { document: PHDocument }) {
  const documents = useDriveDocuments();
  const writable = useDriveWritable();
  const write = useDriveWrite();
  const goToPlace = useGoToPlace();
  const openRecord = useSetSelectedNode();
  const id = document.header.id;
  // Tied to the record, so moving to another one never carries a question over.
  const [askedFor, setAskedFor] = useState<string | null>(null);
  const [busyFor, setBusyFor] = useState<string | null>(null);
  const confirming = askedFor === id;
  const busy = busyFor === id;
  // A failure is shown on the page that opens after it, once.
  const [kept] = useState(() => ({ id, error: failures.get(id) ?? null }));
  const error = kept.id === id ? kept.error : null;
  useEffect(() => {
    failures.delete(id);
  }, [id]);
  // Until the space's records have loaded, what links to this one is unknown: nothing is offered.
  const verdict = useMemo(() => (documents ? deleteVerdict(document, documents) : null), [document, documents]);
  if (!verdict || !writable) return null;
  const type = document.header.documentType;
  const words = deleteWords(type, verdict);

  const remove = () => {
    setBusyFor(id);
    goToPlace(placeAfterDelete(type));
    void write.remove(id).catch((e: unknown) => {
      failures.set(id, `It was not deleted: ${e instanceof Error ? e.message : String(e)}`);
      openRecord(id);
    });
  };

  return (
    <section className="pb-record-end" aria-label={words.button}>
      {words.refusal ? (
        <p className="pb-reassure">
          <Icon name="info" />
          {words.refusal}
        </p>
      ) : confirming ? (
        <div className="pb-row">
          <p className="pb-reassure pb-flex-1 pb-minw-240">
            <Icon name="shield" />
            {words.confirm}
          </p>
          <button type="button" className="pb-btn pb-btn--sm pb-btn--danger" disabled={busy} onClick={remove}>
            {words.yes}
          </button>
          <button type="button" className="pb-btn pb-btn--ghost pb-btn--sm" disabled={busy} onClick={() => setAskedFor(null)}>
            {words.keep}
          </button>
        </div>
      ) : (
        <button type="button" className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--danger" onClick={() => setAskedFor(id)}>
          <Icon name="trash" />
          {words.button}
        </button>
      )}
      <ErrorLine message={error} />
    </section>
  );
}
