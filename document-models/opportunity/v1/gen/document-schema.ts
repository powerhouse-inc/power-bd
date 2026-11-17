/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { opportunityDocumentType } from "./document-type.js";
import { OpportunityStateSchema } from "./schema/zod.js";
import type { OpportunityDocument, OpportunityPHState } from "./types.js";

/** Schema for validating the header object of a Opportunity document */
export const OpportunityDocumentHeaderSchema = BaseDocumentHeaderSchema.extend({
  documentType: z.literal(opportunityDocumentType),
});

/** Schema for validating the state object of a Opportunity document */
export const OpportunityPHStateSchema = BaseDocumentStateSchema.extend({
  global: OpportunityStateSchema(),
});

export const OpportunityDocumentSchema = z.object({
  header: OpportunityDocumentHeaderSchema,
  state: OpportunityPHStateSchema,
  initialState: OpportunityPHStateSchema,
});

/** Simple helper function to check if a state object is a Opportunity document state object */
export function isOpportunityState(
  state: unknown,
): state is OpportunityPHState {
  return OpportunityPHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a Opportunity document state object */
export function assertIsOpportunityState(
  state: unknown,
): asserts state is OpportunityPHState {
  OpportunityPHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a Opportunity document */
export function isOpportunityDocument(
  document: unknown,
): document is OpportunityDocument {
  return OpportunityDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a Opportunity document */
export function assertIsOpportunityDocument(
  document: unknown,
): asserts document is OpportunityDocument {
  OpportunityDocumentSchema.parse(document);
}
