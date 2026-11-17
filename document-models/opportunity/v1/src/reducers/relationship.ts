import type { OpportunityRelationshipOperations } from "document-models/opportunity/v1";
import {
  ConfidentialItemNotFoundError,
  ContactLinkNotFoundError,
  DuplicateConfidentialItemIdError,
  DuplicateContactLinkIdError,
  DuplicateInteractionIdError,
  DuplicateNextStepIdError,
  DuplicateReferenceError,
  DuplicateReferenceIdError,
  InteractionNotFoundError,
  InvalidTimeZoneError,
  MeetingNeedsTimeError,
  NextStepAlreadyDoneError,
  NextStepNotDoneError,
  NextStepNotFoundError,
  ReferenceNotFoundError,
} from "../../gen/relationship/error.js";

/**
 * UTC, or an IANA name of two or three parts. The name is checked for its form
 * only: runtimes carry different time-zone data, and a reducer must give the
 * same result wherever it replays.
 */
const TIME_ZONE_NAME =
  /^(?:UTC|[A-Za-z][A-Za-z0-9_+-]*(?:\/[A-Za-z0-9_+-]+){1,2})$/;

/** A meeting that is scheduled or held needs an instant and a well-formed time zone. */
function checkWhen(
  kind: string,
  status: string,
  at: string | null,
  timeZone: string | null,
) {
  if (timeZone !== null && !TIME_ZONE_NAME.test(timeZone))
    throw new InvalidTimeZoneError(
      `"${timeZone}" is not a time zone name such as Europe/Zurich`,
    );
  if (
    kind === "MEETING" &&
    status !== "CANCELLED" &&
    (at === null || timeZone === null)
  )
    throw new MeetingNeedsTimeError(
      "A scheduled or held meeting needs an instant and a time zone",
    );
}

