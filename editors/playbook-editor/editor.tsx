import type { EditorProps } from "document-model";
import {
  useSelectedPlaybookDocument,
  type PlaybookAction,
  type PlaybookDocument,
} from "document-models/playbook";
import { RecordFrame } from "../power-bd/components/RecordFrame.js";
import { PlaybookDetail } from "../power-bd/records/playbook/PlaybookDetail.js";
import { useEditorRecord } from "../power-bd/components/data/driveData.js";

/** A thin editor: Connect's toolbar and the playbook page, in the design system's root. */
export default function Editor(props: EditorProps<PlaybookDocument, PlaybookAction>) {
  const [, selectedDispatch] = useSelectedPlaybookDocument();
  const [document, dispatch] = useEditorRecord(props.document, selectedDispatch);
  return (
    <RecordFrame document={document} kind="playbook">
      <PlaybookDetail state={document.state.global} dispatch={dispatch} />
    </RecordFrame>
  );
}
