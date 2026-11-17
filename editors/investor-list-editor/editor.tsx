import type { EditorProps } from "document-model";
import type {
  InvestorListAction,
  InvestorListDocument,
} from "document-models/investor-list";
import { RecordFrame } from "../power-bd/components/RecordFrame.js";
import { InvestorListDetail } from "../power-bd/records/investor-list/InvestorListDetail.js";

/** A thin editor: Connect's toolbar and the investor list, in the design system's root. */
export default function Editor({
  document,
  dispatch,
}: EditorProps<InvestorListDocument, InvestorListAction>) {
  return (
    <RecordFrame document={document} kind="investor-list">
      <InvestorListDetail document={document} dispatch={dispatch} />
    </RecordFrame>
  );
}
