import { describe, expect, it } from "vitest";
import { bdChatTools, readsTheVault, type ChatTool } from "./tools.js";

const VAULT = "vault-drive-1";
const BD = "bd-drive-1";
const DRIVES = { vaultDriveId: VAULT, bdDriveId: BD };

/** A host tool that records what it was called with and answers `result`. */
function hostTool(
  name: string,
  { vault = false, readOnly = true, result = { content: [{ type: "text", text: "{}" }], structuredContent: {} } } = {},
) {
  const calls: Record<string, unknown>[] = [];
  const tool: ChatTool = {
    name,
    description: vault ? `Knowledge vault — ${name} reads the vault.` : `${name} from the host.`,
    inputSchema: {},
    annotations: { title: name, readOnlyHint: readOnly },
    callback: (args) => {
      calls.push(args);
      return Promise.resolve(result);
    },
  };
  return { tool, calls };
}

describe("bdChatTools: which tools the chat offers", () => {
  it("keeps the reactor's document tools and the vault's, and leaves out the rest", () => {
    const host = [
      ...[
        "getDocumentModels",
        "getDocumentModelSchema",
        "getDrives",
        "getDrive",
        "getDocuments",
        "getDocument",
        "createDocument",
        "addActions",
        "deleteDocument",
        "addDrive",
        "deleteDrive",
        "listSwitchboards",
        "getSwitchboardSchema",
        "getConnectors",
        "fireWorkflow",
      ].map((name) => hostTool(name).tool),
      hostTool("search_vault", { vault: true }).tool,
      hostTool("read_document", { vault: true }).tool,
    ];
    expect(bdChatTools(host, DRIVES).map((t) => t.name)).toEqual([
      "getDocumentModels",
      "getDocumentModelSchema",
      "getDrives",
      "getDrive",
      "getDocuments",
      "getDocument",
      "createDocument",
      "addActions",
      "deleteDocument",
      "search_vault",
      "read_document",
    ]);
  });
});

describe("bdChatTools: the write tool", () => {
  it("passes a people-only step to the reactor like any other write: the approval card asks", async () => {
    const answer = { content: [{ type: "text", text: '{"success":true}' }], structuredContent: { success: true } };
    const add = hostTool("addActions", { readOnly: false, result: answer });
    const [tool] = bdChatTools([add.tool], DRIVES);
    const args = { documentId: "lead-1", actions: [{ type: "APPROVE_MESSAGE", input: { id: "m-1" } }] };
    expect(await tool.callback(args)).toEqual(answer);
    expect(add.calls).toEqual([args]);
  });

  it("passes ordinary actions to the reactor and returns its answer", async () => {
    const answer = { content: [{ type: "text", text: '{"success":true}' }], structuredContent: { success: true } };
    const add = hostTool("addActions", { readOnly: false, result: answer });
    const [tool] = bdChatTools([add.tool], DRIVES);
    const args = { documentId: "lead-1", actions: [{ type: "ADD_NEXT_STEP", input: { id: "n-1" } }] };
    expect(await tool.callback(args)).toEqual(answer);
    expect(add.calls).toEqual([args]);
  });

  it("keeps each tool's name, description, input and hints, which the approval card reads", () => {
    const add = hostTool("addActions", { readOnly: false });
    const [tool] = bdChatTools([add.tool], DRIVES);
    expect(tool).toMatchObject({
      name: "addActions",
      description: "addActions from the host.",
      inputSchema: {},
      annotations: { title: "addActions", readOnlyHint: false },
    });
  });
});

const SECRET = "Marnoble's budget holder distrusts open-source vendors";
const leadRead = {
  content: [{ type: "text", text: "{}" }],
  structuredContent: {
    document: {
      id: "lead-1",
      documentType: "powerbd/lead",
      state: { global: { status: "MET", confidentialItems: [{ id: "c-1", text: SECRET }] } },
    },
  },
};

