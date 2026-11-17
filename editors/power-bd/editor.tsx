/**
 * The drive app's root. Codegen writes it once and leaves it, and the scaffold
 * in ./components, alone from then on, so edit it as you need.
 */
import { useSetPHAppConfig } from "@powerhousedao/reactor-browser";
import type { EditorProps } from "document-model";
import { AccessGate } from "./components/access/AccessGate.js";
import { Shell } from "./components/Shell.js";
import { editorConfig } from "./config.js";

/** Editor component for the app */
export default function Editor({ document, children }: EditorProps) {
  // set the config for this app
  // you can update these configs in `./config.ts`
  useSetPHAppConfig(editorConfig);
  // The drive is the document; without it there is nothing to show yet.
  if (!document) return null;
  return (
    <AccessGate driveId={document.header.id}>
      <Shell driveId={document.header.id}>{children}</Shell>
    </AccessGate>
  );
}
