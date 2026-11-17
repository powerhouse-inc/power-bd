import { describe, expect, it } from "vitest";
import { menuKey } from "./menu-keys.js";

const LABELS = ["All", "Leads", "Funding", "Investors", "Follow-ups"];
const closed = { open: false, active: 0 };
const open = (active: number) => ({ open: true, active });

describe("menuKey", () => {
  it.each(["ArrowDown", "ArrowUp", "Enter", " "])(
    "opens on %j with the chosen option active",
    (key) => {
      expect(menuKey(closed, key, LABELS, 2)).toEqual({
        open: true,
        active: 2,
      });
    },
  );

  it("opens on the first option when nothing is chosen", () => {
    expect(menuKey(closed, "ArrowDown", LABELS, -1)).toEqual({
      open: true,
      active: 0,
    });
  });

  it("ignores other keys while closed", () => {
    expect(menuKey(closed, "Escape", LABELS, 0)).toBeNull();
    expect(menuKey(closed, "f", LABELS, 0)).toBeNull();
  });

  it("moves with the arrows and stops at the ends", () => {
    expect(menuKey(open(1), "ArrowDown", LABELS, 0)).toEqual(open(2));
    expect(menuKey(open(4), "ArrowDown", LABELS, 0)).toEqual(open(4));
    expect(menuKey(open(1), "ArrowUp", LABELS, 0)).toEqual(open(0));
    expect(menuKey(open(0), "ArrowUp", LABELS, 0)).toEqual(open(0));
  });

  it("jumps to the first and last option with Home and End", () => {
    expect(menuKey(open(2), "Home", LABELS, 0)).toEqual(open(0));
    expect(menuKey(open(2), "End", LABELS, 0)).toEqual(open(4));
  });

  it.each(["Enter", " "])(
    "chooses the active option on %j and closes",
    (key) => {
      expect(menuKey(open(3), key, LABELS, 0)).toEqual({
        open: false,
        active: 3,
        select: 3,
      });
    },
  );

  it("closes on Escape without choosing", () => {
    expect(menuKey(open(3), "Escape", LABELS, 0)).toEqual({
      open: false,
      active: 3,
    });
  });

  it("jumps to the next option that starts with a typed letter, wrapping round", () => {
    expect(menuKey(open(0), "f", LABELS, 0)).toEqual(open(2));
    expect(menuKey(open(2), "F", LABELS, 0)).toEqual(open(4));
    expect(menuKey(open(4), "f", LABELS, 0)).toEqual(open(2));
  });

  it("stays put when no option starts with the letter, and leaves other keys alone", () => {
    expect(menuKey(open(1), "z", LABELS, 0)).toEqual(open(1));
    expect(menuKey(open(1), "Tab", LABELS, 0)).toBeNull();
  });
});
