/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { decisionDocumentType } from "./document-type.js";
import { DecisionStateSchema } from "./schema/zod.js";
import type { DecisionDocument, DecisionPHState } from "./types.js";

/** Schema for validating the header object of a Decision document */
export const DecisionDocumentHeaderSchema = BaseDocumentHeaderSchema.extend({
  documentType: z.literal(decisionDocumentType),
});

/** Schema for validating the state object of a Decision document */
export const DecisionPHStateSchema = BaseDocumentStateSchema.extend({
  global: DecisionStateSchema(),
});

export const DecisionDocumentSchema = z.object({
  header: DecisionDocumentHeaderSchema,
  state: DecisionPHStateSchema,
  initialState: DecisionPHStateSchema,
});

/** Simple helper function to check if a state object is a Decision document state object */
export function isDecisionState(state: unknown): state is DecisionPHState {
  return DecisionPHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a Decision document state object */
export function assertIsDecisionState(
  state: unknown,
): asserts state is DecisionPHState {
  DecisionPHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a Decision document */
export function isDecisionDocument(
  document: unknown,
): document is DecisionDocument {
  return DecisionDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a Decision document */
export function assertIsDecisionDocument(
  document: unknown,
): asserts document is DecisionDocument {
  DecisionDocumentSchema.parse(document);
}
