import type { DriveLike } from "../first-run/index.js";
import { EARLIER_VAULT, vaultChoice } from "./settings.js";

const drive = (
  id: string,
  name: string | null,
  editor: string | null = "knowledge-vault",
): DriveLike => ({
  header: { id, meta: { preferredEditor: editor } },
  state: { global: { name } },
});
const drives = [
  drive("bd", "Power BD", "power-bd"),
  drive("v1", "Knowledge Vault"),
  drive("v2", null),
  drive("other", "Vetra", "vetra-drive-app"),
];

describe("vaultChoice", () => {
  it("lists the vaults open in this browser, never this space", () => {
    expect(vaultChoice(drives, "bd", "v1")).toEqual({
      value: "v1",
      options: [
        { value: "v1", label: "Knowledge Vault" },
        { value: "v2", label: "Unnamed vault" },
      ],
      placeholder: null,
      disabled: false,
      help: "Notes linked from leads, funding opportunities, investors and the playbook are looked up and searched in this vault. Only vaults open in this browser are listed.",
    });
  });

  it("keeps the vault chosen earlier when it is not open in this browser", () => {
    const choice = vaultChoice(drives, "bd", "far-away");
    expect(choice.value).toBe("far-away");
    expect(choice.options[0]).toEqual({
      value: "far-away",
      label: EARLIER_VAULT,
    });
    expect(choice.options).toHaveLength(3);
    expect(EARLIER_VAULT).not.toMatch(/far-away/);
  });

  it("asks for a choice while none is made", () => {
    expect(vaultChoice(drives, "bd", null)).toMatchObject({
      value: "",
      placeholder: "Choose a vault",
      disabled: false,
    });
    expect(vaultChoice(drives, "bd", "  ")).toMatchObject({
      value: "",
      placeholder: "Choose a vault",
    });
  });

  it("says how to get a vault when none is open here", () => {
    expect(vaultChoice(undefined, "bd", undefined)).toEqual({
      value: "",
      options: [],
      placeholder: "No vault open in this browser",
      disabled: true,
      help: "No vault is open in this browser yet. Add the vault in Connect, then choose it here.",
    });
    const kept = vaultChoice([], "bd", "far-away");
    expect(kept).toMatchObject({
      value: "far-away",
      disabled: false,
      options: [{ value: "far-away", label: EARLIER_VAULT }],
    });
  });
});
