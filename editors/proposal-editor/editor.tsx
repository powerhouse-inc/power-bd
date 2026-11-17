import type { EditorProps } from "document-model";
import type {
  ProposalAction,
  ProposalDocument,
} from "document-models/proposal";
import { RecordFrame } from "../power-bd/components/RecordFrame.js";
import { ProposalDetail } from "../power-bd/records/proposal/ProposalDetail.js";

/** A thin editor: Connect's toolbar and the app's proposal page, in the design system's root. */
export default function Editor({
  document,
  dispatch,
}: EditorProps<ProposalDocument, ProposalAction>) {
  return (
    <RecordFrame document={document} kind="proposal">
      <ProposalDetail document={document} dispatch={dispatch} />
    </RecordFrame>
  );
}
