export type ApiErrorDetail = {
  field: string;
  message: string;
};

export enum ApiErrorCode {
  MISSING_ENTRY = 'MISSING_ENTRY',
  DUPLICATED_ENTRY = 'DUPLICATED_ENTRY',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  INVALID_ID = 'INVALID_ID',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export type ApiError = {
  error: {
    code: ApiErrorCode;
    message: string;
    details: ApiErrorDetail[];
  };
};

export type AppErrorData = {
  code: string;
  statusCode: number;
  message: string;
  details: ApiErrorDetail[];
};
