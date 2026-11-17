import {
  LOOKUP_BATCH,
  VaultAborted,
  createVaultClient,
  lookupBody,
  searchBody,
  type VaultClientDeps,
  type VaultFetch,
} from "./client.js";

type Body = { query: string; variables: Record<string, unknown> };
type Call = { url: string; headers: Record<string, string>; body: Body };
type Reply = {
  status?: number;
  json?: unknown;
  /** The network fails before an answer. */
  throws?: boolean;
  /** The answer's body is not JSON. */
  badJson?: boolean;
};

const ENDPOINT = "http://vault.test/graphql/knowledgeGraph";
const DRIVE = "vault-drive";

/** A fetch that records each request and answers with `reply`. */
function server(reply: (call: Call, index: number) => Reply) {
  const calls: Call[] = [];
  const fetch: VaultFetch = (url, init) => {
    const call: Call = {
      url,
      headers: init.headers,
      body: JSON.parse(init.body) as Body,
    };
    calls.push(call);
    const r = reply(call, calls.length - 1);
    if (r.throws) return Promise.reject(new TypeError("Failed to fetch"));
    const status = r.status ?? 200;
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () =>
        r.badJson
          ? Promise.reject(new SyntaxError("Unexpected token <"))
          : Promise.resolve(r.json),
    });
  };
  return { fetch, calls };
}

const client = (
  fetch: VaultFetch,
  over: Partial<Omit<VaultClientDeps, "fetch">> = {},
) =>
  createVaultClient({
    fetch,
    endpoint: () => Promise.resolve(ENDPOINT),
    token: () => Promise.resolve("token-1"),
    ...over,
  });

const node = (id: string, title = `Note ${id}`) => ({
  documentId: id,
  title,
  description: `About ${id}`,
  noteType: "REFERENCE",
  documentType: "bai/knowledge-note",
});

describe("lookupBody", () => {
  it("asks for every note in one query, one alias each", () => {
    const body = lookupBody(DRIVE, ["a", "b"]);
    expect(body.variables).toEqual({ driveId: DRIVE, n0: "a", n1: "b" });
    expect(body.query).toContain("$driveId: ID!");
    expect(body.query).toContain("$n0: String!");
    expect(body.query).toContain(
      "n1: knowledgeGraphNodeByDocumentId(driveId: $driveId, documentId: $n1)",
    );
    expect(body.query).toContain(
      "documentId title description noteType documentType",
    );
  });
});

describe("searchBody", () => {
  it("asks the vault's semantic search, or its full-text search", () => {
    const semantic = searchBody("semantic", DRIVE, "attempts", 8);
    expect(semantic.variables).toEqual({
      driveId: DRIVE,
      query: "attempts",
      limit: 8,
    });
    expect(semantic.query).toContain(
      "knowledgeGraphSemanticSearch(driveId: $driveId, query: $query, mode: SEMANTIC, limit: $limit)",
    );
    const full = searchBody("full-text", DRIVE, "attempts", 8);
    expect(full.query).toContain(
      "knowledgeGraphFullSearch(driveId: $driveId, query: $query, limit: $limit)",
    );
  });
});

