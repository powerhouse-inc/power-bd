/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { investorListDocumentType } from "./document-type.js";
import { InvestorListStateSchema } from "./schema/zod.js";
import type { InvestorListDocument, InvestorListPHState } from "./types.js";

/** Schema for validating the header object of a InvestorList document */
export const InvestorListDocumentHeaderSchema = BaseDocumentHeaderSchema.extend(
  {
    documentType: z.literal(investorListDocumentType),
  },
);

/** Schema for validating the state object of a InvestorList document */
export const InvestorListPHStateSchema = BaseDocumentStateSchema.extend({
  global: InvestorListStateSchema(),
});

export const InvestorListDocumentSchema = z.object({
  header: InvestorListDocumentHeaderSchema,
  state: InvestorListPHStateSchema,
  initialState: InvestorListPHStateSchema,
});

/** Simple helper function to check if a state object is a InvestorList document state object */
export function isInvestorListState(
  state: unknown,
): state is InvestorListPHState {
  return InvestorListPHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a InvestorList document state object */
export function assertIsInvestorListState(
  state: unknown,
): asserts state is InvestorListPHState {
  InvestorListPHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a InvestorList document */
export function isInvestorListDocument(
  document: unknown,
): document is InvestorListDocument {
  return InvestorListDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a InvestorList document */
export function assertIsInvestorListDocument(
  document: unknown,
): asserts document is InvestorListDocument {
  InvestorListDocumentSchema.parse(document);
}
