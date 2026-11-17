/**
 * The design-system showcase (index.html). Not part of the app: it renders
 * the generated parts (icons, the status vocabulary, the tone matrix) and
 * switches themes. In "side by side" mode, each demo is cloned into a light
 * and a dark pane, so the markup is written once.
 *
 * The page loads the bundled copy, showcase.js, so it works when opened
 * straight from disk as well as through Connect's dev server. After changing
 * this file, icons.ts or vocabulary.ts, run `bun run design`.
 */
import { ICON_GROUPS, ICONS, iconMarkup, spriteMarkup, type IconName } from "./icons.js";
import { VOCABULARY, VOCABULARY_TITLES, type Term, type VocabularyName } from "./vocabulary.js";

type Mode = "split" | "light" | "dark" | "connect";
const MODES: Mode[] = ["split", "light", "dark", "connect"];
const STORAGE_KEY = "pb-design-system:mode";
const TONES = ["gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"] as const;

/** localStorage can be unavailable (some file:// and privacy settings). */
function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Nothing to do: the choice just won't be remembered.
  }
}

function isIconName(name: string): name is IconName {
  return Object.prototype.hasOwnProperty.call(ICONS, name);
}

function isMode(value: string | null): value is Mode {
  return value !== null && (MODES as string[]).includes(value);
}

/** Replaces each `<i data-icon="name" class="…">` with the icon's SVG. */
function hydrateIcons(root: ParentNode): void {
  for (const el of root.querySelectorAll<HTMLElement>("i[data-icon]")) {
    const name = el.dataset.icon ?? "";
    if (!isIconName(name)) {
      console.warn(`Unknown icon "${name}"`);
      continue;
    }
    const extra = el.className ? ` ${el.className}` : "";
    el.outerHTML = iconMarkup(name, `pb-icon${extra}`);
  }
}

function termMarkup(name: VocabularyName, term: Term): string {
  const icon = term.icon ? iconMarkup(term.icon) : "";
  if (name === "slipping") {
    const tone = term.tone === "orange" ? " pb-signal--orange" : "";
    return `<span class="pb-signal${tone}">${icon}${term.label}</span>`;
  }
  return `<span class="pb-tag pb-tag--${term.tone}">${icon}${term.label}</span>`;
}

const BRAND_MARK =
  '<svg class="pb-brand__mark" viewBox="0 0 47.25 47.25" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M29.5486 0L10.0889 16.1136C7.23454 18.4772 7.02695 22.7819 9.64066 25.4092L16.3729 32.1763C18.3481 34.1618 18.7755 37.2129 17.4218 39.6646L13.2337 47.25H6.3C2.82061 47.25 0 44.4294 0 40.95V6.3C0 2.82061 2.82061 0 6.3 0H29.5486ZM33.2039 0L29.5691 6.62154C28.2289 9.06288 28.6507 12.0945 30.6065 14.0772L37.7482 21.3177C40.3562 23.9617 40.1229 28.2765 37.2449 30.6239L16.86 47.25H40.95C44.4294 47.25 47.25 44.4294 47.25 40.95V6.3C47.25 2.82061 44.4294 0 40.95 0H33.2039Z"/></svg>';

const VIEWS: { id: string; label: string; icon: IconName; count?: number }[] = [
  { id: "overview", label: "Overview", icon: "overview" },
  { id: "leads", label: "Leads", icon: "leads", count: 24 },
  { id: "funding", label: "Funding", icon: "funding", count: 9 },
  { id: "investors", label: "Investors", icon: "investors", count: 131 },
  { id: "organisations", label: "Organisations", icon: "organisations", count: 58 },
  { id: "decisions", label: "Decisions", icon: "decisions", count: 3 },
  { id: "playbook", label: "Playbook", icon: "playbook" },
];

