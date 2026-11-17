export type ErrorCode = "STATUS_UNCHANGED";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class StatusUnchangedError extends Error implements ReducerError {
  errorCode = "STATUS_UNCHANGED" as ErrorCode;
  constructor(message = "StatusUnchangedError") {
    super(message);
  }
}

export const errors = {
  ArchiveContact: { StatusUnchangedError },
};