describe("lookup", () => {
  it("reads each note once, with the reader's own access", async () => {
    const { fetch, calls } = server(() => ({
      json: { data: { n0: node("a", "Live title"), n1: null } },
    }));
    const found = await client(fetch).lookup(DRIVE, ["a", "b", "a"]);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe(ENDPOINT);
    expect(calls[0]?.headers).toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer token-1",
    });
    expect(calls[0]?.body.variables).toEqual({
      driveId: DRIVE,
      n0: "a",
      n1: "b",
    });
    expect(found.get("a")).toEqual({
      ok: true,
      note: {
        id: "a",
        title: "Live title",
        description: "About a",
        kind: "Reference",
        icon: "note",
      },
    });
    expect(found.get("b")).toEqual({ ok: true, note: null });
  });

  it("asks anonymously when nobody is signed in, and when the sign-in can't be read", async () => {
    const { fetch, calls } = server(() => ({ json: { data: { n0: null } } }));
    await client(fetch, { token: () => Promise.resolve(undefined) }).lookup(
      DRIVE,
      ["a"],
    );
    await client(fetch, {
      token: () => Promise.reject(new Error("no renown")),
    }).lookup(DRIVE, ["a"]);
    expect(calls.map((c) => c.headers)).toEqual([
      { "Content-Type": "application/json" },
      { "Content-Type": "application/json" },
    ]);
  });

  it("asks nothing for no notes", async () => {
    const { fetch, calls } = server(() => ({}));
    expect((await client(fetch).lookup(DRIVE, [])).size).toBe(0);
    expect(calls).toHaveLength(0);
  });

  it("splits a long list into several requests", async () => {
    const ids = Array.from({ length: LOOKUP_BATCH + 2 }, (_, i) => `id-${i}`);
    const { fetch, calls } = server((call) => ({
      json: {
        data: Object.fromEntries(
          Object.entries(call.body.variables)
            .filter(([k]) => k !== "driveId")
            .map(([k, id]) => [k, node(String(id))]),
        ),
      },
    }));
    const found = await client(fetch).lookup(DRIVE, ids);
    expect(calls.map((c) => Object.keys(c.body.variables).length - 1)).toEqual([
      LOOKUP_BATCH,
      2,
    ]);
    expect([...found.keys()]).toEqual(ids);
    expect(found.get(`id-${LOOKUP_BATCH + 1}`)).toMatchObject({ ok: true });
  });

  it("keeps a note the vault refused apart from the notes it answered", async () => {
    const { fetch } = server(() => ({
      json: {
        data: { n0: node("a"), n1: null },
        errors: [
          {
            message: "boom",
            path: ["n1"],
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          },
        ],
      },
    }));
    const found = await client(fetch).lookup(DRIVE, ["a", "b"]);
    expect(found.get("a")).toMatchObject({ ok: true });
    expect(found.get("b")).toEqual({ ok: false, reason: "failed" });
  });

  it("tells a reader without access from one who has not signed in", async () => {
    const refusal = {
      json: {
        data: { n0: null },
        errors: [{ message: "Forbidden", extensions: { code: "FORBIDDEN" } }],
      },
    };
    const signedIn = await client(server(() => refusal).fetch).lookup(DRIVE, [
      "a",
    ]);
    expect(signedIn.get("a")).toEqual({ ok: false, reason: "forbidden" });
    const anonymous = await client(server(() => refusal).fetch, {
      token: () => Promise.resolve(undefined),
    }).lookup(DRIVE, ["a"]);
    expect(anonymous.get("a")).toEqual({ ok: false, reason: "signed-out" });
    const unauthenticated = await client(
      server(() => ({
        json: {
          errors: [
            { message: "Log in", extensions: { code: "UNAUTHENTICATED" } },
          ],
        },
      })).fetch,
    ).lookup(DRIVE, ["a"]);
    // The token did not sign the reader in: signing in again is the way back.
    expect(unauthenticated.get("a")).toEqual({
      ok: false,
      reason: "signed-out",
    });
  });

  it("reads an HTTP refusal the same way", async () => {
    for (const [status, token, reason] of [
      [401, undefined, "signed-out"],
      [401, "t", "signed-out"],
      [403, "t", "forbidden"],
      [403, undefined, "signed-out"],
      [500, "t", "failed"],
      [404, undefined, "failed"],
    ] as const) {
      const found = await client(server(() => ({ status })).fetch, {
        token: () => Promise.resolve(token),
      }).lookup(DRIVE, ["a"]);
      expect(found.get("a")).toEqual({ ok: false, reason });
    }
  });

  it("says the vault can't be reached when the network or the server's address fails", async () => {
    const network = await client(server(() => ({ throws: true })).fetch).lookup(
      DRIVE,
      ["a"],
    );
    expect(network.get("a")).toEqual({ ok: false, reason: "unreachable" });
    const { fetch, calls } = server(() => ({}));
    const nowhere = await client(fetch, {
      endpoint: () => Promise.reject(new Error("no switchboard")),
    }).lookup(DRIVE, ["a"]);
    expect(nowhere.get("a")).toEqual({ ok: false, reason: "unreachable" });
    expect(calls).toHaveLength(0);
  });

  it("fails calmly on an answer it can't read", async () => {
    for (const reply of [
      { badJson: true },
      { json: "<html>" },
      { json: { data: "x" } },
      { json: {} },
      { json: { errors: ["junk", { path: [0], extensions: "x" }] } },
    ]) {
      const found = await client(server(() => reply).fetch).lookup(DRIVE, [
        "a",
      ]);
      expect(found.get("a")).toEqual({ ok: false, reason: "failed" });
    }
  });

  it("stops when the caller withdraws the request", async () => {
    const abort = new AbortController();
    const { fetch } = server(() => {
      abort.abort();
      return { throws: true };
    });
    await expect(
      client(fetch).lookup(DRIVE, ["a"], abort.signal),
    ).rejects.toBeInstanceOf(VaultAborted);
    const late = new AbortController();
    const slow = server(() => {
      late.abort();
      return { badJson: true };
    });
    await expect(
      client(slow.fetch).lookup(DRIVE, ["a"], late.signal),
    ).rejects.toThrow(VaultAborted);
    const before = new AbortController();
    before.abort();
    await expect(
      client(server(() => ({})).fetch, {
        endpoint: () => Promise.reject(new Error("aborted")),
      }).lookup(DRIVE, ["a"], before.signal),
    ).rejects.toThrow("cancelled");
  });
});

