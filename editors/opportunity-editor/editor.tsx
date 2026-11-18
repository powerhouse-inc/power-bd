import type { EditorProps } from "document-model";
import type {
  OpportunityAction,
  OpportunityDocument,
} from "document-models/opportunity";
import { RecordFrame } from "../power-bd/components/RecordFrame.js";
import { OpportunityDetail } from "../power-bd/records/opportunity/OpportunityDetail.js";
import { useEditorRecord } from "../power-bd/components/data/driveData.js";

/** A thin editor: Connect's toolbar and the app's funding opportunity page, in the design system's root. */
export default function Editor(props: EditorProps<OpportunityDocument, OpportunityAction>) {
  const [document, dispatch] = useEditorRecord(props.document, props.dispatch);
  return (
    <RecordFrame document={document} kind="opportunity">
      <OpportunityDetail document={document} dispatch={dispatch} />
    </RecordFrame>
  );
}
