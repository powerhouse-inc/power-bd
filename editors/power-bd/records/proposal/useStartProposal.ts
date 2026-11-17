import {
  dispatchActions,
  useSelectedDriveId,
  useSetSelectedNode,
} from "@powerhousedao/reactor-browser";
import { actions, type ProposalAction } from "document-models/proposal";
import { useCreateRecord } from "../../components/shared/useCreateRecord.js";
import type { OnErrors } from "../../components/shared/useRun.js";
import type { CopyStep } from "../../kit/proposal-copy/index.js";

/**
 * A copy step names its creator in `actions` and carries that creator's input.
 * The narrow cast is the only one: `copyProposal` types its steps by name, so
 * the pair cannot be checked here (typing `CopyStep` as actions would remove it).
 */
export function stepAction(step: CopyStep): ProposalAction {
  const creators = actions as unknown as Record<
    string,
    ((input: Record<string, unknown>) => ProposalAction) | undefined
  >;
  const create = creators[step.op];
  if (!create) throw new Error(`The proposal has no step named ${step.op}.`);
  return create(step.input);
}

/**
 * Starts a proposal in the `Proposals` folder, with the steps that fill it, and
 * opens it. `error` is why the record could not be made; a step the model
 * rejects goes to `onErrors`.
 */
export function useStartProposal() {
  const driveId = useSelectedDriveId();
  const select = useSetSelectedNode();
  const { create, error } = useCreateRecord(
    driveId ?? "",
    "Proposals",
    "powerbd/proposal",
    "The proposal could not be started.",
  );
  const start = async (
    name: string,
    steps: ProposalAction[],
    onErrors: OnErrors,
  ): Promise<void> => {
    if (!driveId) return onErrors([new Error("Open the team's space first.")]);
    const id = await create(name, { open: false });
    if (!id) return;
    try {
      await dispatchActions(steps, id, onErrors);
      select(id);
    } catch (e) {
      onErrors([
        e instanceof Error
          ? e
          : new Error("The proposal could not be started."),
      ]);
    }
  };
  return { start, error };
}
