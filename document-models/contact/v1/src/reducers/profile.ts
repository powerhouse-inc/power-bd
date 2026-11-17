import type { ContactProfileOperations } from "document-models/contact/v1";
import {
  DuplicateTagError,
  InvalidTagError,
  TagNotFoundError,
} from "../../gen/profile/error.js";

export const contactProfileOperations: ContactProfileOperations = {
  setProfileOperation(state, action) {
    const i = action.input;
    if (i.name !== undefined) state.name = i.name;
    if (i.kind !== undefined && i.kind !== null) state.kind = i.kind;
    if (i.email !== undefined) state.email = i.email;
    if (i.phone !== undefined) state.phone = i.phone;
    if (i.website !== undefined) state.website = i.website;
    if (i.vatId !== undefined) state.vatId = i.vatId;
    if (i.registrationNumber !== undefined)
      state.registrationNumber = i.registrationNumber;
    if (i.notes !== undefined) state.notes = i.notes;
  },
  setAddressOperation(state, action) {
    state.address = {
      street: action.input.street ?? null,
      postalCode: action.input.postalCode ?? null,
      city: action.input.city ?? null,
      country: action.input.country ?? null,
    };
  },
  addTagOperation(state, action) {
    const tag = action.input.tag.trim();
    if (tag.length === 0) throw new InvalidTagError("A tag needs text");
    if (state.tags.includes(tag))
      throw new DuplicateTagError(`Tag ${tag} exists`);
    state.tags.push(tag);
  },
  removeTagOperation(state, action) {
    const index = state.tags.indexOf(action.input.tag);
    if (index === -1)
      throw new TagNotFoundError(`Tag ${action.input.tag} not found`);
    state.tags.splice(index, 1);
  },
};
