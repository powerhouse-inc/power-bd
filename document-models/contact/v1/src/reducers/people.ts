import type { ContactPeopleOperations } from "document-models/contact/v1";
import { PersonNotFoundError } from "../../gen/people/error.js";

/** Rule: a missing or empty role, email or phone is stored as none (`null`), never as `""`. */
const orNone = (value: string | null | undefined): string | null =>
  (value ?? "") === "" ? null : (value as string);

export const contactPeopleOperations: ContactPeopleOperations = {
  addPersonOperation(state, action) {
    state.people.push({
      id: action.input.id,
      name: action.input.name,
      role: orNone(action.input.role),
      email: orNone(action.input.email),
      phone: orNone(action.input.phone),
    });
  },
  updatePersonOperation(state, action) {
    const person = state.people.find((p) => p.id === action.input.id);
    if (!person)
      throw new PersonNotFoundError(`Person ${action.input.id} not found`);
    if (action.input.name !== undefined && action.input.name !== null)
      person.name = action.input.name;
    if (action.input.role !== undefined)
      person.role = orNone(action.input.role);
    if (action.input.email !== undefined)
      person.email = orNone(action.input.email);
    if (action.input.phone !== undefined)
      person.phone = orNone(action.input.phone);
  },
  removePersonOperation(state, action) {
    const index = state.people.findIndex((p) => p.id === action.input.id);
    if (index === -1)
      throw new PersonNotFoundError(`Person ${action.input.id} not found`);
    state.people.splice(index, 1);
  },
};
