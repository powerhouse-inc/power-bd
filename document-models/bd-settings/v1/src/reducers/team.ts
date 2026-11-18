import type { BdSettingsTeamOperations } from "document-models/bd-settings/v1";
import {
  DuplicateTeamMemberAddressError,
  DuplicateTeamMemberIdError,
  TeamMemberNameRequiredError,
  TeamMemberNotFoundError,
} from "../../gen/team/error.js";

export const bdSettingsTeamOperations: BdSettingsTeamOperations = {
  addTeamMemberOperation(state, action) {
    const { id, name, address } = action.input;
    if (state.teamMembers.some((member) => member.id === id))
      throw new DuplicateTeamMemberIdError(`Team member ${id} already exists`);
    if (
      state.teamMembers.some(
        (member) => member.address.toLowerCase() === address.toLowerCase(),
      )
    )
      throw new DuplicateTeamMemberAddressError(
        `Another team member already has the address ${address}`,
      );
    if (name.trim() === "")
      throw new TeamMemberNameRequiredError("A team member needs a name");
    state.teamMembers.push({
      id: action.input.id,
      name: action.input.name,
      address: action.input.address,
      active: true,
      email: action.input.email ?? null,
    });
  },
  updateTeamMemberOperation(state, action) {
    const { id, name, address } = action.input;
    const member = state.teamMembers.find((candidate) => candidate.id === id);
    if (!member)
      throw new TeamMemberNotFoundError(`Team member ${id} not found`);
    if (
      address != null &&
      state.teamMembers.some(
        (other) =>
          other.id !== id &&
          other.address.toLowerCase() === address.toLowerCase(),
      )
    )
      throw new DuplicateTeamMemberAddressError(
        `Another team member already has the address ${address}`,
      );
    if (name != null && name.trim() === "")
      throw new TeamMemberNameRequiredError("A team member needs a name");
    if (name != null) member.name = name;
    if (address != null) member.address = address;
    if (action.input.email !== undefined)
      member.email = action.input.email ?? null;
  },
  deactivateTeamMemberOperation(state, action) {
    const member = state.teamMembers.find(
      (candidate) => candidate.id === action.input.id,
    );
    if (!member)
      throw new TeamMemberNotFoundError(
        `Team member ${action.input.id} not found`,
      );
    member.active = false;
  },
  reactivateTeamMemberOperation(state, action) {
    const member = state.teamMembers.find(
      (candidate) => candidate.id === action.input.id,
    );
    if (!member)
      throw new TeamMemberNotFoundError(
        `Team member ${action.input.id} not found`,
      );
    member.active = true;
  },
};
