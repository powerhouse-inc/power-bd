/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { leadDocumentType } from "./document-type.js";
import { LeadStateSchema } from "./schema/zod.js";
import type { LeadDocument, LeadPHState } from "./types.js";

/** Schema for validating the header object of a Lead document */
export const LeadDocumentHeaderSchema = BaseDocumentHeaderSchema.extend({
  documentType: z.literal(leadDocumentType),
});

/** Schema for validating the state object of a Lead document */
export const LeadPHStateSchema = BaseDocumentStateSchema.extend({
  global: LeadStateSchema(),
});

export const LeadDocumentSchema = z.object({
  header: LeadDocumentHeaderSchema,
  state: LeadPHStateSchema,
  initialState: LeadPHStateSchema,
});

/** Simple helper function to check if a state object is a Lead document state object */
export function isLeadState(state: unknown): state is LeadPHState {
  return LeadPHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a Lead document state object */
export function assertIsLeadState(
  state: unknown,
): asserts state is LeadPHState {
  LeadPHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a Lead document */
export function isLeadDocument(document: unknown): document is LeadDocument {
  return LeadDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a Lead document */
export function assertIsLeadDocument(
  document: unknown,
): asserts document is LeadDocument {
  LeadDocumentSchema.parse(document);
}
