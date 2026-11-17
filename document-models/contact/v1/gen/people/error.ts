export type ErrorCode = "PERSON_NOT_FOUND";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class PersonNotFoundError extends Error implements ReducerError {
  errorCode = "PERSON_NOT_FOUND" as ErrorCode;
  constructor(message = "PersonNotFoundError") {
    super(message);
  }
}

export const errors = {
  UpdatePerson: { PersonNotFoundError },

  RemovePerson: { PersonNotFoundError },
};
