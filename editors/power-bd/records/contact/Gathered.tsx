import { Section } from "../../components/shared/relationship/common.js";
import { organisationView } from "../../kit/organisation/index.js";
import { useInvestorListDocumentsInSelectedDrive, useLeadDocumentsInSelectedDrive, useOpportunityDocumentsInSelectedDrive, useProposalDocumentsInSelectedDrive } from "../../components/useDriveDocuments.js";
import { useSetSelectedNode } from "../../components/shared/useOpenRecord.js";

/** The records that were not typed in the lead, funding or investor places but belong with this organisation. */
export function Gathered({ contactId }: { contactId: string }) {
  const select = useSetSelectedNode();
  const leads = useLeadDocumentsInSelectedDrive() ?? [];
  const opportunities = useOpportunityDocumentsInSelectedDrive() ?? [];
  const investorLists = useInvestorListDocumentsInSelectedDrive() ?? [];
  const proposals = useProposalDocumentsInSelectedDrive() ?? [];
  const rec = <S,>(d: { header: { id: string }; state: { global: S } }) => ({
    id: d.header.id,
    state: d.state.global,
  });
  const v = organisationView({
    contactId,
    leads: leads.map(rec),
    opportunities: opportunities.map(rec),
    investorLists: investorLists.map(rec),
    proposals: proposals.map(rec),
  });
  const link = (id: string, text: string, key = id) => (
    <li key={key}>
      <button className="pb-link" onClick={() => select(id)}>
        {text}
      </button>
    </li>
  );
  const groups: { title: string; items: React.ReactNode[] }[] = [
    {
      title: "Leads",
      items: v.leads.map((f) => link(f.id, f.name || "Untitled lead")),
    },
    {
      title: "Funding opportunities",
      items: v.opportunities.map((f) =>
        link(f.id, f.name || "Untitled opportunity"),
      ),
    },
    {
      title: "Investors",
      items: v.investorRows.map((r) =>
        link(r.listId, r.name, `${r.listId}/${r.rowId}`),
      ),
    },
    {
      title: "Proposals",
      items: v.proposals.map((f) => link(f.id, f.name || "Untitled proposal")),
    },
    {
      title: "Research",
      items: v.research.map((r) => link(r.documentId, r.title || "Untitled")),
    },
  ];
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  return (
    <Section title="Everything with this organisation" count={total}>
      {total === 0 ? (
        <p className="pb-muted">Nothing is linked to this organisation yet.</p>
      ) : (
        groups
          .filter((g) => g.items.length)
          .map((g) => (
            <div key={g.title} className="pb-mb-10">
              <div className="pb-field__label">{g.title}</div>
              <ul className="pb-list-tight pb-mt-4">{g.items}</ul>
            </div>
          ))
      )}
    </Section>
  );
}
