/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  MarkSubmissionInput,
  RecordSubmissionOutcomeInput,
} from "../types.js";

export type MarkSubmissionAction = Action & {
  type: "MARK_SUBMISSION";
  input: MarkSubmissionInput;
};
export type RecordSubmissionOutcomeAction = Action & {
  type: "RECORD_SUBMISSION_OUTCOME";
  input: RecordSubmissionOutcomeInput;
};

export type OpportunitySubmissionsAction =
  | MarkSubmissionAction
  | RecordSubmissionOutcomeAction;
