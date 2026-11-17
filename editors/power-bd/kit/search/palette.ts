/**
 * What the palette shows: sections of results, capped; recent records and
 * quick actions when nothing is typed; and where the arrow keys go. Pure.
 */
import type { IconName } from "../../../../design-system/icons.js";
import { queryWords, normalise, search, type Hit } from "./match.js";
import type { PlaceId } from "../places.js";
import { KINDS, type Entry, type Kind } from "./types.js";

/** Results shown per group before "n more". */
export const GROUP_CAP = 5;
/** Records shown under "Recent". */
export const RECENT_COUNT = 5;

/** Each kind's group title, and its plural inside a sentence. */
const GROUPS: Record<
  Kind,
  { label: string; plural: string; place: PlaceId }
> = {
  lead: { label: "Leads", plural: "leads", place: "leads" },
  opportunity: {
    label: "Funding opportunities",
    plural: "funding opportunities",
    place: "funding",
  },
  proposal: { label: "Proposals", plural: "proposals", place: "proposals" },
  organisation: {
    label: "Organisations",
    plural: "organisations",
    place: "organisations",
  },
  person: { label: "People", plural: "people", place: "organisations" },
  investor: { label: "Investors", plural: "investors", place: "investors" },
  decision: { label: "Decisions", plural: "decisions", place: "decisions" },
  playbook: { label: "Playbook", plural: "playbook items", place: "playbook" },
};

const isKind = (group: string): group is Kind =>
  (KINDS as readonly string[]).includes(group);

/** The place a result of this group lives in; null for another source's results. */
export function placeOf(group: string): PlaceId | null {
  return isKind(group) ? GROUPS[group].place : null;
}

/** The keys of the search shortcut, as this keyboard names them. */
export function shortcutKeys(platform: string): [string, string] {
  return [/mac|iphone|ipad/i.test(platform) ? "⌘" : "Ctrl", "K"];
}

/** Whether a key press is the search shortcut: ⌘K or Ctrl+K, nothing else held. */
export function isShortcut(e: {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey?: boolean;
}): boolean {
  return (e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "k";
}

export type QuickAction = {
  id: "new-lead" | "new-opportunity" | "new-organisation";
  label: string;
  icon: IconName;
  /** The place the new record lands in. */
  place: PlaceId;
};

/** What can be started from the palette: only what the app can really create. */
export const QUICK_ACTIONS: readonly QuickAction[] = [
  { id: "new-lead", label: "New lead", icon: "leads", place: "leads" },
  {
    id: "new-opportunity",
    label: "New funding opportunity",
    icon: "funding",
    place: "funding",
  },
  {
    id: "new-organisation",
    label: "New organisation",
    icon: "organisations",
    place: "organisations",
  },
];

export type Item =
  | { type: "result"; id: string; hit: Hit }
  | { type: "action"; id: string; action: QuickAction }
  /** The rest of a capped group; choosing it shows the group whole. */
  | { type: "more"; id: string; group: string; count: number; label: string };

export type Section = { id: string; label: string; items: Item[] };

/** Results of another source (the vault's notes, once wired), shown as a group of their own. */
export type ExtraGroup = {
  id: string;
  label: string;
  entries: readonly Entry[];
};

/** An element id for a key: letters, digits, "-" and "_" only. */
const domId = (key: string) =>
  `pb-search-${key.replaceAll(/[^A-Za-z0-9_-]/g, "-")}`;

const result = (hit: Hit): Item => ({
  type: "result",
  id: domId(hit.entry.key),
  hit,
});

/** The records changed last, newest first. People, investor rows and playbook items are not records of their own. */
export function recentEntries(
  entries: readonly Entry[],
  count = RECENT_COUNT,
): Entry[] {
  return entries
    .flatMap((entry) =>
      entry.changedAt === null ? [] : [{ entry, at: entry.changedAt }],
    )
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, count)
    .map((r) => r.entry);
}

