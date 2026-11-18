import type { EditorProps } from "document-model";
import type {
  ProposalAction,
  ProposalDocument,
} from "document-models/proposal";
import { RecordFrame } from "../power-bd/components/RecordFrame.js";
import { ProposalDetail } from "../power-bd/records/proposal/ProposalDetail.js";
import { useEditorRecord } from "../power-bd/components/data/driveData.js";

/** A thin editor: Connect's toolbar and the app's proposal page, in the design system's root. */
export default function Editor(props: EditorProps<ProposalDocument, ProposalAction>) {
  const [document, dispatch] = useEditorRecord(props.document, props.dispatch);
  return (
    <RecordFrame document={document} kind="proposal">
      <ProposalDetail document={document} dispatch={dispatch} />
    </RecordFrame>
  );
}
