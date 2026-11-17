import type { EditorProps } from "document-model";
import type {
  OpportunityAction,
  OpportunityDocument,
} from "document-models/opportunity";
import { RecordFrame } from "../power-bd/components/RecordFrame.js";
import { OpportunityDetail } from "../power-bd/records/opportunity/OpportunityDetail.js";

/** A thin editor: Connect's toolbar and the app's funding opportunity page, in the design system's root. */
export default function Editor({
  document,
  dispatch,
}: EditorProps<OpportunityDocument, OpportunityAction>) {
  return (
    <RecordFrame document={document} kind="opportunity">
      <OpportunityDetail document={document} dispatch={dispatch} />
    </RecordFrame>
  );
}
