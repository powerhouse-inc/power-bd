import type { ProposalPackagesOperations } from "document-models/proposal/v1";
import {
  DuplicatePackageCodeError,
  DuplicatePackageIdError,
  PackageInUseError,
  PackageNotFoundError,
  PackageOrderMismatchError,
  PackagePricedTwiceError,
  PackageRequiresItselfError,
  ProposalNotDraftError,
  UnknownRequiredPackageError,
} from "../../gen/packages/error.js";
import { checkAmountCurrency, checkPermutation } from "./shared.js";

export const proposalPackagesOperations: ProposalPackagesOperations = {
  addPackageOperation(state, action) {
    const { id, code, name, summary, requires, price, currency, targetDate } =
      action.input;
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    if (state.packages.some((pkg) => pkg.id === id))
      throw new DuplicatePackageIdError(`Package ${id} already exists`);
    if (state.packages.some((pkg) => pkg.code === code))
      throw new DuplicatePackageCodeError(
        `Package code ${code} is already used`,
      );
    const required = requires ?? [];
    for (const requiredId of required) {
      if (requiredId === id)
        throw new PackageRequiresItselfError("A package cannot require itself");
      if (!state.packages.some((pkg) => pkg.id === requiredId))
        throw new UnknownRequiredPackageError(
          `Required package ${requiredId} not found`,
        );
    }
    checkAmountCurrency(state, [price], currency);
    state.packages.push({
      id,
      code,
      name,
      summary: summary ?? null,
      requires: required,
      price: price ?? null,
      targetDate: targetDate ?? null,
    });
  },
  updatePackageOperation(state, action) {
    const input = action.input;
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    const pkg = state.packages.find((item) => item.id === input.id);
    if (!pkg) throw new PackageNotFoundError(`Package ${input.id} not found`);
    if (
      input.code != null &&
      state.packages.some((p) => p.id !== pkg.id && p.code === input.code)
    )
      throw new DuplicatePackageCodeError(
        `Package code ${input.code} is already used`,
      );
    for (const requiredId of input.requires ?? []) {
      if (requiredId === pkg.id)
        throw new PackageRequiresItselfError("A package cannot require itself");
      if (!state.packages.some((p) => p.id === requiredId))
        throw new UnknownRequiredPackageError(
          `Required package ${requiredId} not found`,
        );
    }
    if (input.price != null) {
      checkAmountCurrency(state, [input.price], input.currency);
      if (
        state.deliverables.some(
          (d) => d.packageId === pkg.id && d.price?.pricing === "FIXED",
        )
      )
        throw new PackagePricedTwiceError(
          `Package ${pkg.id} has fixed-price deliverables, so it cannot have a price of its own`,
        );
    }
    if (input.code != null) pkg.code = input.code;
    if (input.name != null) pkg.name = input.name;
    if (input.summary !== undefined) pkg.summary = input.summary;
    if (input.requires != null) pkg.requires = input.requires;
    if (input.price !== undefined) pkg.price = input.price;
    if (input.targetDate !== undefined) pkg.targetDate = input.targetDate;
  },
  removePackageOperation(state, action) {
    const { id } = action.input;
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    const index = state.packages.findIndex((pkg) => pkg.id === id);
    if (index === -1) throw new PackageNotFoundError(`Package ${id} not found`);
    if (
      state.deliverables.some((d) => d.packageId === id) ||
      state.options.some((o) => o.packageIds.includes(id)) ||
      state.packages.some((p) => p.requires.includes(id)) ||
      state.useCases.some((u) => u.packageId === id) ||
      state.boundaries.some((b) => b.packageId === id)
    )
      throw new PackageInUseError(
        `Package ${id} is still used by a deliverable, an option or another package`,
      );
    state.packages.splice(index, 1);
  },
  reorderPackagesOperation(state, action) {
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    const { ids } = action.input;
    checkPermutation(state.packages, ids, () => {
      throw new PackageOrderMismatchError(
        "The new order must list every package exactly once",
      );
    });
    state.packages = ids.map((id) =>
      state.packages.find((pkg) => pkg.id === id)!,
    );
  },
};
