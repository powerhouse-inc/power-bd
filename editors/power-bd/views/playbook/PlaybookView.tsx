import { isPlaybookDocument } from "document-models/playbook";
import { useDriveNodes, useRecordById } from "../../components/data/driveData.js";
import { EmptyPlace } from "../../components/EmptyPlace.js";
import { PlaybookDetail } from "../../records/playbook/PlaybookDetail.js";

/** The Playbook place: the drive's one playbook. */
export function PlaybookView() {
  const nodes = useDriveNodes();
  const node = nodes?.find(
    (n) =>
      n.kind === "file" &&
      "documentType" in n &&
      n.documentType === "powerbd/playbook",
  );
  const [document, dispatch] = useRecordById(node?.id, isPlaybookDocument);
  if (!document || !dispatch)
    return (
      <div className="pb-page pb-page--wide">
        <EmptyPlace
          icon="playbook"
          title="Getting your playbook ready"
          text="Your positioning and messages will appear here in a moment."
        />
      </div>
    );
  return <PlaybookDetail state={document.state.global} dispatch={dispatch} />;
}
