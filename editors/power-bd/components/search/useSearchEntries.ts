import { useMemo } from "react";
import { searchEntries, type Entry } from "../../kit/search/index.js";
import { useTeam } from "../shared/useTeam.js";
import { useContactDocumentsInSelectedDrive, useDecisionDocumentsInSelectedDrive, useInvestorListDocumentsInSelectedDrive, useLeadDocumentsInSelectedDrive, useOpportunityDocumentsInSelectedDrive, usePlaybookDocumentsInSelectedDrive, useProposalDocumentsInSelectedDrive } from "../useDriveDocuments.js";

type Doc<S> = {
  header: { id: string; lastModifiedAtUtcIso: string };
  state: { global: S };
};
const plain = <S,>(d: Doc<S>) => ({ id: d.header.id, state: d.state.global });

/** Everything search can find in the space, rebuilt when a record changes. */
export function useSearchEntries(): Entry[] {
  const leads = useLeadDocumentsInSelectedDrive();
  const opportunities = useOpportunityDocumentsInSelectedDrive();
  const contacts = useContactDocumentsInSelectedDrive();
  const investorLists = useInvestorListDocumentsInSelectedDrive();
  const proposals = useProposalDocumentsInSelectedDrive();
  const decisions = useDecisionDocumentsInSelectedDrive();
  const playbooks = usePlaybookDocumentsInSelectedDrive();
  const { members } = useTeam();

  return useMemo(() => {
    const records = [
      ...(leads ?? []),
      ...(opportunities ?? []),
      ...(contacts ?? []),
      ...(proposals ?? []),
      ...(decisions ?? []),
    ];
    return searchEntries({
      members,
      changed: Object.fromEntries(
        records.map((d) => [d.header.id, d.header.lastModifiedAtUtcIso]),
      ),
      leads: (leads ?? []).map(plain),
      opportunities: (opportunities ?? []).map(plain),
      contacts: (contacts ?? []).map(plain),
      investorLists: (investorLists ?? []).map(plain),
      proposals: (proposals ?? []).map(plain),
      decisions: (decisions ?? []).map(plain),
      playbooks: (playbooks ?? []).map(plain),
    });
  }, [
    leads,
    opportunities,
    contacts,
    investorLists,
    proposals,
    decisions,
    playbooks,
    members,
  ]);
}
