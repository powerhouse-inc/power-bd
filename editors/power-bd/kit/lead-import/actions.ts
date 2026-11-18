import { actions as contactActions, type ContactAction } from "document-models/contact";
import { actions as leadActions, type LeadAction } from "document-models/lead";
import type { LeadChange, OrganisationChange } from "./run.js";

/** The actions that make an organisation what the import says, as its page would send them. */
export function organisationActions(change: OrganisationChange): ContactAction[] {
  const out: ContactAction[] = [];
  if (change.profile || change.notes !== null)
    out.push(
      contactActions.setProfile({
        ...(change.profile ? { name: change.profile.name, website: change.profile.website ?? undefined } : {}),
        ...(change.notes !== null ? { notes: change.notes } : {}),
      }),
    );
  if (change.person)
    out.push(
      contactActions.addPerson({
        id: change.person.id,
        name: change.person.name,
        role: change.person.role ?? undefined,
        email: change.person.email ?? undefined,
        phone: change.person.phone ?? undefined,
      }),
    );
  return out;
}

/**
 * The actions that make a new lead what the import says, in the order its
 * rules need: name, kind and organisation, then the owner, then a status past
 * "to contact", then the next step and the contact person.
 */
export function leadActionsFor(change: LeadChange, changedAt: string): LeadAction[] {
  const out: LeadAction[] = [
    leadActions.setLeadDetails({
      name: change.name,
      ...(change.kind ? { kind: change.kind } : {}),
      ...(change.organisationId ? { organisationId: change.organisationId } : {}),
    }),
  ];
  if (change.owner) out.push(leadActions.setOwner({ owner: change.owner }));
  if (change.status !== "TO_CONTACT") out.push(leadActions.setLeadStatus({ status: change.status, changedAt }));
  if (change.nextStep)
    out.push(
      leadActions.addNextStep({
        id: change.nextStep.id,
        text: change.nextStep.text,
        owner: change.nextStep.owner ?? undefined,
        dueDate: change.nextStep.dueDate ?? undefined,
      }),
    );
  if (change.contact)
    out.push(
      leadActions.linkContact({
        id: change.contact.id,
        contactId: change.contact.contactId,
        personId: change.contact.personId,
        role: change.contact.role ?? undefined,
      }),
    );
  return out;
}
