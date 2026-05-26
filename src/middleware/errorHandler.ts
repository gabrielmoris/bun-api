import type { BunRequest } from "bun";
import { withCors } from "./cors";
import { isAppError } from "../repositories/errorFactory";

type Handler = (req: BunRequest) => Response | Promise<Response>;

export function withErrorHandler(handler: Handler): Handler {
  return async (req: BunRequest): Promise<Response> => {
    try {
      return await handler(req);
    } catch (err) {
      if (isAppError(err)) {
        return withCors(
          req,
          Response.json(
            {
              error: {
                code: err.code,
                message: err.message,
                details: err.details,
              },
            },
            { status: err.statusCode },
          ),
        );
      }

      console.error("[UNEXPECTED ERROR]", err);
      return withCors(
        req,
        Response.json(
          {
            error: {
              code: "UNKNOWN_ERROR",
              message: "Internal server error",
              details: [],
            },
          },
          { status: 500 },
        ),
      );
    }
  };
}
