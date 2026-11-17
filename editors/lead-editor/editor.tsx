import type { EditorProps } from "document-model";
import type { LeadAction, LeadDocument } from "document-models/lead";
import { RecordFrame } from "../power-bd/components/RecordFrame.js";
import { LeadDetail } from "../power-bd/records/lead/LeadDetail.js";

/** A thin editor: Connect's toolbar and the app's lead page, in the design system's root. */
export default function Editor({
  document,
  dispatch,
}: EditorProps<LeadDocument, LeadAction>) {
  return (
    <RecordFrame document={document} kind="lead">
      <LeadDetail document={document} dispatch={dispatch} />
    </RecordFrame>
  );
}
