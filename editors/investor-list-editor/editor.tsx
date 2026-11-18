import type { EditorProps } from "document-model";
import type {
  InvestorListAction,
  InvestorListDocument,
} from "document-models/investor-list";
import { RecordFrame } from "../power-bd/components/RecordFrame.js";
import { InvestorListDetail } from "../power-bd/records/investor-list/InvestorListDetail.js";
import { useEditorRecord } from "../power-bd/components/data/driveData.js";

/** A thin editor: Connect's toolbar and the investor list, in the design system's root. */
export default function Editor(props: EditorProps<InvestorListDocument, InvestorListAction>) {
  const [document, dispatch] = useEditorRecord(props.document, props.dispatch);
  return (
    <RecordFrame document={document} kind="investor-list">
      <InvestorListDetail document={document} dispatch={dispatch} />
    </RecordFrame>
  );
}
