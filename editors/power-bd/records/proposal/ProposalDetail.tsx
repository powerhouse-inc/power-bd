import {
  useSetSelectedNode,
  useUser,
  type DocumentDispatch,
} from "@powerhousedao/reactor-browser";
import { generateId } from "document-model";
import {
  type ProposalAction,
  type ProposalDocument,
} from "document-models/proposal";
import { useState } from "react";
import { Icon } from "../../components/Icon.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { dispatchWith, useRun } from "../../components/shared/useRun.js";
import { useToday } from "../../components/shared/useToday.js";
import { approvalGate } from "../../kit/approval-gate/approval-gate.js";
import { organisationLabel } from "../../kit/organisation-list/organisation-list.js";
import {
  checkProposal,
  proposalCodes,
} from "../../kit/proposal-check/proposal-check.js";
import { copyProposal } from "../../kit/proposal-copy/index.js";
import { markdownFileName } from "../../kit/proposal-render/pictures.js";
import { proposalBlocks } from "../../kit/proposal-render/proposal-render.js";
import { computeProposalTotals } from "../../kit/proposal-totals/proposal-totals.js";
import {
  checkInput,
  findingFlags,
  findingRows,
  findingsHeadline,
  isLapsed,
  nextStep,
  partyNames,
  statusRules,
  type FindingTarget,
  type ProposalTab,
} from "../../kit/proposal-view/index.js";
import { EditView, type Found } from "./EditView.js";
import { useAttach } from "./Files.js";
import { Findings } from "./Findings.js";
import { FindingsContext } from "./Items.js";
import { PreviewView } from "./PreviewView.js";
import { ProposalHead } from "./ProposalHead.js";
import { StatusPanel } from "./StatusPanel.js";
import type { Send } from "./tabs/types.js";
import { useCopy } from "./useCopy.js";
import { usePageView, usePreviewMode } from "./usePageView.js";
import { stepAction, useStartProposal } from "./useStartProposal.js";
import { useWithPictures } from "./useWithPictures.js";
import { useContactDocumentsInSelectedDrive, useDecisionDocumentsInSelectedDrive, useLeadDocumentsInSelectedDrive, usePlaybookDocumentsInSelectedDrive } from "../../components/useDriveDocuments.js";

type Dispatch = DocumentDispatch<ProposalAction>;

