import type { EditorProps } from "document-model";
import type { MarketAction, MarketDocument } from "document-models/market";
import { RecordFrame } from "../power-bd/components/RecordFrame.js";
import { MarketDetail } from "../power-bd/records/market/MarketDetail.js";
import { useEditorRecord } from "../power-bd/components/data/driveData.js";

/** A thin editor: Connect's toolbar and the app's market page, in the design system's root. */
export default function Editor(props: EditorProps<MarketDocument, MarketAction>) {
  const [document, dispatch] = useEditorRecord(props.document, props.dispatch);
  return (
    <RecordFrame document={document} kind="market">
      <MarketDetail document={document} dispatch={dispatch} />
    </RecordFrame>
  );
}
