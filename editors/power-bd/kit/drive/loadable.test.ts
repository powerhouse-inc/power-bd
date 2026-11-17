import { createLoadableChecks } from "./loadable.js";

/** A server that hands over every record except the ones it refuses, and counts what it was asked. */
function server(refuses: string[] = []) {
  const asked: string[] = [];
  const fetch = (id: string) => {
    asked.push(id);
    return refuses.includes(id)
      ? Promise.reject(new Error("Forbidden: insufficient permissions"))
      : Promise.resolve({ id });
  };
  return { fetch, asked };
}

describe("createLoadableChecks", () => {
  it("leaves out a record the server refuses, keeping the others in order", async () => {
    const check = createLoadableChecks();
    const { fetch } = server(["gone"]);
    await expect(check(fetch, ["a", "gone", "b"])).resolves.toEqual({
      ok: ["a", "b"],
      refused: ["gone"],
    });
  });

  it("asks the server once for the same records, however many views ask", async () => {
    const check = createLoadableChecks();
    const { fetch, asked } = server();
    const first = check(fetch, ["a", "b"]);
    const second = check(fetch, ["a", "b"]);
    expect(second).toBe(first);
    await first;
    expect(asked).toEqual(["a", "b"]);
  });

  it("asks again when the drive's records change", async () => {
    const check = createLoadableChecks();
    const { fetch, asked } = server();
    await check(fetch, ["a"]);
    await check(fetch, ["a", "c"]);
    expect(asked).toEqual(["a", "a", "c"]);
  });

  it("counts a fetch that throws at once as refused", async () => {
    const check = createLoadableChecks();
    const fetch = (id: string) => {
      if (id === "bad") throw new Error("not initialised");
      return Promise.resolve({ id });
    };
    await expect(check(fetch, ["bad", "a"])).resolves.toEqual({ ok: ["a"], refused: ["bad"] });
  });

  it("says which records it left out, and says nothing when none were", async () => {
    const leftOut: string[][] = [];
    const check = createLoadableChecks({ onRefused: (ids) => leftOut.push([...ids]) });
    await check(server(["gone"]).fetch, ["a", "gone"]);
    await check(server().fetch, ["a"]);
    expect(leftOut).toEqual([["gone"]]);
  });

  it("keeps each document cache's answers apart", async () => {
    const check = createLoadableChecks();
    const one = server(["a"]);
    const other = server();
    await expect(check(one.fetch, ["a"])).resolves.toEqual({ ok: [], refused: ["a"] });
    await expect(check(other.fetch, ["a"])).resolves.toEqual({ ok: ["a"], refused: [] });
  });

  it("forgets the oldest answers past its limit, so a long session does not grow without end", async () => {
    const check = createLoadableChecks({ limit: 2 });
    const { fetch, asked } = server();
    await check(fetch, ["a"]);
    await check(fetch, ["b"]);
    await check(fetch, ["c"]);
    await check(fetch, ["b"]);
    await check(fetch, ["a"]);
    expect(asked).toEqual(["a", "b", "c", "a"]);
  });
});
