/** Whether a menu is open and which option the keyboard is on. */
export type MenuState = { open: boolean; active: number };
/** The state after a key; `select` is the option the key chose. */
export type MenuStep = MenuState & { select?: number };

const OPENERS = new Set(["ArrowDown", "ArrowUp", "Enter", " "]);

/**
 * What a key does to a menu: arrows, Home and End move, Enter and Space
 * choose, Escape closes, a letter jumps to the next option starting with it.
 * `null` for a key the menu leaves alone (Tab among them).
 */
export function menuKey(
  state: MenuState,
  key: string,
  labels: readonly string[],
  selected: number,
): MenuStep | null {
  const last = labels.length - 1;
  if (!state.open)
    return OPENERS.has(key)
      ? { open: true, active: Math.max(selected, 0) }
      : null;
  const at = (active: number): MenuStep => ({ open: true, active });
  switch (key) {
    case "ArrowDown":
      return at(Math.min(state.active + 1, last));
    case "ArrowUp":
      return at(Math.max(state.active - 1, 0));
    case "Home":
      return at(0);
    case "End":
      return at(last);
    case "Enter":
    case " ":
      return { open: false, active: state.active, select: state.active };
    case "Escape":
      return { open: false, active: state.active };
  }
  if (key.length !== 1) return null;
  const letter = key.toLowerCase();
  for (let i = 1; i <= labels.length; i++) {
    const n = (state.active + i) % labels.length;
    if (labels[n].toLowerCase().startsWith(letter)) return at(n);
  }
  return at(state.active);
}