describe("bdChatTools: what reaches the model", () => {
  it("withholds confidential items from a record read", async () => {
    const [tool] = bdChatTools([hostTool("getDocument", { result: leadRead }).tool], DRIVES);
    const out = await tool.callback({ documentId: "lead-1" });
    expect(JSON.stringify(out)).not.toContain("distrusts");
    expect(out).toMatchObject({ structuredContent: { document: { state: { global: { status: "MET" } } } } });
  });

  it("refuses a filtered read that could reach them", async () => {
    const [tool] = bdChatTools([hostTool("getDrive", { result: leadRead }).tool], DRIVES);
    const out = await tool.callback({ documentId: "lead-1", filter: "$..text" });
    expect(out).toMatchObject({ isError: true });
  });
});

describe("bdChatTools: the vault's tools", () => {
  it("read the vault named in Settings when the model names no drive", async () => {
    const search = hostTool("search_vault", { vault: true });
    const [tool] = bdChatTools([search.tool], DRIVES);
    await tool.callback({ query: "Orvane attempts" });
    expect(search.calls).toEqual([{ query: "Orvane attempts", driveId: VAULT }]);
  });

  it("refuse the BD space without calling the vault", async () => {
    const search = hostTool("search_vault", { vault: true });
    const [tool] = bdChatTools([search.tool], DRIVES);
    const out = await tool.callback({ query: "x", driveId: BD });
    expect(search.calls).toEqual([]);
    expect(out).toMatchObject({ isError: true });
  });

  it("withhold confidential items when one is pointed at a BD record in another space", async () => {
    const vaultRead = {
      content: [{ type: "text", text: 'read powerbd/lead "Marnoble: pilot"' }],
      structuredContent: { documentType: "powerbd/lead", meta: { confidentialItems: { count: 1, first: [{ text: SECRET }] } } },
    };
    const [tool] = bdChatTools([hostTool("read_document", { vault: true, result: vaultRead }).tool], DRIVES);
    const out = await tool.callback({ documentId: "lead-1", driveId: "bd-drive-2" });
    expect(JSON.stringify(out)).not.toContain("distrusts");
  });
});

describe("bdChatTools: Power BD's own tools", () => {
  it("uses its own reactor tools in place of the host's, and still withholds confidential items", async () => {
    const hostRead = hostTool("getDocument");
    const ownRead = hostTool("getDocument", { result: leadRead });
    const tools = bdChatTools(
      [hostRead.tool, hostTool("addActions").tool, hostTool("search_vault", { vault: true }).tool],
      DRIVES,
      { reactor: [ownRead.tool] },
    );
    expect(tools.map((t) => t.name)).toEqual(["getDocument", "search_vault"]);
    const out = await tools[0].callback({ documentId: "lead-1" });
    expect(hostRead.calls).toEqual([]);
    expect(ownRead.calls).toEqual([{ documentId: "lead-1" }]);
    expect(JSON.stringify(out)).not.toContain("distrusts");
  });

  it("adds its own tools after the host's, never in place of one with the same name", () => {
    const tools = bdChatTools(
      [hostTool("getDocument").tool, hostTool("document_history", { vault: true }).tool],
      DRIVES,
      { bd: [hostTool("getRecordHistory").tool, hostTool("document_history").tool] },
    );
    expect(tools.map((t) => t.name)).toEqual(["getDocument", "document_history", "getRecordHistory"]);
    expect(tools[1].description).toMatch(/^Knowledge vault — /);
  });
});

describe("readsTheVault: which of the chat's tools read the vault", () => {
  it("counts every tool but the space's own reads and writes", () => {
    for (const name of ["getDocument", "addActions", "getRecentChanges", "getRecordHistory"]) expect(readsTheVault(name)).toBe(false);
    for (const name of ["search_vault", "read_document", "list_sources"]) expect(readsTheVault(name)).toBe(true);
  });
});
