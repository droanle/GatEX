import "reflect-metadata";
import { RequestHandler } from "express";
import { RequestSchemaType } from "./types";

export const METHOD_META_KEY = Symbol("repository:method-notations");
export const CLASS_META_KEY = Symbol("repository:class-notation");

/**
 * Attaches a Zod validation schema to a repository method.
 * @param schema The Zod schema or an object of schemas for validating `body`, `query`, `params`, and `headers`.
 * @returns A method decorator.
 * @category Decorators
 */
export function Schema(schema: RequestSchemaType) {
  return (target: any, propertyKey: string | symbol) => {
    const meta = Reflect.getMetadata(METHOD_META_KEY, target) || {};
    meta[propertyKey] = { ...(meta[propertyKey] || {}), schema };
    Reflect.defineMetadata(METHOD_META_KEY, meta, target);
  };
}

/**
 * Attaches Express middleware(s) to a repository method.
 * These middlewares will run before the main method handler.
 * @param middlewares A list of Express RequestHandler functions.
 * @returns A method decorator.
 * @category Decorators
 */
export function Middleware(...middlewares: RequestHandler[]) {
  return (target: any, propertyKey: string | symbol) => {
    const meta = Reflect.getMetadata(METHOD_META_KEY, target) || {};
    meta[propertyKey] = {
      ...(meta[propertyKey] || {}),
      middleware: middlewares,
    };
    Reflect.defineMetadata(METHOD_META_KEY, meta, target);
  };
}

/**
 * Sets the name of the ID parameter for repository routes that require an ID.
 * Defaults to 'id' if not specified.
 * @param idParam The name of the route parameter (e.g., 'userId').
 * @returns A class decorator.
 * @category Decorators
 * @example
 * ```ts
 * @IdParam("postId") // Routes will be /posts/:postId
 * class PostRepository implements IRepository { }
 * ```
 */
export function IdParam(idParam: string) {
  return (target: any) => {
    let meta = Reflect.getMetadata(CLASS_META_KEY, target) || {};
    meta = {
      ...(meta || {}),
      idParam,
    };
    Reflect.defineMetadata(CLASS_META_KEY, meta, target);
  };
}

/**
 * Sets the base path name for all routes within a repository.
 * If not specified, GatEX uses the class name (e.g., `UserRepository` becomes `/users`).
 * @param pathName The base path for the resource (e.g., 'users').
 * @returns A class decorator.
 * @category Decorators
 */
export function PathName(pathName: string) {
  return (target: any) => {
    let meta = Reflect.getMetadata(CLASS_META_KEY, target) || {};
    meta = {
      ...(meta || {}),
      pathName,
    };
    Reflect.defineMetadata(CLASS_META_KEY, meta, target);
  };
}
