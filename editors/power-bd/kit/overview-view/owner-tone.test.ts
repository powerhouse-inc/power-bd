import { describe, expect, it } from "vitest";
import { OWNER_TONES, ownerTone } from "./owner-tone.js";

const A = "0x00000000000000000000000000000000000000A1";
const B = "0x00000000000000000000000000000000000000b2";
const team = [{ address: A }, { address: B }];

describe("ownerTone", () => {
  it("gives each member their own colour, by their place on the team list", () => {
    expect(ownerTone(A, team)).toBe(OWNER_TONES[0]);
    expect(ownerTone(B, team)).toBe(OWNER_TONES[1]);
  });

  it("compares addresses without regard to letter case", () => {
    expect(ownerTone(A.toLowerCase(), team)).toBe(OWNER_TONES[0]);
  });

  it("keeps a member's colour when others join later", () => {
    expect(ownerTone(B, [...team, { address: "0xc3" }])).toBe(OWNER_TONES[1]);
  });

  it("starts the palette again after its last colour", () => {
    const many = Array.from({ length: OWNER_TONES.length + 1 }, (_, i) => ({
      address: `0x${i}`,
    }));
    expect(ownerTone(`0x${OWNER_TONES.length}`, many)).toBe(OWNER_TONES[0]);
  });

  it("has no colour for nobody, or for someone not on the team", () => {
    expect(ownerTone(null, team)).toBeNull();
    expect(ownerTone("0xdead", team)).toBeNull();
  });

  it("leaves red and orange to the slipping signals", () => {
    expect(OWNER_TONES).not.toContain("red");
    expect(OWNER_TONES).not.toContain("orange");
  });
});
