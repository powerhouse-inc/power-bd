import { createLoadableChecks } from "./loadable.js";

/**
 * A document cache over a server that hands over every record except the
 * ones it refuses, counting what it was asked.
 */
function server(refuses: string[] = []) {
  const asked: string[] = [];
  const cache = {
    get: (id: string) => {
      asked.push(id);
      return refuses.includes(id)
        ? Promise.reject(new Error("Forbidden: insufficient permissions"))
        : Promise.resolve({ id });
    },
  };
  return { cache, asked };
}

/**
 * A document cache as the stack's is: each record read once and remembered,
 * and `getBatch` reading the ones not yet read in one request. In this stack
 * a batch leaves refused records out; an older one fails the whole batch.
 */
function stackCache(refuses: string[] = [], batch: "leaves-out" | "fails" = "leaves-out") {
  const network: string[] = [];
  const known = new Map<string, Promise<unknown>>();
  const read = (id: string) => {
    const answer = refuses.includes(id)
      ? Promise.reject(new Error("Forbidden: insufficient permissions"))
      : Promise.resolve({ id });
    answer.catch(() => {});
    known.set(id, answer);
    return answer;
  };
  const get = (id: string) => {
    const remembered = known.get(id);
    if (remembered) return remembered;
    network.push(id);
    return read(id);
  };
  const getBatch = (ids: string[]) => {
    const missing = ids.filter((id) => !known.has(id));
    if (missing.length > 0) network.push(`batch ${missing.join(" ")}`);
    for (const id of missing) void read(id);
    const answers = ids.map((id) => known.get(id) as Promise<unknown>);
    return batch === "fails"
      ? Promise.all(answers)
      : Promise.allSettled(answers).then((all) =>
          all.flatMap((a) => (a.status === "fulfilled" ? [a.value] : [])),
        );
  };
  return { cache: { get, getBatch }, network };
}

describe("createLoadableChecks", () => {
  it("leaves out a record the server refuses, keeping the others in order", async () => {
    const check = createLoadableChecks();
    const { cache } = server(["gone"]);
    await expect(check(cache, ["a", "gone", "b"])).resolves.toEqual({
      ok: ["a", "b"],
      refused: ["gone"],
    });
  });

  it("reads the records in one batch where the cache batches, then answers each from the cache", async () => {
    const check = createLoadableChecks();
    const { cache, network } = stackCache(["gone"]);
    await expect(check(cache, ["a", "gone", "b"])).resolves.toEqual({ ok: ["a", "b"], refused: ["gone"] });
    expect(network).toEqual(["batch a gone b"]);
  });

  it("leaves out only the refused record where a batch fails on one refusal, as an older stack's does", async () => {
    const check = createLoadableChecks();
    const { cache, network } = stackCache(["gone"], "fails");
    await expect(check(cache, ["a", "gone", "b"])).resolves.toEqual({ ok: ["a", "b"], refused: ["gone"] });
    expect(network).toEqual(["batch a gone b"]);
  });

  it("asks the server once for the same records, however many views ask", async () => {
    const check = createLoadableChecks();
    const { cache, asked } = server();
    const first = check(cache, ["a", "b"]);
    const second = check(cache, ["a", "b"]);
    expect(second).toBe(first);
    await first;
    expect(asked).toEqual(["a", "b"]);
  });

  it("gives a view opened later the answer already found, so it does not wait again", async () => {
    const check = createLoadableChecks();
    const { cache, asked } = server();
    const shown = await check(cache, ["a", "b"]);
    // Another view, mounted after the first one's answer came: the same answer, not a new ask.
    await expect(check(cache, ["a", "b"])).resolves.toBe(shown);
    expect(asked).toEqual(["a", "b"]);
  });

  it("asks again when the drive's records change", async () => {
    const check = createLoadableChecks();
    const { cache, asked } = server();
    await check(cache, ["a"]);
    await check(cache, ["a", "c"]);
    expect(asked).toEqual(["a", "a", "c"]);
  });

  it("counts a fetch that throws at once as refused", async () => {
    const check = createLoadableChecks();
    const cache = {
      get: (id: string) => {
        if (id === "bad") throw new Error("not initialised");
        return Promise.resolve({ id });
      },
    };
    await expect(check(cache, ["bad", "a"])).resolves.toEqual({ ok: ["a"], refused: ["bad"] });
  });

  it("says which records it left out, and says nothing when none were", async () => {
    const leftOut: string[][] = [];
    const check = createLoadableChecks({ onRefused: (ids) => leftOut.push([...ids]) });
    await check(server(["gone"]).cache, ["a", "gone"]);
    await check(server().cache, ["a"]);
    expect(leftOut).toEqual([["gone"]]);
  });

  it("keeps each document cache's answers apart", async () => {
    const check = createLoadableChecks();
    const one = server(["a"]);
    const other = server();
    await expect(check(one.cache, ["a"])).resolves.toEqual({ ok: [], refused: ["a"] });
    await expect(check(other.cache, ["a"])).resolves.toEqual({ ok: ["a"], refused: [] });
  });

  it("still answers when it may keep no answers at all", async () => {
    const check = createLoadableChecks({ limit: 0 });
    await expect(check(server().cache, ["a"])).resolves.toEqual({ ok: ["a"], refused: [] });
  });

  it("forgets the oldest answers past its limit, so a long session does not grow without end", async () => {
    const check = createLoadableChecks({ limit: 2 });
    const { cache, asked } = server();
    await check(cache, ["a"]);
    await check(cache, ["b"]);
    await check(cache, ["c"]);
    await check(cache, ["b"]);
    await check(cache, ["a"]);
    expect(asked).toEqual(["a", "b", "c", "a"]);
  });
});
