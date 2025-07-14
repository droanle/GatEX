import { GatEXHandler } from "./types";

/**
 * Defines the structure for a resource repository managed by GatEX.
 * By implementing this interface, GatEX can automatically map its methods
 * to standard RESTful HTTP routes.
 *
 * @example
 * ```ts
 * import { IRepository } from 'gatex';
 *
 * @PathName("posts")
 * export class PostRepository implements IRepository {
 * // ... method implementations
 * }
 * ```
 * @category Core Components
 */
export interface IRepository {
  /**
   * Mapped to **`POST /{pathName}`**.
   * Used to create a new resource. The request body (`req.body`) is the
   * intended source for creation data.
   */
  create?: GatEXHandler;

  /**
   * Mapped to **`GET /{pathName}`**.
   * Used to list a collection of resources. Schema validation typically applies
   * to `req.query` for filtering and pagination.
   */
  list?: GatEXHandler;

  /**
   * Mapped to **`GET /{pathName}/:{idParam}`**.
   * Used to retrieve a single resource by its ID. The ID will be available
   * in `req.params`.
   */
  get?: GatEXHandler;

  /**
   * Mapped to **`PUT /{pathName}/:{idParam}`**.
   * Used to completely replace an existing resource. The request body (`req.body`)
   * should contain the full resource representation.
   */
  update?: GatEXHandler;

  /**
   * Mapped to **`PATCH /{pathName}/:{idParam}`**.
   * Used to partially update an existing resource. The request body (`req.body`)
   * should contain only the fields to be updated.
   */
  patch?: GatEXHandler;

  /**
   * Mapped to **`DELETE /{pathName}/:{idParam}`**.
   * Used to delete a specific resource by its ID.
   */
  delete?: GatEXHandler;
}
