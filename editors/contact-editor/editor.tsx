import type { EditorProps } from "document-model";
import type { ContactAction, ContactDocument } from "document-models/contact";
import { RecordFrame } from "../power-bd/components/RecordFrame.js";
import { ContactDetail } from "../power-bd/records/contact/ContactDetail.js";

/** A thin editor: Connect's toolbar and the app's organisation page, in the design system's root. */
export default function Editor({
  document,
  dispatch,
}: EditorProps<ContactDocument, ContactAction>) {
  return (
    <RecordFrame document={document} kind="contact">
      <ContactDetail document={document} dispatch={dispatch} />
    </RecordFrame>
  );
}
