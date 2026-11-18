import { DocumentToolbar } from "@powerhousedao/design-system/connect";
import type { PHDocument } from "document-model";
import type { ReactNode } from "react";
import type { IconName } from "../../../design-system/icons.js";
import { EmptyPlace } from "./EmptyPlace.js";
import { Sprite } from "./Icon.js";
import { useInShell } from "./ShellContext.js";
import { useNameInStep } from "./shared/useRenameRecord.js";
import { recordTitle } from "../kit/record-name/index.js";
import "../kit/design.js";

/** What each kind of record is called in the UI, and its icon. */
export const RECORD_KINDS = {
  lead: { noun: "lead", icon: "leads" },
  opportunity: { noun: "funding opportunity", icon: "funding" },
  contact: { noun: "contact", icon: "organisations" },
  decision: { noun: "decision", icon: "decisions" },
  proposal: { noun: "proposal", icon: "proposal" },
  playbook: { noun: "playbook", icon: "playbook" },
  settings: { noun: "settings", icon: "settings" },
  "investor-list": { noun: "investor list", icon: "investors" },
  market: { noun: "market", icon: "compass" },
} as const satisfies Record<string, { noun: string; icon: IconName }>;

export type RecordKind = keyof typeof RECORD_KINDS;

/**
 * The thin editor's body: Connect's toolbar, then a placeholder for the app's
 * detail component, inside the design system's root. Inside the app shell the
 * root and the icons are already there.
 */
export function RecordFrame({
  document,
  kind,
  children,
}: {
  document: PHDocument;
  kind: RecordKind;
  /** The record type's detail component; the placeholder shows without it. */
  children?: ReactNode;
}) {
  const inShell = useInShell();
  const { noun, icon } = RECORD_KINDS[kind];
  useNameInStep(
    document.header.id,
    document.header.name,
    recordTitle(document.header.documentType, document.state),
  );
  const body = children ?? (
    <div className="pb-page">
      <EmptyPlace
        icon={icon}
        title={document.header.name || `Untitled ${noun}`}
        text={`The page for this ${noun} will appear here.`}
      />
    </div>
  );
  return (
    <>
      {/* Connect's toolbar keeps Connect's styling; the design system starts below it. */}
      <DocumentToolbar document={document} />
      {inShell ? (
        body
      ) : (
        <div className="pb-root pb-fill-height">
          <Sprite />
          {body}
        </div>
      )}
    </>
  );
}
