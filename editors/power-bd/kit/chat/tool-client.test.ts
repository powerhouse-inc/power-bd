import type { WriteHandle, WriteReceipt } from "@powerhousedao/reactor";
import type { PHDocument } from "document-model";
import { describe, expect, it } from "vitest";
import { serverToolClient, type ModelLookups, type ServerClient } from "./tool-client.js";

const receipt = (documentId: string) =>
  ({ documentId, branch: "main", token: { coordinates: [] }, job: {} }) as unknown as WriteReceipt;

/** A write handle whose stages resolve at once, recording which were awaited. */
function handle(documentId: string, log: string[]): WriteHandle {
  return {
    jobId: `job-${documentId}`,
    documentId,
    branch: "main",
    get written() {
      log.push(`written ${documentId}`);
      return Promise.resolve(receipt(documentId));
    },
    get readable() {
      log.push(`readable ${documentId}`);
      return Promise.resolve(receipt(documentId));
    },
    document: function <T>(this: unknown) {
      log.push(`document ${documentId} ${this === undefined ? "unbound" : "bound"}`);
      return Promise.resolve({ header: { id: documentId } } as T);
    },
  };
}

/**
 * A Switchboard client whose methods record their calls and that `this` was
 * kept (the real one reads its own fields).
 */
function fakeServer() {
  const log: string[] = [];
  const calls: { name: string; args: unknown[] }[] = [];
  const server = {
    marker: "server",
    record(name: string, args: unknown[]) {
      calls.push({ name, args });
      return this.marker;
    },
  };
  const method =
    (name: string, answer: (...args: unknown[]) => unknown = () => ({ results: [] })) =>
    function (this: typeof server, ...args: unknown[]) {
      if (this.marker !== "server") throw new Error(`${name} lost its this`);
      server.record(name, args);
      return Promise.resolve(answer(...args));
    };
  const client = Object.assign(server, {
    get: method("get", (id) => ({ header: { id: `canonical-${String(id)}` } })),
    find: method("find"),
    getOperations: method("getOperations"),
    getOutgoingRelationships: method("getOutgoingRelationships"),
    getIncomingRelationships: method("getIncomingRelationships"),
    getOutgoingRelationshipEdges: method("getOutgoingRelationshipEdges"),
    getIncomingRelationshipEdges: method("getIncomingRelationshipEdges"),
    newDocument: method("newDocument", (type) => ({ header: { id: "new-1", documentType: type } })),
    write: {
      marker: "server",
      create: method("create", (document) => handle((document as PHDocument).header.id, log)),
      execute: method("execute", (id) => handle(String(id), log)),
      deleteDocument: method("deleteDocument", (id) => handle(String(id), log)),
    },
  });
  return { server: client as unknown as ServerClient, calls, log };
}

const models: ModelLookups = {
  getDocumentModelModules: () => Promise.resolve({ results: [], options: { cursor: "", limit: 0 } }),
  getDocumentModelModule: (type) => Promise.resolve({ documentModel: { global: { id: type } } } as never),
  getDocumentModelModuleForDocument: () => Promise.reject(new Error("unused")),
};

describe("serverToolClient: the reactor tools on the Switchboard", () => {
  it("reads through the Switchboard's client, which keeps its own this", async () => {
    const { server, calls } = fakeServer();
    const client = serverToolClient(server, models);
    await client.get("lead-1");
    await client.find({ type: "powerhouse/document-drive" });
    await client.getOperations("lead-1");
    await client.getOutgoingRelationships("bd-1", "child");
    await client.getIncomingRelationships("lead-1", "child");
    await client.getOutgoingRelationshipEdges("bd-1");
    await client.getIncomingRelationshipEdges("lead-1");
    expect(calls.map((c) => c.name)).toEqual([
      "get",
      "find",
      "getOperations",
      "getOutgoingRelationships",
      "getIncomingRelationships",
      "getOutgoingRelationshipEdges",
      "getIncomingRelationshipEdges",
    ]);
  });

  it("resolves an id or slug by reading the document", async () => {
    const { server } = fakeServer();
    expect(await serverToolClient(server, models).resolveIdOrSlug("my-lead")).toBe("canonical-my-lead");
  });

  it("looks document models up in Connect", async () => {
    const { server } = fakeServer();
    const module = await serverToolClient(server, models).getDocumentModelModule("powerbd/lead");
    expect(module.documentModel.global.id).toBe("powerbd/lead");
  });

  it("writes, creates and deletes through the Switchboard", async () => {
    const { server, calls } = fakeServer();
    const { write } = serverToolClient(server, models);
    await write.execute("lead-1", "main", []);
    await write.deleteDocument("lead-1");
    await write.create({ header: { id: "doc-1" } } as PHDocument, "bd-1");
    expect(calls.map((c) => [c.name, c.args[0]])).toEqual([
      ["execute", "lead-1"],
      ["deleteDocument", "lead-1"],
      ["create", { header: { id: "doc-1" } }],
    ]);
  });

  it("creates an empty document from its model, in the parent named", async () => {
    const { server, calls } = fakeServer();
    const created = await serverToolClient(server, models).write.createEmpty("powerbd/lead", {
      parentIdentifier: "bd-1",
    });
    expect(created.documentId).toBe("new-1");
    expect(calls.map((c) => c.name)).toEqual(["newDocument", "create"]);
    expect(calls[1].args[1]).toBe("bd-1");
  });
});

describe("serverToolClient: filing a new document in a drive", () => {
  it("files at the top when no folder is named, as the server does", async () => {
    const { server, calls, log } = fakeServer();
    const filed = await serverToolClient(server, models).write.drives.addFile("bd-1", {
      header: { id: "lead-9" },
    } as PHDocument);
    await filed.readable;
    expect(calls.map((c) => c.name)).toEqual(["create"]);
    expect(log).toEqual(["readable lead-9"]);
  });

  it("moves it into the folder once, before it counts as readable", async () => {
    const { server, calls, log } = fakeServer();
    const filed = await serverToolClient(server, models).write.drives.addFile(
      "bd-1",
      { header: { id: "lead-9" } } as PHDocument,
      "folder-leads",
    );
    expect(filed).toMatchObject({ jobId: "job-lead-9", documentId: "lead-9", branch: "main" });
    expect((await filed.readable).documentId).toBe("lead-9");
    await filed.readable;
    expect((await filed.written).documentId).toBe("lead-9");
    await filed.document();
    const move = calls.find((c) => c.name === "execute");
    expect(move?.args[0]).toBe("bd-1");
    expect(move?.args[2]).toMatchObject([
      { type: "MOVE_NODE", input: { srcFolder: "lead-9", targetParentFolder: "folder-leads" } },
    ]);
    expect(calls.filter((c) => c.name === "execute")).toHaveLength(1);
    expect(log).toEqual(["readable lead-9", "readable bd-1", "written lead-9", "document lead-9 bound"]);
  });
});