describe("search", () => {
  const semantic = (...ids: string[]) => ({
    json: {
      data: {
        knowledgeGraphSemanticSearch: ids.map((id, i) => ({
          similarity: 0.9 - i / 10,
          node: node(id),
        })),
      },
    },
  });
  const fullText = (...ids: string[]) => ({
    json: { data: { knowledgeGraphFullSearch: ids.map((id) => node(id)) } },
  });

  it("ranks by meaning first", async () => {
    const { fetch, calls } = server(() => semantic("a", "b", "a"));
    const result = await client(fetch).search(DRIVE, "how many attempts", 8);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.body.variables).toEqual({
      driveId: DRIVE,
      query: "how many attempts",
      limit: 8,
    });
    expect(result).toMatchObject({ ok: true, mode: "semantic" });
    expect(result.ok && result.hits.map((h) => h.id)).toEqual(["a", "b"]);
  });

  it("keeps to the limit, and skips what is not a note", async () => {
    const { fetch } = server(() => ({
      json: {
        data: {
          knowledgeGraphSemanticSearch: [
            { node: node("a") },
            { node: { title: "no id" } },
            "junk",
            { node: node("b") },
            { node: node("c") },
          ],
        },
      },
    }));
    const result = await client(fetch).search(DRIVE, "notes", 2);
    expect(result.ok && result.hits.map((h) => h.id)).toEqual(["a", "b"]);
  });

  it("falls back to full-text search when meaning finds nothing", async () => {
    const { fetch, calls } = server((_c, i) =>
      i === 0 ? semantic() : fullText("c"),
    );
    const result = await client(fetch).search(DRIVE, "Tallis", 5);
    expect(
      calls.map((c) => c.body.query.includes("knowledgeGraphFullSearch")),
    ).toEqual([false, true]);
    expect(result).toEqual({
      ok: true,
      mode: "full-text",
      hits: [
        {
          id: "c",
          title: "Note c",
          description: "About c",
          kind: "Reference",
          icon: "note",
        },
      ],
    });
  });

  it("falls back to full-text search when the vault can't search by meaning", async () => {
    const { fetch } = server((_c, i) =>
      i === 0
        ? {
            json: {
              errors: [
                {
                  message: 'Cannot query field "knowledgeGraphSemanticSearch"',
                },
              ],
            },
          }
        : fullText("d"),
    );
    const result = await client(fetch).search(DRIVE, "Brisa", 5);
    expect(result).toMatchObject({ ok: true, mode: "full-text" });
  });

  it("says nothing matched when meaning found nothing and full text failed", async () => {
    const { fetch } = server((_c, i) =>
      i === 0 ? semantic() : { status: 500 },
    );
    expect(await client(fetch).search(DRIVE, "x y", 5)).toEqual({
      ok: true,
      mode: "semantic",
      hits: [],
    });
  });

  it("gives the full-text failure when both searches fail", async () => {
    const { fetch } = server(() => ({ json: { errors: [{ message: "no" }] } }));
    expect(await client(fetch).search(DRIVE, "x y", 5)).toEqual({
      ok: false,
      reason: "failed",
    });
  });

  it("does not try again when the reader may not search or the vault is out of reach", async () => {
    const refused = server(() => ({ status: 403 }));
    expect(await client(refused.fetch).search(DRIVE, "x y", 5)).toEqual({
      ok: false,
      reason: "forbidden",
    });
    expect(refused.calls).toHaveLength(1);
    const offline = server(() => ({ throws: true }));
    expect(await client(offline.fetch).search(DRIVE, "x y", 5)).toEqual({
      ok: false,
      reason: "unreachable",
    });
    expect(offline.calls).toHaveLength(1);
  });

  it("reads a full-text answer that is not a list as a failure", async () => {
    const { fetch } = server((_c, i) =>
      i === 0
        ? semantic()
        : { json: { data: { knowledgeGraphFullSearch: null } } },
    );
    expect(await client(fetch).search(DRIVE, "x y", 5)).toEqual({
      ok: true,
      mode: "semantic",
      hits: [],
    });
  });

  it("stops when the caller withdraws the search", async () => {
    const abort = new AbortController();
    const { fetch } = server(() => {
      abort.abort();
      return { throws: true };
    });
    await expect(
      client(fetch).search(DRIVE, "x y", 5, abort.signal),
    ).rejects.toBeInstanceOf(VaultAborted);
  });
});
