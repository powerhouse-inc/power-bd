import type { EditorProps } from "document-model";
import type {
  DecisionAction,
  DecisionDocument,
} from "document-models/decision";
import { RecordFrame } from "../power-bd/components/RecordFrame.js";
import { DecisionDetail } from "../power-bd/records/decision/DecisionDetail.js";

/** A thin editor: Connect's toolbar and the app's decision page, in the design system's root. */
export default function Editor({
  document,
  dispatch,
}: EditorProps<DecisionDocument, DecisionAction>) {
  return (
    <RecordFrame document={document} kind="decision">
      <DecisionDetail document={document} dispatch={dispatch} />
    </RecordFrame>
  );
}