export const opportunityRelationshipOperations: OpportunityRelationshipOperations =
  {
    addNextStepOperation(state, action) {
      const { id, text, owner, dueDate } = action.input;
      if (state.nextSteps.some((step) => step.id === id))
        throw new DuplicateNextStepIdError(`NextStep ${id} already exists`);
      state.nextSteps.push({
        id,
        text,
        owner: owner ?? null,
        dueDate: dueDate ?? null,
        doneAt: null,
      });
    },
    updateNextStepOperation(state, action) {
      const { id, text, owner, dueDate } = action.input;
      const step = state.nextSteps.find((s) => s.id === id);
      if (!step) throw new NextStepNotFoundError(`NextStep ${id} not found`);
      if (text != null) step.text = text;
      if (owner !== undefined) step.owner = owner;
      if (dueDate !== undefined) step.dueDate = dueDate;
    },
    completeNextStepOperation(state, action) {
      const { id, doneAt } = action.input;
      const step = state.nextSteps.find((s) => s.id === id);
      if (!step) throw new NextStepNotFoundError(`NextStep ${id} not found`);
      if (step.doneAt !== null)
        throw new NextStepAlreadyDoneError(`NextStep ${id} is already done`);
      step.doneAt = doneAt;
    },
    reopenNextStepOperation(state, action) {
      const { id } = action.input;
      const step = state.nextSteps.find((s) => s.id === id);
      if (!step) throw new NextStepNotFoundError(`NextStep ${id} not found`);
      if (step.doneAt === null)
        throw new NextStepNotDoneError(`NextStep ${id} is not done`);
      step.doneAt = null;
    },
    removeNextStepOperation(state, action) {
      const { id } = action.input;
      if (!state.nextSteps.some((step) => step.id === id))
        throw new NextStepNotFoundError(`NextStep ${id} not found`);
      state.nextSteps = state.nextSteps.filter((step) => step.id !== id);
    },
    addInteractionOperation(state, action) {
      const { id, kind, status, summary, people, teamMembers, notesSource } =
        action.input;
      const at = action.input.at ?? null;
      const timeZone = action.input.timeZone ?? null;
      if (state.interactions.some((interaction) => interaction.id === id))
        throw new DuplicateInteractionIdError(
          `Interaction ${id} already exists`,
        );
      checkWhen(kind, status, at, timeZone);
      state.interactions.push({
        id,
        kind,
        status,
        at,
        timeZone,
        summary: summary ?? null,
        people: (people ?? []).map((p) => ({
          contactId: p.contactId,
          personId: p.personId,
        })),
        teamMembers: teamMembers ?? [],
        notesSource: notesSource
          ? { id: notesSource.id, title: notesSource.title }
          : null,
      });
    },
    updateInteractionOperation(state, action) {
      const {
        id,
        kind,
        status,
        at,
        timeZone,
        summary,
        people,
        teamMembers,
        notesSource,
      } = action.input;
      const interaction = state.interactions.find((i) => i.id === id);
      if (!interaction)
        throw new InteractionNotFoundError(`Interaction ${id} not found`);
      const nextAt = at === undefined ? interaction.at : at;
      const nextZone = timeZone === undefined ? interaction.timeZone : timeZone;
      checkWhen(
        kind ?? interaction.kind,
        status ?? interaction.status,
        nextAt ?? null,
        nextZone ?? null,
      );
      if (kind != null) interaction.kind = kind;
      if (status != null) interaction.status = status;
      interaction.at = nextAt ?? null;
      interaction.timeZone = nextZone ?? null;
      if (summary !== undefined) interaction.summary = summary;
      if (people != null)
        interaction.people = people.map((p) => ({
          contactId: p.contactId,
          personId: p.personId,
        }));
      if (teamMembers != null) interaction.teamMembers = teamMembers;
      if (notesSource !== undefined)
        interaction.notesSource = notesSource
          ? { id: notesSource.id, title: notesSource.title }
          : null;
    },
    removeInteractionOperation(state, action) {
      const { id } = action.input;
      if (!state.interactions.some((interaction) => interaction.id === id))
        throw new InteractionNotFoundError(`Interaction ${id} not found`);
      state.interactions = state.interactions.filter(
        (interaction) => interaction.id !== id,
      );
    },
    linkContactOperation(state, action) {
      const { id, contactId, personId, role } = action.input;
      if (state.contactLinks.some((link) => link.id === id))
        throw new DuplicateContactLinkIdError(
          `ContactLink ${id} already exists`,
        );
      state.contactLinks.push({
        id,
        contactId,
        personId: personId ?? null,
        role: role ?? null,
      });
    },
    unlinkContactOperation(state, action) {
      const { id } = action.input;
      if (!state.contactLinks.some((link) => link.id === id))
        throw new ContactLinkNotFoundError(`ContactLink ${id} not found`);
      state.contactLinks = state.contactLinks.filter((link) => link.id !== id);
    },
    addReferenceOperation(state, action) {
      const { id, kind, documentId, title } = action.input;
      if (state.references.some((reference) => reference.id === id))
        throw new DuplicateReferenceIdError(`Reference ${id} already exists`);
      {
        const existing = state.references.find(
          (reference) =>
            reference.documentId === documentId && reference.kind === kind,
        );
        if (existing)
          throw new DuplicateReferenceError(
            `"${existing.title}" is already linked.`,
          );
      }
      state.references.push({ id, kind, documentId, title });
    },
    removeReferenceOperation(state, action) {
      const { id } = action.input;
      if (!state.references.some((reference) => reference.id === id))
        throw new ReferenceNotFoundError(`Reference ${id} not found`);
      state.references = state.references.filter(
        (reference) => reference.id !== id,
      );
    },
    addConfidentialItemOperation(state, action) {
      const { id, subjectContactId, text, addedBy, addedAt } = action.input;
      if (state.confidentialItems.some((item) => item.id === id))
        throw new DuplicateConfidentialItemIdError(
          `ConfidentialItem ${id} already exists`,
        );
      state.confidentialItems.push({
        id,
        subjectContactId: subjectContactId ?? null,
        text,
        addedBy,
        addedAt,
      });
    },
    removeConfidentialItemOperation(state, action) {
      const { id } = action.input;
      if (!state.confidentialItems.some((item) => item.id === id))
        throw new ConfidentialItemNotFoundError(
          `ConfidentialItem ${id} not found`,
        );
      state.confidentialItems = state.confidentialItems.filter(
        (item) => item.id !== id,
      );
    },
  };
