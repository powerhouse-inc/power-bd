/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { bdSettingsDocumentType } from "./document-type.js";
import { BdSettingsStateSchema } from "./schema/zod.js";
import type { BdSettingsDocument, BdSettingsPHState } from "./types.js";

/** Schema for validating the header object of a BdSettings document */
export const BdSettingsDocumentHeaderSchema = BaseDocumentHeaderSchema.extend({
  documentType: z.literal(bdSettingsDocumentType),
});

/** Schema for validating the state object of a BdSettings document */
export const BdSettingsPHStateSchema = BaseDocumentStateSchema.extend({
  global: BdSettingsStateSchema(),
});

export const BdSettingsDocumentSchema = z.object({
  header: BdSettingsDocumentHeaderSchema,
  state: BdSettingsPHStateSchema,
  initialState: BdSettingsPHStateSchema,
});

/** Simple helper function to check if a state object is a BdSettings document state object */
export function isBdSettingsState(state: unknown): state is BdSettingsPHState {
  return BdSettingsPHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a BdSettings document state object */
export function assertIsBdSettingsState(
  state: unknown,
): asserts state is BdSettingsPHState {
  BdSettingsPHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a BdSettings document */
export function isBdSettingsDocument(
  document: unknown,
): document is BdSettingsDocument {
  return BdSettingsDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a BdSettings document */
export function assertIsBdSettingsDocument(
  document: unknown,
): asserts document is BdSettingsDocument {
  BdSettingsDocumentSchema.parse(document);
}
