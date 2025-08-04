import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

/**
 * A custom error class that represents a validation failure.
 *
 * This error is thrown by the `RequestSchema` middleware when request data
 * (like body, query, or params) fails to validate against the provided Zod schema.
 * It encapsulates detailed information about the validation failure.
 *
 * @extends Error
 * @category Error Handler
 */
export default class ValidationSchemeError extends Error {
  public readonly issues: ZodError["issues"];
  public readonly schema: z.ZodTypeAny;
  public readonly request: any;

  /**
   * Creates an instance of ValidationSchemeError.
   * @param message A general error message.
   * @param schema The Zod schema that was used for validation.
   * @param issues The detailed validation issues from Zod's `error.issues`.
   * @param request The original request data (body, query, etc.) that failed validation.
   */
  constructor(
    message: string,
    schema: z.ZodTypeAny,
    issues: ZodError["issues"],
    request: any
  ) {
    super(message);

    this.name = this.constructor.name;

    this.issues = issues;
    this.schema = schema;
    this.request = request;

    if (Error.captureStackTrace)
      Error.captureStackTrace(this, this.constructor);
  }

  /**
   * A static Express error handling middleware to catch and respond to `ValidationSchemeError`.
   *
   * If the received error is an instance of `ValidationSchemeError`, it formats a
   * detailed 400 Bad Request JSON response. Otherwise, it passes the error to the
   * next middleware.
   *
   * @param err The error object.
   * @param req The Express request object.
   * @param res The Express response object.
   * @param next The next middleware function.
   */
  public static handler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    if (err instanceof ValidationSchemeError) {
      const { message, issues, schema, request } = err;

      const response: any = {
        error: true,
        content: {
          message,
          request,
          schemaIssues: issues.map((issue) => ({
            attribute: issue.path.join("."),
            error: issue.message,
          })),
        },
      };

      res.status(400).json(response);
    } else next(err);
  }
}
