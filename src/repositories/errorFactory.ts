import type {
  ApiErrorCode,
  ApiErrorDetail,
  AppErrorData,
} from "../types/errorType";

export function createAppError(
  code: ApiErrorCode,
  statusCode: number,
  message: string,
  details: ApiErrorDetail[] = [],
): AppErrorData {
  return { code, statusCode, message, details };
}

export function isAppError(err: unknown): err is AppErrorData {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as AppErrorData).code === "string" &&
    "statusCode" in err &&
    typeof (err as AppErrorData).statusCode === "number"
  );
}