/** Saves the proposal's text as a file on the person's computer. */
function exportMarkdown(markdown: string, fileName: string) {
  const url = URL.createObjectURL(
    new Blob([markdown], { type: "text/markdown" }),
  );
  const a = window.document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

/** The proposal page: shown on its lead and in the thin editor. */
export function ProposalDetail({
  document,
  dispatch,
}: {
  document: ProposalDocument;
  dispatch: Dispatch;
}) {
  const s = document.state.global;
  const documentId = document.header.id;
  const me = useUser()?.address ?? "";
  const { start, error: startError } = useStartProposal();
  const leads = useLeadDocumentsInSelectedDrive() ?? [];
  const contactDocs = useContactDocumentsInSelectedDrive() ?? [];
  const decisionDocs = useDecisionDocumentsInSelectedDrive() ?? [];
  const playbookDoc = usePlaybookDocumentsInSelectedDrive()?.[0];
  const playbook = playbookDoc?.state.global;
  const select = useSetSelectedNode();
  const [view, setView] = usePageView(documentId, s.status);
  const [mode, setMode] = usePreviewMode(documentId);
  const clip = useCopy();
  const [tab, setTab] = useState<ProposalTab>("details");
  const [found, setFound] = useState<Found | null>(null);
  const make = useRun();
  const { attach } = useAttach(documentId, dispatch);
  const today = useToday();

  const send: Send = (a, e) => dispatchWith(dispatch, a, e);
  const lead = leads.find((l) => l.header.id === s.leadId)?.state.global;
  const contacts = contactDocs.map((d) => ({
    id: d.header.id,
    name: organisationLabel(d.state.global.name),
    people: d.state.global.people.map((p) => ({ id: p.id, name: p.name })),
  }));
  const names = partyNames({ contacts, lead, recipient: s.recipient });
  const rules = statusRules(s.status);
  const totals = computeProposalTotals(s);
  const findings = checkProposal(
    checkInput({
      proposal: s,
      playbook,
      confidentialItems: lead?.confidentialItems,
      decisions: decisionDocs.map((d) => ({
        id: d.header.id,
        status: d.state.global.status,
      })),
      today,
    }),
  );
  const gate = approvalGate({
    playbookLoaded: !!playbookDoc,
    leadLoaded: !!lead,
    findings: findings.length,
    signedIn: !!me,
  });
  const blocks = proposalBlocks(s, {
    clientName: names.client,
    recipientName: names.recipient,
    contractingEntityTitle:
      s.contractingEntity?.title ?? "the contracting entity",
  });
  /** What Export saves and Copy markdown copies, its pictures read when pressed. */
  const withPictures = useWithPictures(documentId, blocks);
  const fileName = markdownFileName(s.code);
  const copyWithPictures = async () => {
    const text = await withPictures.prepare("copy");
    if (text !== null) await clip.copy(text);
  };
  const exportWithPictures = async () => {
    const text = await withPictures.prepare("export");
    if (text !== null) exportMarkdown(text, fileName);
  };
  const lapsed = isLapsed(s.status, s.validUntil, today);
  const next = nextStep({
    status: s.status,
    findings: findings.length,
    lapsed,
    signedCopy: !!s.signedCopy,
  });

  const copyOf = (revises: string | null, e: Parameters<Send>[1]) =>
    void start(
      `${s.title || "Proposal"} (${revises ? "revision" : "copy"})`,
      copyProposal(s, generateId, revises).map(stepAction),
      e,
    );
  /** Takes the person to the tab and item a finding concerns. */
  const goTo = (target: FindingTarget) => {
    setView("edit");
    setTab(target.tab);
    setFound((last) => ({ ...target, n: (last?.n ?? 0) + 1 }));
  };

  return (
    <FindingsContext.Provider value={findingFlags(findings)}>
      <div className="pb-page pb-page--wide">
        <ProposalHead
          s={s}
          leadName={lead?.name}
          organisationId={lead?.organisationId}
          organisationName={names.client}
          lapsed={lapsed}
          canRevise={rules.canRevise}
          error={make.error ?? startError}
          onOpen={select}
          onCopy={() => make.run((e) => copyOf(null, e))}
          onRevise={() => make.run((e) => copyOf(documentId, e))}
        />
        <div className="pb-stack pb-gap-10">
          {next ? (
            <div className="pb-next">
              <span className="pb-next__label">Next</span>
              <div className="pb-next__main">
                <span className="pb-next__what">{next.what}</span>
                <span className="pb-next__why">{next.why}</span>
              </div>
            </div>
          ) : null}
          {s.revisesProposalId ? (
            <p className="pb-faint pb-small">
              This is a revision. The sent proposal it replaces stays the live
              offer until this one is marked sent.
            </p>
          ) : null}
          <StatusPanel
            s={s}
            documentId={documentId}
            dispatch={dispatch}
            attach={attach}
            me={me}
            gate={gate}
            findings={findings.length}
            lapsed={lapsed}
          />
          {rules.editable || findings.length > 0 ? (
            <Findings
              key={view}
              rows={findingRows(findings)}
              headline={findingsHeadline(findings.length, s.status)}
              gateMessage={rules.editable ? gate.message : null}
              startOpen={view === "edit"}
              onGo={goTo}
            />
          ) : null}
        </div>

        <div className="pb-viewbar">
          <div
            className="pb-segmented pb-segmented--lg"
            role="group"
            aria-label="View"
          >
            <button
              className={`pb-segmented__item${view === "edit" ? " is-active" : ""}`}
              aria-pressed={view === "edit"}
              onClick={() => setView("edit")}
            >
              <Icon name="edit" />
              Edit
            </button>
            <button
              className={`pb-segmented__item${view === "preview" ? " is-active" : ""}`}
              aria-pressed={view === "preview"}
              onClick={() => setView("preview")}
            >
              <Icon name="eye" />
              Preview
            </button>
          </div>
          {view === "preview" ? (
            <>
              <div
                className="pb-segmented"
                role="group"
                aria-label="Show the preview as"
              >
                <button
                  className={`pb-segmented__item${mode === "document" ? " is-active" : ""}`}
                  aria-pressed={mode === "document"}
                  onClick={() => setMode("document")}
                >
                  Document
                </button>
                <button
                  className={`pb-segmented__item${mode === "markdown" ? " is-active" : ""}`}
                  aria-pressed={mode === "markdown"}
                  onClick={() => setMode("markdown")}
                >
                  Markdown
                </button>
              </div>
              <div className="pb-viewbar__end">
                <p className="pb-reassure">
                  <Icon name="shield" />
                  Copy and Export stay on your computer. Nothing is sent from
                  Power BD.
                </p>
                <button
                  type="button"
                  className="pb-btn pb-btn--sm pb-btn--swap"
                  disabled={withPictures.preparing}
                  onClick={() => void copyWithPictures()}
                >
                  <span className={clip.copied ? "is-off" : undefined}>
                    <Icon name="copy" />
                    Copy markdown
                  </span>
                  <span className={clip.copied ? undefined : "is-off"}>
                    <Icon name="check" />
                    Copied
                  </span>
                </button>
                <button
                  className="pb-btn pb-btn--sm"
                  disabled={withPictures.preparing}
                  onClick={() => void exportWithPictures()}
                >
                  <Icon name="external" />
                  Export
                </button>
              </div>
              {withPictures.preparing ? (
                <span className="pb-busy" role="status">
                  <Icon name="hourglass" />
                  Preparing pictures…
                </span>
              ) : null}
              <ErrorLine
                message={
                  withPictures.error ??
                  (clip.error &&
                    `${clip.error} Export saves the same text as a file.`)
                }
              />
            </>
          ) : (
            <span className="pb-faint pb-small">
              {rules.editable
                ? "Each field saves when you leave it."
                : "Locked: the text can't change now."}
            </span>
          )}
        </div>
        {view === "edit" ? (
          <EditView
            s={s}
            send={send}
            disabled={!rules.editable}
            tab={tab}
            onTab={setTab}
            found={found}
            documentId={documentId}
            clientName={names.client}
            contacts={contacts}
            totals={totals}
            positioning={(playbook?.positioning ?? []).filter(
              (p) => p.status === "APPROVED",
            )}
            attach={attach}
          />
        ) : (
          <PreviewView
            blocks={blocks}
            codes={proposalCodes(s)}
            documentId={documentId}
            mode={mode}
            fileName={fileName}
          />
        )}
      </div>
    </FindingsContext.Provider>
  );
}
