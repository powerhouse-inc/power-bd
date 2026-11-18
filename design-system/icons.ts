/**
 * Power BD icons: a 24 × 24 grid, 1.5 px strokes, round caps and joins, drawn
 * in `currentColor`. Each entry is the inner markup of one icon. The sprite
 * turns them into `<symbol id="pb-i-<name>">`, used as
 * `<svg class="pb-icon"><use href="#pb-i-<name>"/></svg>`.
 *
 * The icons are a TS module rather than an .svg file, so the app imports them
 * without `?raw` (which `ph build` cannot load) and icon names are type-checked.
 */
export const ICONS = {
  // Navigation
  overview:
    '<rect x="3.5" y="3.5" width="7" height="9" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="5" rx="1.5"/><rect x="13.5" y="11.5" width="7" height="9" rx="1.5"/><rect x="3.5" y="15.5" width="7" height="5" rx="1.5"/>',
  leads:
    '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  proposal:
    '<path d="M14 3.5H7A1.5 1.5 0 0 0 5.5 5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3.5V8h4.5"/><path d="M9 11.5h6"/><path d="M8.5 16.5c1-2 2-2 2.6-.4.5 1.4 1.3 1.4 2 .2.5-.8 1.2-.8 2.4.2"/>',
  funding:
    '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9.5v5M18 9.5v5"/>',
  investors: '<path d="M3.5 17 9 11.5l3.5 3.5 8-8"/><path d="M15 7h5.5v5.5"/>',
  organisations:
    '<path d="M4.5 20.5v-16a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16"/><path d="M15.5 9.5h3a1 1 0 0 1 1 1v10"/><path d="M8 7.5h1M11 7.5h1M8 11h1M11 11h1M8 14.5h1M11 14.5h1"/><path d="M8.5 20.5v-3h3v3"/><path d="M3 20.5h18"/>',
  decisions:
    '<path d="M12 21v-9"/><path d="M12 12 6.5 6.5"/><path d="m12 12 5.5-5.5"/><path d="M6 10.5V6h4.5"/><path d="M18 10.5V6h-4.5"/>',
  playbook:
    '<path d="M3 5.5c2.8-1 5.8-1 9 1v13c-3.2-2-6.2-2-9-1z"/><path d="M21 5.5c-2.8-1-5.8-1-9 1v13c3.2-2 6.2-2 9-1z"/>',
  settings:
    '<path d="M10.35 5.61 L10.58 3.01 L13.42 3.01 L13.65 5.61 L15.35 6.31 L17.35 4.64 L19.36 6.65 L17.69 8.65 L18.39 10.35 L20.99 10.58 L20.99 13.42 L18.39 13.65 L17.69 15.35 L19.36 17.35 L17.35 19.36 L15.35 17.69 L13.65 18.39 L13.42 20.99 L10.58 20.99 L10.35 18.39 L8.65 17.69 L6.65 19.36 L4.64 17.35 L6.31 15.35 L5.61 13.65 L3.01 13.42 L3.01 10.58 L5.61 10.35 L6.31 8.65 L4.64 6.65 L6.65 4.64 L8.65 6.31z"/><circle cx="12" cy="12" r="2.9"/>',

  // Kinds of relationship
  sales:
    '<path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7a1 1 0 0 1 .7.3l7.6 7.6a1 1 0 0 1 0 1.4l-7.7 7.7a1 1 0 0 1-1.4 0l-7.6-7.6a1 1 0 0 1-.3-.7z"/><circle cx="8" cy="8" r="1.5"/>',
  partnership:
    '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  exchange:
    '<path d="M4 8h15"/><path d="m15.5 4.5 3.5 3.5-3.5 3.5"/><path d="M20 16H5"/><path d="m8.5 12.5-3.5 3.5 3.5 3.5"/>',
  funder:
    '<path d="M3 9.5 12 4l9 5.5"/><path d="M5.5 10.5v7M10 10.5v7M14 10.5v7M18.5 10.5v7"/><path d="M3 20.5h18"/>',

  // Actions
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  filter: '<path d="M4 6.5h16M7 12h10M10 17.5h4"/>',
  sort: '<path d="M7 4v16M3.5 16.5 7 20l3.5-3.5"/><path d="M17 20V4M13.5 7.5 17 4l3.5 3.5"/>',
  edit: '<path d="M15.5 4.5 19.5 8.5 8.5 19.5H4.5v-4z"/><path d="m13.5 6.5 4 4"/>',
  copy: '<rect x="8.5" y="8.5" width="12" height="12" rx="2"/><path d="M15.5 8.5v-3a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3"/>',
  trash:
    '<path d="M4 6.5h16"/><path d="M9 6.5v-2h6v2"/><path d="m6.5 6.5 1 12.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5l1-12.5"/>',
  archive:
    '<rect x="3" y="4" width="18" height="4.5" rx="1"/><path d="M5 8.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V8.5"/><path d="M10 12.5h4"/>',
  send: '<path d="M21 3 10.5 13.5"/><path d="M21 3 14.5 21l-4-7.5L3 9.5z"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  external:
    '<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
  more: '<circle cx="5.5" cy="12" r="1.25"/><circle cx="12" cy="12" r="1.25"/><circle cx="18.5" cy="12" r="1.25"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  "chevron-right": '<path d="m9 6 6 6-6 6"/>',
  "chevron-left": '<path d="m15 6-6 6 6 6"/>',
  "arrow-right": '<path d="M4.5 12h15M14 6.5l5.5 5.5-5.5 5.5"/>',
  "arrow-up-right": '<path d="M7 17 17 7M8.5 7H17v8.5"/>',
  refresh:
    '<path d="M20 12a8 8 0 0 1-14.3 4.9"/><path d="M4 12a8 8 0 0 1 14.3-4.9"/><path d="M18.5 3.5v4h-4"/><path d="M5.5 20.5v-4h4"/>',

  // Objects
  user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5"/>',
  users:
    '<circle cx="9" cy="9" r="3.2"/><path d="M3 19.5c.6-3.1 3-5 6-5s5.4 1.9 6 5"/><path d="M15.5 6.2a3 3 0 0 1 0 5.6"/><path d="M17.5 14.7c1.8.6 3.1 2.2 3.5 4.8"/>',
  note: '<path d="M14 3.5H7A1.5 1.5 0 0 0 5.5 5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3.5V8h4.5"/><path d="M9 12.5h6M9 16h4"/>',
  source:
    '<path d="M14 3.5H7A1.5 1.5 0 0 0 5.5 5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3.5V8h4.5"/><path d="M9.5 13.5h1.5v2.5M13 13.5h1.5v2.5"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  phone:
    '<path d="M6.5 3.5h3l1.5 4.5-2 1.3a10 10 0 0 0 5.7 5.7l1.3-2 4.5 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"/>',
  meeting: '<rect x="3" y="6.5" width="12.5" height="11" rx="2"/><path d="m15.5 10.5 5.5-3v9l-5.5-3"/>',
  message: '<path d="M20.5 15a2 2 0 0 1-2 2H8l-4.5 3.5V6a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/>',
  event:
    '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="m12 12.8.9 1.9 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3z"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  hourglass:
    '<path d="M6.5 3.5h11M6.5 20.5h11"/><path d="M7.5 3.5c0 4 4.5 5 4.5 8.5s-4.5 4.5-4.5 8.5M16.5 3.5c0 4-4.5 5-4.5 8.5s4.5 4.5 4.5 8.5"/>',
  globe:
    '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.3 2.4 3.5 5.2 3.5 8.5s-1.2 6.1-3.5 8.5c-2.3-2.4-3.5-5.2-3.5-8.5s1.2-6.1 3.5-8.5z"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
  percent: '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
  hash: '<path d="M9.5 3.5 8 20.5M16 3.5l-1.5 17M4.5 9h16M3.5 15h16"/>',
  compass: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  star: '<path d="m12 3.8 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8z"/>',
  checklist:
    '<path d="m4 6.5 1.5 1.5L8 5.5M4 12.5l1.5 1.5L8 11.5"/><path d="M11 7h9M11 13h9M11 19h9"/><path d="M4.5 18.5h3"/>',
  inbox:
    '<path d="m3.5 13.5 2.5-8a1.5 1.5 0 0 1 1.4-1h9.2a1.5 1.5 0 0 1 1.4 1l2.5 8"/><path d="M3.5 13.5V18A1.5 1.5 0 0 0 5 19.5h14a1.5 1.5 0 0 0 1.5-1.5v-4.5h-5L14 16h-4l-1.5-2.5z"/>',
  history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3.5 4v4h4"/><path d="M12 8v4.5l3 1.8"/>',
  sparkles:
    '<path d="m12 3.5 1.6 4.9 4.9 1.6-4.9 1.6-1.6 4.9-1.6-4.9L5.5 10l4.9-1.6z"/><path d="m18.5 15.5.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',

  // Status and signals
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5v-3a4 4 0 0 1 8 0v3"/>',
  "people-only":
    '<circle cx="10" cy="8.5" r="3.5"/><path d="M3.5 20c.8-3.5 3.3-5.5 6.5-5.5 1.4 0 2.6.3 3.6 1"/><path d="m15.5 18 2 2 4-4.5"/>',
  flag: '<path d="M5 21V4"/><path d="M5 4.5h11l-2 4 2 4H5"/>',
  slipping: '<path d="M3.5 7 9 12.5l3.5-3.5 8 8"/><path d="M15 17h5.5v-5.5"/>',
  alert:
    '<path d="M10.3 4.2 2.9 17.2A2 2 0 0 0 4.6 20h14.8a2 2 0 0 0 1.7-2.8L13.7 4.2a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4"/><path d="M12 16.8v.2"/>',
  "alert-circle": '<circle cx="12" cy="12" r="8.5"/><path d="M12 8v4.5"/><path d="M12 15.8v.2"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><path d="M12 8v.2"/>',
  "check-circle": '<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.2 2.5 2.5 4.8-5"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',

  // Reassurance, saving and panels
  shield: '<path d="M12 3.5 5 6.2v5.3c0 4.3 3 7.6 7 9 4-1.4 7-4.7 7-9V6.2z"/><path d="m9 12 2 2 4-4"/>',
  cloud: '<path d="M7 18.5a4.5 4.5 0 0 1-.5-8.97A6 6 0 0 1 18 8.5a4 4 0 0 1-.5 10z"/><path d="m9.5 13.3 2 2 3.3-3.6"/>',
  "cloud-off": '<path d="M7 18.5a4.5 4.5 0 0 1-.5-8.97A6 6 0 0 1 18 8.5a4 4 0 0 1-.5 10z"/><path d="M4 4l16 16"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  peek: '<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M14.5 4v16"/>',
  expand: '<path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5"/>',

  // Views and theme
  board: '<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M9.2 4v16M14.8 4v16"/>',
  table: '<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M3.5 9.5h17M3.5 15h17M9.5 9.5V20"/>',
  sidebar: '<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M9.5 4v16"/>',
  sun: '<circle cx="12" cy="12" r="3.8"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  monitor: '<rect x="3" y="4" width="18" height="12.5" rx="2"/><path d="M8.5 20.5h7M12 16.5v4"/>',
} as const;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

