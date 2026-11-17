import type { ProposalScopeOperations } from "document-models/proposal/v1";
import {
  ActorInUseError,
  ActorNotFoundError,
  BoundaryNotFoundError,
  DuplicateActorCodeError,
  DuplicateActorIdError,
  DuplicateBoundaryIdError,
  DuplicateUseCaseCodeError,
  DuplicateUseCaseIdError,
  PackageNotFoundError,
  ProposalNotDraftError,
  UseCaseNotFoundError,
} from "../../gen/scope/error.js";

export const proposalScopeOperations: ProposalScopeOperations = {
  addActorOperation(state, action) {
    const { id, code, name, description } = action.input;
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    if (state.actors.some((actor) => actor.id === id))
      throw new DuplicateActorIdError(`Actor ${id} already exists`);
    if (state.actors.some((actor) => actor.code === code))
      throw new DuplicateActorCodeError(`Actor code ${code} is already used`);
    state.actors.push({ id, code, name, description: description ?? null });
  },
  updateActorOperation(state, action) {
    const input = action.input;
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    const actor = state.actors.find((item) => item.id === input.id);
    if (!actor) throw new ActorNotFoundError(`Actor ${input.id} not found`);
    if (
      input.code != null &&
      state.actors.some((a) => a.id !== actor.id && a.code === input.code)
    )
      throw new DuplicateActorCodeError(
        `Actor code ${input.code} is already used`,
      );
    if (input.code != null) actor.code = input.code;
    if (input.name != null) actor.name = input.name;
    if (input.description !== undefined) actor.description = input.description;
  },
  removeActorOperation(state, action) {
    const { id } = action.input;
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    const index = state.actors.findIndex((actor) => actor.id === id);
    if (index === -1) throw new ActorNotFoundError(`Actor ${id} not found`);
    if (state.useCases.some((useCase) => useCase.actorId === id))
      throw new ActorInUseError(`Actor ${id} is still used by a use case`);
    state.actors.splice(index, 1);
  },
  addUseCaseOperation(state, action) {
    const { id, code, actorId, packageId, title, body } = action.input;
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    if (state.useCases.some((useCase) => useCase.id === id))
      throw new DuplicateUseCaseIdError(`Use case ${id} already exists`);
    if (state.useCases.some((useCase) => useCase.code === code))
      throw new DuplicateUseCaseCodeError(
        `Use case code ${code} is already used`,
      );
    if (!state.actors.some((actor) => actor.id === actorId))
      throw new ActorNotFoundError(`Actor ${actorId} not found`);
    if (!state.packages.some((pkg) => pkg.id === packageId))
      throw new PackageNotFoundError(`Package ${packageId} not found`);
    state.useCases.push({
      id,
      code,
      actorId,
      packageId,
      title,
      body: body ?? null,
    });
  },
  updateUseCaseOperation(state, action) {
    const input = action.input;
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    const useCase = state.useCases.find((item) => item.id === input.id);
    if (!useCase)
      throw new UseCaseNotFoundError(`Use case ${input.id} not found`);
    if (
      input.code != null &&
      state.useCases.some((u) => u.id !== useCase.id && u.code === input.code)
    )
      throw new DuplicateUseCaseCodeError(
        `Use case code ${input.code} is already used`,
      );
    if (
      input.actorId != null &&
      !state.actors.some((actor) => actor.id === input.actorId)
    )
      throw new ActorNotFoundError(`Actor ${input.actorId} not found`);
    if (
      input.packageId != null &&
      !state.packages.some((pkg) => pkg.id === input.packageId)
    )
      throw new PackageNotFoundError(`Package ${input.packageId} not found`);
    if (input.code != null) useCase.code = input.code;
    if (input.actorId != null) useCase.actorId = input.actorId;
    if (input.packageId != null) useCase.packageId = input.packageId;
    if (input.title != null) useCase.title = input.title;
    if (input.body !== undefined) useCase.body = input.body;
  },
  removeUseCaseOperation(state, action) {
    const { id } = action.input;
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    const index = state.useCases.findIndex((useCase) => useCase.id === id);
    if (index === -1)
      throw new UseCaseNotFoundError(`Use case ${id} not found`);
    state.useCases.splice(index, 1);
    state.figures = state.figures.filter(
      (figure) => !(figure.anchorKind === "USE_CASE" && figure.anchorId === id),
    );
  },
  addBoundaryOperation(state, action) {
    const { id, kind, packageId, text, value } = action.input;
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    if (state.boundaries.some((boundary) => boundary.id === id))
      throw new DuplicateBoundaryIdError(`Boundary ${id} already exists`);
    if (
      packageId != null &&
      !state.packages.some((pkg) => pkg.id === packageId)
    )
      throw new PackageNotFoundError(`Package ${packageId} not found`);
    state.boundaries.push({
      id,
      kind,
      packageId: packageId ?? null,
      text,
      value: value ?? null,
    });
  },
  updateBoundaryOperation(state, action) {
    const input = action.input;
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    const boundary = state.boundaries.find((item) => item.id === input.id);
    if (!boundary)
      throw new BoundaryNotFoundError(`Boundary ${input.id} not found`);
    if (
      input.packageId != null &&
      !state.packages.some((pkg) => pkg.id === input.packageId)
    )
      throw new PackageNotFoundError(`Package ${input.packageId} not found`);
    if (input.kind != null) boundary.kind = input.kind;
    if (input.packageId !== undefined) boundary.packageId = input.packageId;
    if (input.text != null) boundary.text = input.text;
    if (input.value !== undefined) boundary.value = input.value;
  },
  removeBoundaryOperation(state, action) {
    const { id } = action.input;
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    const index = state.boundaries.findIndex((boundary) => boundary.id === id);
    if (index === -1)
      throw new BoundaryNotFoundError(`Boundary ${id} not found`);
    state.boundaries.splice(index, 1);
  },
};
