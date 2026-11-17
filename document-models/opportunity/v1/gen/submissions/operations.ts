/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { OpportunityGlobalState } from "../types.js";
import type {
  MarkSubmissionAction,
  RecordSubmissionOutcomeAction,
} from "./actions.js";

export interface OpportunitySubmissionsOperations {
  markSubmissionOperation: (
    state: OpportunityGlobalState,
    action: MarkSubmissionAction,
    dispatch?: SignalDispatch,
  ) => void;
  recordSubmissionOutcomeOperation: (
    state: OpportunityGlobalState,
    action: RecordSubmissionOutcomeAction,
    dispatch?: SignalDispatch,
  ) => void;
}
