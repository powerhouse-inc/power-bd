export type ErrorCode = "DUPLICATE_PARTNER_ID" | "PARTNER_NOT_FOUND";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicatePartnerIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_PARTNER_ID" as ErrorCode;
  constructor(message = "DuplicatePartnerIdError") {
    super(message);
  }
}

export class PartnerNotFoundError extends Error implements ReducerError {
  errorCode = "PARTNER_NOT_FOUND" as ErrorCode;
  constructor(message = "PartnerNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddPartner: { DuplicatePartnerIdError },

  UpdatePartner: { PartnerNotFoundError },

  RemovePartner: { PartnerNotFoundError },
};
