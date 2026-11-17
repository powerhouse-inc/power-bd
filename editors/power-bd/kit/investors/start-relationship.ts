/**
 * "Start a relationship": three ordinary steps in sequence. A failure stops
 * the run and says which step failed and what already exists.
 */

export interface StartRow {
  id: string;
  name: string;
  website?: string | null;
}

export interface StartDeps {
  /** Creates the organisation (a contact) and returns its id. */
  createContact: (row: StartRow) => Promise<string>;
  /** Creates the investor lead for that organisation and returns its id. */
  createLead: (row: StartRow, organisationId: string) => Promise<string>;
  /** Marks the row engaged with both ids. */
  markEngaged: (
    row: StartRow,
    organisationId: string,
    leadId: string,
  ) => Promise<void>;
}

export type StartStep = "contact" | "lead" | "mark";

export type StartResult =
  | { ok: true; organisationId: string; leadId: string }
  | {
      ok: false;
      step: StartStep;
      message: string;
      created: { organisationId?: string; leadId?: string };
    };

const messageOf = (e: unknown) => (e instanceof Error ? e.message : String(e));

export async function startRelationship(
  row: StartRow,
  deps: StartDeps,
): Promise<StartResult> {
  const created: { organisationId?: string; leadId?: string } = {};
  let step: StartStep = "contact";
  try {
    created.organisationId = await deps.createContact(row);
    step = "lead";
    created.leadId = await deps.createLead(row, created.organisationId);
    step = "mark";
    await deps.markEngaged(row, created.organisationId, created.leadId);
    return {
      ok: true,
      organisationId: created.organisationId,
      leadId: created.leadId,
    };
  } catch (e) {
    return { ok: false, step, message: messageOf(e), created };
  }
}

/** What each step is called in the UI. */
export const STEP_LABELS: Record<StartStep, string> = {
  contact: "Creating the organisation",
  lead: "Creating the investor lead",
  mark: "Marking the investor as engaged",
};
