import { Request, Response, NextFunction, RequestHandler } from "express";
import { z } from "zod";
import GroupingProvider from "./GroupingProvider";

/**
 * Represents a standard request handler function for GatEX.
 * It's an alias for the Express RequestHandler to provide cleaner documentation.
 *
 * @param req The Express request object.
 * @param res The Express response object.
 * @param next The next middleware function in the stack.
 *
 * @category Types
 */
export type GatEXHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Defines the structure for a validation schema.
 * It can be a single Zod schema or an object specifying schemas for different
 * parts of the request (body, query, params, headers).
 *
 * @category Types
 */
export type RequestSchemaType =
  | z.ZodTypeAny
  | {
      body?: z.ZodTypeAny;
      query?: z.ZodTypeAny;
      params?: z.ZodTypeAny;
      headers?: z.ZodTypeAny;
    };

/**
 * Represents the list of handlers that can be passed to route methods like
 * `get`, `post`, etc. It flexibly accepts an optional validation schema
 * followed by any number of Express request handlers.
 *
 * @category Types
 */
export type HandlersList =
  | [...requestHandler: RequestHandler[]]
  | [schema: RequestSchemaType, ...requestHandler: RequestHandler[]];

/**
 * A callback function that receives a GroupingProvider instance to define nested routes.
 *
 * @category Types
 */
export type GroupCallback = (router: GroupingProvider) => void;

/**
 * Represents the flexible argument list for the `group` method, allowing for
 * multiple overloads including path, middleware, and the group callback function.
 *
 * @category Types
 */
export type GroupArgs =
  | [path: string, middleware: RequestHandler, fn: GroupCallback]
  | [middleware: RequestHandler, fn: GroupCallback]
  | [path: string, fn: GroupCallback]
  | [fn: GroupCallback];