/** Groups for the design-system showcase. Every icon appears in at least one group. */
export const ICON_GROUPS: Record<string, IconName[]> = {
  Navigation: ["overview", "leads", "funding", "investors", "organisations", "decisions", "chart", "playbook", "settings"],
  "Kinds of relationship": ["sales", "partnership", "exchange", "investors", "funding", "funder"],
  Actions: [
    "plus", "search", "filter", "sort", "edit", "copy", "trash", "archive", "send", "link", "external", "more",
    "close", "check", "chevron-down", "chevron-right", "chevron-left", "arrow-right", "arrow-up-right", "refresh",
  ],
  Objects: [
    "user", "users", "note", "source", "mail", "phone", "meeting", "message", "event", "calendar", "clock",
    "hourglass", "globe", "pin", "percent", "hash", "compass", "star", "checklist", "inbox", "history", "sparkles",
  ],
  "Status and signals": ["lock", "people-only", "flag", "slipping", "alert", "alert-circle", "info", "check-circle", "eye"],
  "Reassurance, saving and panels": ["shield", "cloud", "cloud-off", "undo", "peek", "expand"],
  "Views and theme": ["board", "table", "sidebar", "sun", "moon", "monitor"],
};

/** The whole set as one hidden SVG sprite, to insert once per page. */
export function spriteMarkup(): string {
  const symbols = ICON_NAMES.map(
    (name) => `<symbol id="pb-i-${name}" viewBox="0 0 24 24">${ICONS[name]}</symbol>`,
  ).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">${symbols}</svg>`;
}

/** One icon's markup, for places that render HTML strings. */
export function iconMarkup(name: IconName, className = "pb-icon"): string {
  return `<svg class="${className}" aria-hidden="true"><use href="#pb-i-${name}"/></svg>`;
}