function capped(
  id: string,
  label: string,
  plural: string | null,
  hits: readonly Hit[],
  whole: boolean,
): Section {
  // One over the cap shows whole: a row saying "1 more" would take its line.
  if (whole || hits.length <= GROUP_CAP + 1)
    return { id, label, items: hits.map(result) };
  const count = hits.length - GROUP_CAP;
  return {
    id,
    label,
    items: [
      ...hits.slice(0, GROUP_CAP).map(result),
      {
        type: "more",
        id: domId(`more:${id}`),
        group: id,
        count,
        label: plural ? `${count} more ${plural}` : `${count} more`,
      },
    ],
  };
}

const actionItems = (actions: readonly QuickAction[]): Item[] =>
  actions.map((action) => ({
    type: "action",
    id: domId(`action:${action.id}`),
    action,
  }));

/**
 * The palette's sections. Nothing typed: recent records and the quick
 * actions. A query: results by kind in a fixed order, each group capped unless
 * its id is in `expanded`, then the groups of other sources, then the quick
 * actions whose words were typed. No section at all means nothing matched.
 */
export function paletteSections(input: {
  entries: readonly Entry[];
  query: string;
  expanded?: readonly string[];
  extra?: readonly ExtraGroup[];
}): Section[] {
  const words = queryWords(input.query);
  const start = (actions: readonly QuickAction[]): Section[] =>
    actions.length > 0
      ? [
          {
            id: "actions",
            label: "Start something new",
            items: actionItems(actions),
          },
        ]
      : [];

  if (words.length === 0) {
    const recent = recentEntries(input.entries);
    return [
      ...(recent.length > 0
        ? [
            {
              id: "recent",
              label: "Recent",
              items: recent.map((entry) =>
                result({ entry, rank: 1, field: null }),
              ),
            },
          ]
        : []),
      ...start(QUICK_ACTIONS),
    ];
  }

  const whole = (id: string) => input.expanded?.includes(id) ?? false;
  const hits = search(input.entries, input.query);
  const records = KINDS.map((kind) =>
    capped(
      kind,
      GROUPS[kind].label,
      GROUPS[kind].plural,
      hits.filter((h) => h.entry.group === kind),
      whole(kind),
    ),
  );
  const extra = (input.extra ?? []).map((g) =>
    capped(
      g.id,
      g.label,
      null,
      g.entries.map((entry) => ({ entry, rank: 1, field: null })),
      whole(g.id),
    ),
  );
  return [
    ...[...records, ...extra].filter((s) => s.items.length > 0),
    ...start(
      QUICK_ACTIONS.filter((a) => {
        const label = normalise(a.label);
        return words.every((w) => label.includes(w));
      }),
    ),
  ];
}

/** Every item's id, in the order the arrow keys walk them. */
export function itemIds(sections: readonly Section[]): string[] {
  return sections.flatMap((s) => s.items.map((i) => i.id));
}

/**
 * Where a key moves the active item: down and up walk every item across the
 * groups and wrap; Page Down and Page Up go to the ends. `null` when there is
 * nothing to be on; `undefined` for a key the list leaves to the text field
 * (Home and End among them, which move the caret).
 */
export function moveActive(
  sections: readonly Section[],
  active: string | null,
  key: string,
): string | null | undefined {
  if (!["ArrowDown", "ArrowUp", "PageDown", "PageUp"].includes(key))
    return undefined;
  const ids = itemIds(sections);
  if (ids.length === 0) return null;
  const at = active === null ? -1 : ids.indexOf(active);
  const last = ids.length - 1;
  switch (key) {
    case "ArrowDown":
      return ids[at >= last ? 0 : at + 1];
    case "ArrowUp":
      return ids[at <= 0 ? last : at - 1];
    case "PageDown":
      return ids[last];
    default:
      return ids[0];
  }
}

/** What to say when a query finds nothing. */
export function noResultsLine(query: string): { title: string; text: string } {
  return {
    title: `Nothing matches “${query.trim()}”`,
    text: "Search looks at names, organisations, people, next steps, proposal codes and statuses. Try fewer or shorter words.",
  };
}