/** The app's sidebar, shared by every screen mock-up: `<div data-sidebar="leads">`. */
function renderSidebars(): void {
  for (const host of document.querySelectorAll<HTMLElement>("[data-sidebar]")) {
    const active = host.dataset.sidebar;
    const item = (label: string, icon: IconName, isActive: boolean, count?: number) =>
      `<a class="pb-nav__item${isActive ? " is-active" : ""}">${iconMarkup(icon)}<span class="pb-truncate">${label}</span>${
        count === undefined ? "" : `<span class="pb-nav__count">${count}</span>`
      }</a>`;
    host.outerHTML = `<aside class="pb-sidebar">
      <div class="pb-sidebar__brand">${BRAND_MARK}Powerhouse BD${iconMarkup("chevron-down", "pb-icon pb-icon--sm")}</div>
      <nav class="pb-nav">${VIEWS.map((v) => item(v.label, v.icon, v.id === active, v.count)).join("")}</nav>
      <div class="pb-nav__label">Pinned</div>
      <nav class="pb-nav">${item("EU Accelerator Pilot", "funding", false)}${item("Kelvar Institute", "partnership", false)}</nav>
      <div class="pb-sidebar__foot">${item("Settings", "settings", active === "settings")}<a class="pb-nav__item"><span class="pb-avatar pb-avatar--blue">ML</span>Mara Lind</a></div>
    </aside>`;
  }
}

/**
 * The "Coming up" strip: `<div data-strip="2026-11-16" data-days="15"
 * data-due="2:meeting 3:step 4:deadline">`. Each due entry is the number of
 * days from the first day and what is due (deadline, meeting or step).
 */
function renderStrips(): void {
  for (const host of document.querySelectorAll<HTMLElement>("[data-strip]")) {
    const start = new Date(`${host.dataset.strip ?? ""}T00:00:00Z`);
    const due = (host.dataset.due ?? "").split(" ").filter(Boolean).map((entry) => entry.split(":"));
    const cells: string[] = [];
    for (let i = 0; i < Number(host.dataset.days ?? 15); i++) {
      const day = new Date(start);
      day.setUTCDate(start.getUTCDate() + i);
      const wd = day.getUTCDay();
      const marks = due.filter(([at]) => Number(at) === i).map(([, kind]) => `<span class="pb-strip__mark pb-strip__mark--${kind}"></span>`);
      const classes = [
        "pb-strip__day",
        i === 0 ? "is-today" : "",
        wd === 0 || wd === 6 ? "is-weekend" : "",
        wd === 1 && i > 0 ? "is-week-start" : "",
        marks.length > 0 ? "has-due" : "",
      ];
      cells.push(
        `<div class="${classes.filter(Boolean).join(" ")}"><span class="pb-strip__wd">${"SMTWTFS".charAt(wd)}</span><span class="pb-strip__num">${day.getUTCDate()}</span><span class="pb-strip__marks">${marks.join("")}</span></div>`,
      );
    }
    host.outerHTML = `<div class="pb-strip">${cells.join("")}</div>`;
  }
}

function renderVocabulary(): void {
  const host = document.querySelector("[data-vocabulary]");
  if (!host) return;
  const names = Object.keys(VOCABULARY) as VocabularyName[];
  host.innerHTML = names
    .map((name) => {
      const terms: readonly Term[] = VOCABULARY[name];
      const items = terms
        .map((term) => {
          const fix = term.action ? `<small>${term.action}</small>` : "";
          return `<span class="ds-term">${termMarkup(name, term)}${fix}<code>${term.value}</code></span>`;
        })
        .join("");
      return `<div class="ds-vocab__name">${VOCABULARY_TITLES[name]}</div><div class="ds-vocab__terms">${items}</div>`;
    })
    .join("");
}

