/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { playbookDocumentType } from "./document-type.js";
import { PlaybookStateSchema } from "./schema/zod.js";
import type { PlaybookDocument, PlaybookPHState } from "./types.js";

/** Schema for validating the header object of a Playbook document */
export const PlaybookDocumentHeaderSchema = BaseDocumentHeaderSchema.extend({
  documentType: z.literal(playbookDocumentType),
});

/** Schema for validating the state object of a Playbook document */
export const PlaybookPHStateSchema = BaseDocumentStateSchema.extend({
  global: PlaybookStateSchema(),
});

export const PlaybookDocumentSchema = z.object({
  header: PlaybookDocumentHeaderSchema,
  state: PlaybookPHStateSchema,
  initialState: PlaybookPHStateSchema,
});

/** Simple helper function to check if a state object is a Playbook document state object */
export function isPlaybookState(state: unknown): state is PlaybookPHState {
  return PlaybookPHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a Playbook document state object */
export function assertIsPlaybookState(
  state: unknown,
): asserts state is PlaybookPHState {
  PlaybookPHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a Playbook document */
export function isPlaybookDocument(
  document: unknown,
): document is PlaybookDocument {
  return PlaybookDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a Playbook document */
export function assertIsPlaybookDocument(
  document: unknown,
): asserts document is PlaybookDocument {
  PlaybookDocumentSchema.parse(document);
}
