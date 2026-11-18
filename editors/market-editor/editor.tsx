import type { EditorProps } from "document-model";
import type { MarketAction, MarketDocument } from "document-models/market";
import { RecordFrame } from "../power-bd/components/RecordFrame.js";

/** A thin editor: Connect's toolbar and the app's market page, in the design system's root. */
export default function Editor({
  document,
}: EditorProps<MarketDocument, MarketAction>) {
  return <RecordFrame document={document} kind="market" />;
}