function renderIconGrid(): void {
  const host = document.querySelector("[data-icon-grid]");
  if (!host) return;
  host.innerHTML = Object.entries(ICON_GROUPS)
    .map(([group, names]) => {
      const tiles = names
        .map((name) => `<div class="ds-icon-tile" title="${name}">${iconMarkup(name)}<span>${name}</span></div>`)
        .join("");
      return `<h3 class="ds-sub">${group}</h3><div class="ds-icons">${tiles}</div>`;
    })
    .join("");
}

function renderToneMatrix(): void {
  const host = document.querySelector("[data-tone-matrix]");
  if (!host) return;
  const head = `<div class="ds-tones__head">Tone</div><div class="ds-tones__head">Text</div><div class="ds-tones__head">Block</div><div class="ds-tones__head">Tag</div><div class="ds-tones__head">Avatar</div>`;
  const rows = TONES.map((tone) => {
    const name = tone[0].toUpperCase() + tone.slice(1);
    return [
      `<div class="ds-tones__name">${tone}</div>`,
      `<div style="color: var(--pb-${tone}-text); font-weight: 500">${name} text</div>`,
      `<div class="ds-tones__block" style="background: var(--pb-${tone}-bg)"></div>`,
      `<div><span class="pb-tag pb-tag--${tone}">${name}</span></div>`,
      `<div><span class="pb-avatar pb-avatar--md pb-avatar--${tone}">${name.slice(0, 2)}</span></div>`,
    ].join("");
  }).join("");
  host.innerHTML = head + rows;
}

/** Shows each swatch's resolved value in the theme of its pane. */
function fillSwatchValues(): void {
  for (const el of document.querySelectorAll<HTMLElement>("[data-token]")) {
    const scope = el.closest<HTMLElement>(".ds-pane") ?? document.body;
    const value = getComputedStyle(scope).getPropertyValue(`--pb-${el.dataset.token}`).trim();
    const out = el.querySelector(".ds-swatch__value");
    if (out) out.textContent = value.replace(/\s+/g, " ");
  }
}

/** Wide demos and screens do not fit side by side: they flip between themes in place. */
function isWide(demo: HTMLElement): boolean {
  return demo.classList.contains("ds-demo--wide") || demo.classList.contains("ds-demo--screen");
}

function setFlip(demo: HTMLElement, theme: "light" | "dark"): void {
  demo.dataset.flip = theme;
  const pane = demo.querySelector<HTMLElement>(":scope > .ds-pane");
  if (pane) pane.dataset.theme = theme;
  for (const button of demo.querySelectorAll<HTMLElement>(":scope > .ds-flip [data-flip-to]")) {
    button.classList.toggle("is-active", button.dataset.flipTo === theme);
  }
  fillSwatchValues();
}

function ensureFlipControl(demo: HTMLElement): void {
  if (demo.querySelector(":scope > .ds-flip")) return;
  const control = document.createElement("div");
  control.className = "ds-flip pb-segmented";
  control.setAttribute("role", "group");
  control.setAttribute("aria-label", "Theme of this example");
  control.innerHTML = `<button class="pb-segmented__item" data-flip-to="light">${iconMarkup("sun")}Light</button><button class="pb-segmented__item" data-flip-to="dark">${iconMarkup("moon")}Dark</button>`;
  for (const button of control.querySelectorAll<HTMLElement>("[data-flip-to]")) {
    button.addEventListener("click", () => setFlip(demo, button.dataset.flipTo === "dark" ? "dark" : "light"));
  }
  demo.prepend(control);
}

