import type { EditorProps } from "document-model";
import type {
  DecisionAction,
  DecisionDocument,
} from "document-models/decision";
import { RecordFrame } from "../power-bd/components/RecordFrame.js";
import { DecisionDetail } from "../power-bd/records/decision/DecisionDetail.js";
import { useEditorRecord } from "../power-bd/components/data/driveData.js";

/** A thin editor: Connect's toolbar and the app's decision page, in the design system's root. */
export default function Editor(props: EditorProps<DecisionDocument, DecisionAction>) {
  const [document, dispatch] = useEditorRecord(props.document, props.dispatch);
  return (
    <RecordFrame document={document} kind="decision">
      <DecisionDetail document={document} dispatch={dispatch} />
    </RecordFrame>
  );
}
