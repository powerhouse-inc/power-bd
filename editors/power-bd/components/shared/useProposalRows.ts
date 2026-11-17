import { proposalRows, type ProposalRow } from "../../kit/proposal-list/index.js";
import { useToday } from "./useToday.js";
import { useContactDocumentsInSelectedDrive, useDecisionDocumentsInSelectedDrive, useLeadDocumentsInSelectedDrive, usePlaybookDocumentsInSelectedDrive, useProposalDocumentsInSelectedDrive } from "../useDriveDocuments.js";

/** Every proposal of the space as a row, with what it waits on; `leadId` keeps one lead's. */
export function useProposalRows(leadId?: string): ProposalRow[] {
  const proposals = useProposalDocumentsInSelectedDrive() ?? [];
  const leads = useLeadDocumentsInSelectedDrive() ?? [];
  const contacts = useContactDocumentsInSelectedDrive() ?? [];
  const decisions = useDecisionDocumentsInSelectedDrive() ?? [];
  const playbook = usePlaybookDocumentsInSelectedDrive()?.[0]?.state.global;
  const today = useToday();
  return proposalRows({
    proposals: proposals
      .filter((d) => !leadId || d.state.global.leadId === leadId)
      .map((d) => ({ id: d.header.id, state: d.state.global })),
    leads: leads.map((d) => ({ id: d.header.id, state: d.state.global })),
    organisations: Object.fromEntries(
      contacts.map((c) => [c.header.id, c.state.global.name ?? ""]),
    ),
    playbook,
    decisions: decisions.map((d) => ({
      id: d.header.id,
      status: d.state.global.status,
    })),
    today,
  });
}
