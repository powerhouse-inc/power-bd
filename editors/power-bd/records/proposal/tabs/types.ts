import type { ProposalAction, ProposalState } from "document-models/proposal";
import type { OnErrors } from "../../../components/shared/useRun.js";

/** Sends an action to the proposal; a rejection goes to `onErrors`. */
export type Send = (action: ProposalAction, onErrors: OnErrors) => void;

/** What every tab takes. */
export type TabProps = { s: ProposalState; send: Send; disabled: boolean };

export type Option<T extends string = string> = { value: T; label: string };
