import { enumValue } from "../../../kit/enums.js";
import type { Option } from "./types.js";

/** What an `Items` form hands back: one value per field key, still untyped. */
export type Values = Record<string, unknown>;

/** Options for a select, typed by the values they may hold. */
export function options<T extends string>(
  pairs: readonly (readonly [T, string])[],
): Option<T>[] {
  return pairs.map(([value, label]) => ({ value, label }));
}

export const asText = (raw: unknown): string | undefined =>
  typeof raw === "string" ? raw : undefined;
export const asNumber = (raw: unknown): number | undefined =>
  typeof raw === "number" ? raw : undefined;
export const asFlag = (raw: unknown): boolean | undefined =>
  typeof raw === "boolean" ? raw : undefined;
/** The option's value when `raw` is one of them. */
export function asOneOf<T extends string>(
  list: readonly Option<T>[],
  raw: unknown,
): T | undefined {
  return typeof raw === "string"
    ? enumValue(
        list.map((o) => o.value),
        raw,
      )
    : undefined;
}

type Readers<T> = { [K in keyof T]-?: (raw: unknown) => T[K] | undefined };

/** The fields of `patch` that `readers` know, each read as its type. */
export function readPatch<T>(patch: Values, readers: Readers<T>): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(readers) as (keyof T & string)[]) {
    if (key in patch) out[key] = readers[key](patch[key]);
  }
  return out;
}
