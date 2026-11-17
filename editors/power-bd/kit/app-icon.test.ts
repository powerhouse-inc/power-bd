import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { APP_ICON_URL, driveIconToSet } from "./app-icon.js";

const designSystemIcon = readFileSync(
  new URL("../../../design-system/app-icon.svg", import.meta.url),
  "utf8",
);

const decode = (uri: string) => {
  const prefix = "data:image/svg+xml,";
  expect(uri.startsWith(prefix)).toBe(true);
  return decodeURIComponent(uri.slice(prefix.length));
};

describe("driveIconToSet", () => {
  it("gives a drive without an icon the design system's app icon", () => {
    for (const none of [null, undefined, "", "   "]) {
      const icon = driveIconToSet(none);
      expect(icon).not.toBeNull();
      expect(decode(icon ?? "")).toBe(designSystemIcon.trim());
    }
  });

  it("leaves an icon the drive already has", () => {
    expect(driveIconToSet("https://example.org/team-logo.png")).toBeNull();
    expect(driveIconToSet("data:image/png;base64,iVBORw0KGgo=")).toBeNull();
  });
});

describe("an earlier version of the app's own icon", () => {
  const svgUrl = (svg: string) =>
    `data:image/svg+xml,${encodeURIComponent(svg)}`;

  it("is replaced by the current one", () => {
    const earlier = svgUrl(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" id="power-bd-app-icon"><rect width="512" height="512" fill="#000"/></svg>',
    );
    expect(driveIconToSet(earlier)).toBe(APP_ICON_URL);
  });

  it("is left alone once it is the current one", () => {
    expect(driveIconToSet(APP_ICON_URL)).toBeNull();
  });

  it("is not confused with someone's own SVG icon", () => {
    const theirs = svgUrl(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>',
    );
    expect(driveIconToSet(theirs)).toBeNull();
  });
});

describe("the icon's colours", () => {
  const hexes = (text: string) =>
    new Set(
      [...text.matchAll(/#[0-9a-f]{6}\b/gi)].map((m) => m[0].toLowerCase()),
    );
  const tokens = hexes(
    readFileSync(
      new URL("../../../design-system/tokens.css", import.meta.url),
      "utf8",
    ),
  );

  it("all come from the design system's tokens", () => {
    const offPalette = [...hexes(designSystemIcon)].filter(
      (c) => !tokens.has(c),
    );
    expect(offPalette).toEqual([]);
  });
});
