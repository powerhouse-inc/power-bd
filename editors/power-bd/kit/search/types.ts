import type { IconName } from "../../../../design-system/icons.js";
import type { Tone } from "../../../../design-system/vocabulary.js";
import type { MemberLike } from "../settings/settings.js";

/** The kinds of thing search finds, in the order their groups show. */
export const KINDS = [
  "lead",
  "opportunity",
  "proposal",
  "organisation",
  "person",
  "investor",
  "decision",
  "playbook",
] as const;
export type Kind = (typeof KINDS)[number];

/** Where a result goes when it is opened. */
export type Target =
  /** A record's own page. */
  | { type: "record"; id: string }
  /** The Investors place, with this row of the list open. */
  | { type: "investor-row"; rowId: string }
  /** The Playbook place. */
  | { type: "playbook" }
  /** A result of another source: that source opens it. */
  | { type: "provider"; providerId: string; ref: string };

/** One searchable text of an entry besides its title, with the name the UI gives it. */
export type Field = { label: string; text: string };

export type Tag = { label: string; tone: Tone };

/** One thing search can find. */
export type Entry = {
  /** Unique across the index. */
  key: string;
  /** A `Kind`, or the id of the source that gave it. */
  group: string;
  icon: IconName;
  title: string;
  /** The quiet line beside the title: whose it is, or what it is. */
  detail: string | null;
  fields: Field[];
  tag: Tag | null;
  /** The owner's address; null for nobody; undefined when the kind has no owner. */
  owner?: string | null;
  target: Target;
  /** When the record last changed; null for what is not a record of its own. */
  changedAt: string | null;
};

type Rec<S> = { id: string; state: S };
type Step = { id: string; text: string; doneAt?: string | null };

/**
 * What the index is built from. Each state lists only the fields search may
 * read: confidential items are not among them, so the index cannot hold them.
 */
export type SearchInput = {
  members: readonly MemberLike[];
  /** When each record last changed, by id. */
  changed: Partial<Record<string, string>>;
  leads: readonly Rec<{
    name?: string | null;
    kind?: string | null;
    status: string;
    statusReason?: string | null;
    owner?: string | null;
    organisationId?: string | null;
    nextSteps: readonly Step[];
    contactLinks: readonly { contactId: string; personId?: string | null }[];
    interactions: readonly { summary?: string | null }[];
  }>[];
  opportunities: readonly Rec<{
    name?: string | null;
    status: string;
    statusReason?: string | null;
    owner?: string | null;
    funderId?: string | null;
    instrument?: string | null;
    roundLabel?: string | null;
    programme?: { title: string } | null;
    whereToApply?: string | null;
    nextSteps: readonly Step[];
    partners: readonly { organisationId: string; role?: string | null }[];
  }>[];
  contacts: readonly Rec<{
    name?: string | null;
    status: string;
    website?: string | null;
    email?: string | null;
    notes?: string | null;
    tags: readonly string[];
    people: readonly {
      id: string;
      name: string;
      role?: string | null;
      email?: string | null;
    }[];
  }>[];
  investorLists: readonly Rec<{
    rows: readonly {
      id: string;
      name: string;
      state: string;
      website?: string | null;
      sourceList?: string | null;
      exclusionReason?: string | null;
      organisationId?: string | null;
    }[];
  }>[];
  proposals: readonly Rec<{
    title?: string | null;
    code?: string | null;
    status: string;
    reason?: string | null;
    leadId?: string | null;
    recipient?: { contactId: string; personId?: string | null } | null;
  }>[];
  decisions: readonly Rec<{
    question?: string | null;
    status: string;
    owner?: string | null;
    context?: string | null;
    answer?: string | null;
    reason?: string | null;
  }>[];
  playbooks: readonly Rec<{
    positioning: readonly {
      id: string;
      title: string;
      text: string;
      status: string;
    }[];
    proofCases: readonly {
      id: string;
      title: string;
      summary?: string | null;
    }[];
    neverClaims: readonly {
      id: string;
      claim: string;
      phrases: readonly string[];
      reason?: string | null;
    }[];
  }>[];
};

/**
 * Another source of results (the vault's notes, once wired): the palette shows
 * what it finds as a group of its own, under `label`, and hands a chosen result
 * back to it by the `ref` of its target. None is registered yet.
 */
export type SearchProvider = {
  id: string;
  label: string;
  /** Entries for a query, each with `group` set to this id and a `provider` target. */
  search: (query: string, signal: AbortSignal) => Promise<Entry[]>;
  open: (ref: string) => void;
};
