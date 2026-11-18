import type { PlaceId } from "../places.js";
import { recordTitle } from "../record-name/index.js";

/** What the rule reads from a record: its id, type and name, and its state. */
export type RecordLike = {
  header: { id: string; documentType: string; name: string; slug?: string };
  state: unknown;
};

/**
 * The records a person may delete, with the place each lives in and what
 * keeps its history instead. The space's own records (settings, playbook,
 * investor list) are never deleted: the space needs them.
 */
type Deletable = { noun: string; place: PlaceId; instead: string | null };
const KINDS = {
  "powerbd/lead": { noun: "lead", place: "leads", instead: "close it as lost or park it" },
  "powerbd/opportunity": { noun: "funding opportunity", place: "funding", instead: "withdraw it" },
  "powerbd/contact": { noun: "organisation", place: "organisations", instead: "archive it" },
  "powerbd/decision": { noun: "decision", place: "decisions", instead: "withdraw it" },
  "powerbd/proposal": { noun: "proposal", place: "proposals", instead: null },
  "powerbd/market": { noun: "market", place: "market", instead: null },
} satisfies Record<string, Deletable>;
const DELETABLE: Partial<Record<string, Deletable>> = KINDS;

/** Every record kind in the team's words, for naming what links to a record. */
const NOUNS: Record<string, string> = {
  ...Object.fromEntries(Object.entries(KINDS).map(([type, d]) => [type, d.noun])),
  "powerbd/investor-list": "investor list",
  "powerbd/playbook": "playbook",
  "powerbd/settings": "settings",
};

/** The space's own records: named by kind alone ("the investor list"). */
const SPACE_RECORDS = new Set(["powerbd/investor-list", "powerbd/playbook", "powerbd/settings"]);

/** Statuses that mean the client has the proposal, whatever else is recorded. */
const WITH_CLIENT = new Set(["SENT", "ACCEPTED", "DECLINED"]);

/** A record that links to the one being deleted. */
export type Link = { id: string; noun: string; name: string };

export type DeleteVerdict =
  | { may: true }
  | { may: false; why: "sent"; stillOpen: boolean }
  | { may: false; why: "linked"; links: Link[] };

/** Whether a record of this type can be deleted at all; the space's own records never are. */
export const isDeletable = (documentType: string): boolean => documentType in DELETABLE;

/** The place a deleted record's list lives in, to go back to. */
export const placeAfterDelete = (documentType: string): PlaceId => DELETABLE[documentType]?.place ?? "overview";

const globalOf = (record: RecordLike) =>
  (record.state as { global?: { status?: unknown; sentAt?: unknown } } | undefined)?.global ?? {};

/** Whether a proposal reached the client: once it did, it is the record of what they received. A draft withdrawn before sending never did. */
function wasSent(record: RecordLike): boolean {
  const { status, sentAt } = globalOf(record);
  return Boolean(sentAt) || (typeof status === "string" && WITH_CLIENT.has(status));
}

/**
 * The records whose content names this one: a lead's organisation, a
 * proposal's lead, a market's players, the investor list's rows, a funding
 * opportunity's decisions and every other link, whatever field holds it.
 * Ids are long and random, so a record that mentions one links to it.
 */
export function linksTo(record: RecordLike, others: readonly RecordLike[]): Link[] {
  const id = record.header.id;
  const needle = JSON.stringify(id);
  return others
    .filter((o) => o.header.id !== id && o.header.documentType.startsWith("powerbd/"))
    .filter((o) => JSON.stringify(o.state ?? null).includes(needle))
    .map((o) => ({
      id: o.header.id,
      noun: NOUNS[o.header.documentType] ?? "record",
      name: SPACE_RECORDS.has(o.header.documentType) ? "" : (recordTitle(o.header.documentType, o.state) ?? o.header.name),
    }));
}

/** Whether a record may be deleted now, and why not; null for the space's own records, which never are. */
export function deleteVerdict(record: RecordLike, others: readonly RecordLike[]): DeleteVerdict | null {
  if (!isDeletable(record.header.documentType)) return null;
  if (record.header.documentType === "powerbd/proposal" && wasSent(record))
    return { may: false, why: "sent", stillOpen: globalOf(record).status === "SENT" };
  const links = linksTo(record, others);
  return links.length > 0 ? { may: false, why: "linked", links } : { may: true };
}

const PLURALS: Record<string, string> = { "funding opportunity": "funding opportunities" };
const plural = (noun: string) => PLURALS[noun] ?? `${noun}s`;

/** 'the lead "Kelvar pilot"', '2 proposals "Pilot"' for records of one name, "the investor list" for the space's own. */
const named = ({ noun, name, count }: { noun: string; name: string; count: number }) =>
  count > 1 ? `${count} ${plural(noun)} "${name}"` : name ? `the ${noun} "${name}"` : `the ${noun}`;

/** Up to three links by name, records of one kind and name together, then how many more. */
function listOf(links: readonly Link[]): string {
  const groups: { noun: string; name: string; count: number }[] = [];
  for (const link of links) {
    const same = link.name ? groups.find((g) => g.noun === link.noun && g.name === link.name) : undefined;
    if (same) same.count += 1;
    else groups.push({ noun: link.noun, name: link.name, count: 1 });
  }
  const shown = groups.slice(0, 3).map(named);
  const more = groups.slice(3).reduce((n, g) => n + g.count, 0);
  const all = more > 0 ? [...shown, `${more} more`] : shown;
  return all.length > 1 ? `${all.slice(0, -1).join(", ")} and ${all.at(-1)}` : all[0];
}

export type DeleteWords = {
  button: string;
  confirm: string;
  yes: string;
  keep: string;
  /** Why it can't be deleted now, when it can't. */
  refusal: string | null;
};

/** What the delete section says, in the team's words. */
export function deleteWords(documentType: string, verdict: DeleteVerdict): DeleteWords {
  const { noun, instead } = DELETABLE[documentType] ?? { noun: "record", instead: null };
  const keepHistory = instead ? ` To keep its history, ${instead} instead.` : "";
  const refusal = verdict.may
    ? null
    : verdict.why === "sent"
      ? `A sent proposal stays as the record of what the client received.${verdict.stillOpen ? " If it no longer stands, withdraw it." : ""}`
      : `Other records link to this ${noun}: ${listOf(verdict.links)}. Change or delete those first${instead ? `, or ${instead} instead` : ""}.`;
  return {
    button: `Delete this ${noun}`,
    confirm: `Deleting removes this ${noun} and its history for everyone in the space. It can't be undone.${keepHistory}`,
    yes: "Yes, delete",
    keep: "Keep it",
    refusal,
  };
}

/**
 * Why the chat's agent may not delete a record, or null when it may: the
 * record page's rule, so the agent never deletes what the page keeps. It
 * deletes only this space's records (never the space itself or a vault
 * note), and refuses when the records could not be read.
 */
export function agentDeleteRefusal(documentId: string, records: readonly RecordLike[] | undefined): string | null {
  if (!records) return "The space's records could not be read, so whether this record may be deleted is unknown. Try again in a moment.";
  const target = records.find((r) => r.header.id === documentId || r.header.slug === documentId);
  if (!target) return "Only the BD space's records can be deleted from the chat.";
  const verdict = deleteVerdict(target, records);
  if (!verdict) return "The settings, playbook and investor list are the space's own records: they are never deleted.";
  return deleteWords(target.header.documentType, verdict).refusal;
}
