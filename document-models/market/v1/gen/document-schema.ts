/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { marketDocumentType } from "./document-type.js";
import { MarketStateSchema } from "./schema/zod.js";
import type { MarketDocument, MarketPHState } from "./types.js";

/** Schema for validating the header object of a Market document */
export const MarketDocumentHeaderSchema = BaseDocumentHeaderSchema.extend({
  documentType: z.literal(marketDocumentType),
});

/** Schema for validating the state object of a Market document */
export const MarketPHStateSchema = BaseDocumentStateSchema.extend({
  global: MarketStateSchema(),
});

export const MarketDocumentSchema = z.object({
  header: MarketDocumentHeaderSchema,
  state: MarketPHStateSchema,
  initialState: MarketPHStateSchema,
});

/** Simple helper function to check if a state object is a Market document state object */
export function isMarketState(state: unknown): state is MarketPHState {
  return MarketPHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a Market document state object */
export function assertIsMarketState(
  state: unknown,
): asserts state is MarketPHState {
  MarketPHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a Market document */
export function isMarketDocument(
  document: unknown,
): document is MarketDocument {
  return MarketDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a Market document */
export function assertIsMarketDocument(
  document: unknown,
): asserts document is MarketDocument {
  MarketDocumentSchema.parse(document);
}
