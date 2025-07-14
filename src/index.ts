/**
 * @module gatex
 *
 * Welcome to the GatEX API documentation.
 *
 * This is the main entry point for the library, exporting all public classes,
 * decorators, and types to build your Express application structure.
 *
 * ### Core Components
 * - **{@link GroupingProvider}**: The main class for creating route groups.
 * - **{@link IRepository}**: The interface for creating RESTful repositories.
 *
 * ### Decorators
 * A collection of decorators used to apply metadata to your repositories.
 * See the **Decorators** category for a full list.
 *
 * ### Public Types
 * Helper types for defining handlers, schemas, and arguments.
 * See the **Types** category for more details.
 */

// Core class
export { default as GroupingProvider } from "./GroupingProvider";

// Custom error
export { default as ValidationSchemeError } from "./ValidationSchemeError";

// Core interface
export type { IRepository } from "./IRepository";

// All public types exported from a single file
export type {
  GatEXHandler,
  RequestSchemaType,
  HandlersList,
  GroupArgs,
  GroupCallback,
} from "./types";

// Decorators
export { Schema, Middleware, IdParam, PathName } from "./decorators";