function applyMode(mode: Mode): void {
  writeStored(STORAGE_KEY, mode);
  if (mode === "light" || mode === "dark") document.body.dataset.theme = mode;
  else delete document.body.dataset.theme;

  for (const demo of document.querySelectorAll<HTMLElement>(".ds-demo")) {
    const panes = Array.from(demo.querySelectorAll<HTMLElement>(":scope > .ds-pane"));
    const first = panes.at(0);
    if (!first) continue;
    for (const clone of panes.slice(1)) clone.remove();
    demo.classList.remove("is-split", "is-flip");
    if (mode === "split" && isWide(demo)) {
      // Flip in place; the dark version is one click away, not a screen further down.
      ensureFlipControl(demo);
      demo.classList.add("is-flip");
      setFlip(demo, demo.dataset.flip === "dark" ? "dark" : "light");
    } else if (mode === "split") {
      first.dataset.theme = "light";
      const dark = first.cloneNode(true) as HTMLElement;
      dark.dataset.theme = "dark";
      demo.append(dark);
      demo.classList.add("is-split");
    } else if (mode === "connect") {
      delete first.dataset.theme;
    } else {
      first.dataset.theme = mode;
    }
  }

  for (const button of document.querySelectorAll<HTMLElement>("[data-mode]")) {
    button.classList.toggle("is-active", button.dataset.mode === mode);
  }
  fillSwatchValues();
}

/**
 * "Auto" follows Connect's theme, or the system's when the page is opened as a
 * file. Connect keeps its choice in localStorage ("ph:theme") and sets `.dark`
 * on the root at load; this page mirrors that, including a change made in a
 * Connect tab while this one is open.
 */
function followConnectTheme(): void {
  const stored = readStored("ph:theme");
  const system = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = stored === "dark" || ((!stored || stored === "system") && system);
  document.documentElement.classList.toggle("dark", dark);
}

function init(): void {
  // Connect's dev server rewrites the page title; put ours back.
  document.title = "Power BD · Design system";
  document.body.insertAdjacentHTML("afterbegin", spriteMarkup());
  renderSidebars();
  renderStrips();
  renderIconGrid();
  renderVocabulary();
  renderToneMatrix();
  hydrateIcons(document);

  for (const button of document.querySelectorAll<HTMLElement>("[data-mode]")) {
    button.addEventListener("click", () => {
      const mode = button.dataset.mode ?? null;
      if (isMode(mode)) applyMode(mode);
    });
  }
  // Delegated, so the cloned dark panes behave like the originals.
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const disclosure = target?.closest<HTMLElement>(".pb-disclosure");
    if (disclosure) {
      const open = disclosure.getAttribute("aria-expanded") !== "true";
      disclosure.setAttribute("aria-expanded", String(open));
      const more = disclosure.nextElementSibling;
      if (more instanceof HTMLElement && more.hasAttribute("data-more")) more.hidden = !open;
    }
    // A demo menu opens and closes from its trigger, and closes on a choice.
    const menu = target?.closest<HTMLElement>(".pb-menu");
    const trigger = menu?.querySelector<HTMLElement>(".pb-menu__trigger");
    const list = menu?.querySelector<HTMLElement>(".pb-menu__list");
    if (trigger && list && (target?.closest(".pb-menu__trigger") || target?.closest(".pb-menu__item"))) {
      list.hidden = !list.hidden;
      trigger.setAttribute("aria-expanded", String(!list.hidden));
    }
    // "Replay" restarts an entrance animation by swapping the element for a copy.
    const replay = target?.closest<HTMLElement>("[data-replay]");
    const selector = replay?.dataset.replay;
    if (replay && selector) {
      for (const el of replay.closest(".ds-pane")?.querySelectorAll<HTMLElement>(selector) ?? []) {
        el.replaceWith(el.cloneNode(true));
      }
    }
  });
  // Opened as a file there is no Connect to set the theme, so set it here.
  followConnectTheme();
  window.addEventListener("storage", (event) => {
    if (event.key === "ph:theme") followConnectTheme();
  });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", followConnectTheme);
  // Connect switches its theme with a class on <html>; keep the values shown in step.
  new MutationObserver(fillSwatchValues).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  // ?mode=light|dark|split|connect overrides the saved choice, for sharing a link.
  const requested = new URLSearchParams(location.search).get("mode");
  const saved = readStored(STORAGE_KEY);
  applyMode(isMode(requested) ? requested : isMode(saved) ? saved : "split");
}

init();
