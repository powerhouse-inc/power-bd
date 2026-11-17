/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  MarkSubmissionInputSchema,
  RecordSubmissionOutcomeInputSchema,
} from "../schema/zod.js";
import type {
  MarkSubmissionInput,
  RecordSubmissionOutcomeInput,
} from "../types.js";
import type {
  MarkSubmissionAction,
  RecordSubmissionOutcomeAction,
} from "./actions.js";

export const markSubmission = (input: MarkSubmissionInput) =>
  createAction<MarkSubmissionAction>(
    "MARK_SUBMISSION",
    { ...input },
    undefined,
    MarkSubmissionInputSchema,
    "global",
  );

export const recordSubmissionOutcome = (input: RecordSubmissionOutcomeInput) =>
  createAction<RecordSubmissionOutcomeAction>(
    "RECORD_SUBMISSION_OUTCOME",
    { ...input },
    undefined,
    RecordSubmissionOutcomeInputSchema,
    "global",
  );
