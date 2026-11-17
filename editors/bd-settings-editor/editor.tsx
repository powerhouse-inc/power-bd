import type { EditorProps } from "document-model";
import type {
  BdSettingsAction,
  BdSettingsDocument,
} from "document-models/bd-settings";
import { RecordFrame } from "../power-bd/components/RecordFrame.js";
import { SettingsDetail } from "../power-bd/records/settings/SettingsDetail.js";

/** A thin editor: Connect's toolbar and the settings page, in the design system's root. */
export default function Editor({
  document,
}: EditorProps<BdSettingsDocument, BdSettingsAction>) {
  return (
    <RecordFrame document={document} kind="settings">
      <SettingsDetail documentId={document.header.id} />
    </RecordFrame>
  );
}
