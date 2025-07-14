import {
  Application,
  IRouter as IExpressRouter,
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
  ErrorRequestHandler,
} from "express";
import RequestSchema from "./RequestSchema";
import path from "path/posix";
import { IRepository } from "./IRepository";
import ValidationSchemeError from "./ValidationSchemeError";
import { CLASS_META_KEY, METHOD_META_KEY } from "./decorators";
import { GroupArgs, GroupCallback, HandlersList } from "./types";

/**
 * Manages route grouping, middleware application, and automated registration
 * for Express applications.
 * @category Core Components
 */
export default class GroupingProvider {
  private head: string;
  private middlewares: RequestHandler[] = [];
  public router: IExpressRouter;

  private SchemeErrorHandler: ErrorRequestHandler =
    ValidationSchemeError.handler;
  private ErrorHandlers: ErrorRequestHandler[] = [];

  /**
   * Creates an instance of GroupingProvider.
   * @param router The Express router instance to use. Defaults to a new Router.
   * @param path The base path for all routes registered through this provider instance. Defaults to '/'.
   * @param middlewares An array of middleware functions to be applied to all routes in this group.
   */
  constructor(
    router: IExpressRouter = Router(),
    path: string = "/",
    middlewares: RequestHandler[] = []
  ) {
    this.head = path;
    this.router = router;
    this.middlewares = Array.isArray(middlewares) ? middlewares : [middlewares];
  }

  /**
   * Uses a given router in the current route group.
   * @param router - The router to be used.
   */
  public use(router: Router) {
    this.router.use(router);
  }

  /**
   * Returns the Express router instance for the route group.
   * @returns The Express router instance.
   */
  public Router(): IExpressRouter {
    return this.router;
  }

  /**
   * Finalizes the setup by mounting the main router and error handlers onto the
   * provided Express application. This should be called after all routes are defined.
   * @param app The Express application instance.
   */
  public finish(app: Application): void {
    app.use(this.router);

    app.use(this.SchemeErrorHandler);

    if (this.ErrorHandlers.length >= 1) app.use(this.ErrorHandlers);
  }

  /**
   * Comment here
   */
  public set schemeErrorHandler(
    handler: (
      err: ValidationSchemeError,
      req: Request,
      res: Response,
      next: NextFunction
    ) => void
  ) {
    this.SchemeErrorHandler = (
      err: Error,
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      if (err instanceof ValidationSchemeError)
        handler(err as ValidationSchemeError, req, res, next);
      else next(err);
    };
  }

  private parseGroupArgs(args: GroupArgs): {
    path: string;
    middlewares: RequestHandler[];
    fn: GroupCallback;
  } {
    let path = "";
    let middlewares = [...this.middlewares];
    let fn: GroupCallback;

    if (args.length === 3) {
      const [p, m, f] = args;
      path = p;
      middlewares.push(m);
      fn = f;
    } else if (args.length === 2) {
      const [a, b] = args;

      if (typeof a === "string") {
        path = a;
        fn = b;
      } else {
        middlewares.push(a);
        fn = b;
      }
    } else fn = args[0];

    return { path, middlewares, fn };
  }

  /**
   * Creates a new nested route group with flexible arguments.
   *
   * Can be called in multiple ways:
   * - `group((router) => { ... })`
   * - `group('path', (router) => { ... })`
   * - `group(middleware, (router) => { ... })`
   * - `group('path', middleware, (router) => { ... })`
   *
   * @param args The arguments for creating the group, which can include a path, middleware, and the callback function.
   */
  public group(...args: GroupArgs): void {
    const { path, middlewares, fn } = this.parseGroupArgs(args);
    const normalizedPath = this.normalizeRoute(this.head, path);

    fn(new GroupingProvider(this.router, normalizedPath, middlewares));
  }

  /**
   * Normalizes the given paths into a single path string.
   * @param paths - Paths to be normalized.
   * @returns The normalized path.
   */
  private normalizeRoute(...paths: string[]): string {
    return path.posix.join(...paths);
  }

  /**
   * Handles requests for a specific request handler, managing errors if they occur.
   * @param requestHandler - The request handler function.
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function in the stack.
   */
  private async handleRequest(
    requestHandler: RequestHandler,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      await requestHandler(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Equalizes request handlers by wrapping them with error handling or applying schemas.
   * @param requestHandlers - An array of request handlers to equalize.
   * @returns An array of equalized request handlers.
   */
  private equalizeHandlers(requestHandlers: any[]): RequestHandler[] {
    return requestHandlers.map((handler) =>
      typeof handler === "function"
        ? (req: Request, res: Response, next: NextFunction) =>
            this.handleRequest(handler, req, res, next)
        : RequestSchema(handler)
    );
  }

  /**
   * Registers a route with the specified HTTP method and handlers.
   * @param method - The HTTP method for the route (GET, POST, etc.).
   * @param path - The path(s) for the route.
   * @param handlers - The handlers for the route, including schemas and request handlers.
   */
  private registerRoute(
    method: "get" | "post" | "put" | "patch" | "delete",
    path: string | string[],
    handlers: HandlersList
  ) {
    const normalizedPaths = Array.isArray(path) ? path : [path];
    const finalHandlers = this.equalizeHandlers(handlers);

    normalizedPaths.forEach((singlePath) => {
      this.router[method](
        this.normalizeRoute(this.head, singlePath),
        ...this.middlewares,
        ...finalHandlers
      );
    });
  }

  /**
   * Registers a GET route.
   * @param path The route path(s).
   * @param handlers A list of handlers, which can include a validation schema and middleware.
   * @returns The `GroupingProvider` instance for chaining.
   * @example
   * ```ts
   * provider.get('/health', (req, res) => res.send('OK'));
   * provider.get('/users/:id', userSchema, getUserHandler);
   * ```
   */
  public get(
    path: string | string[],
    ...handlers: HandlersList
  ): GroupingProvider {
    this.registerRoute("get", path, handlers);
    return this;
  }

  /**
   * Registers a POST route.
   * @param path The route path(s).
   * @param handlers A list of handlers, which can include a validation schema and middleware.
   * @returns The `GroupingProvider` instance for chaining.
   * @example
   * ```ts
   * provider.post('/users', userCreateSchema, createUserHandler);
   * ```
   */
  public post(
    path: string | string[],
    ...handlers: HandlersList
  ): GroupingProvider {
    this.registerRoute("post", path, handlers);
    return this;
  }

  /**
   * Registers a PUT route.
   * @param path The route path(s).
   * @param handlers A list of handlers, which can include a validation schema and middleware.
   * @returns The `GroupingProvider` instance for chaining.
   * @example
   * ```ts
   * provider.put('/users/:id', userUpdateSchema, updateUserHandler);
   * ```
   */
  public put(
    path: string | string[],
    ...handlers: HandlersList
  ): GroupingProvider {
    this.registerRoute("put", path, handlers);
    return this;
  }

  /**
   * Registers a PATCH route.
   * @param path The route path(s).
   * @param handlers A list of handlers, which can include a validation schema and middleware.
   * @returns The `GroupingProvider` instance for chaining.
   * @example
   * ```ts
   * provider.patch('/users/:id', userPatchSchema, patchUserHandler);
   * ```
   */
  public patch(
    path: string | string[],
    ...handlers: HandlersList
  ): GroupingProvider {
    this.registerRoute("patch", path, handlers);
    return this;
  }

  /**
   * Registers a DELETE route.
   * @param path The route path(s).
   * @param handlers A list of handlers, which can include middleware.
   * @returns The `GroupingProvider` instance for chaining.
   * @example
   * ```ts
   * provider.delete('/users/:id', deleteUserHandler);
   * ```
   */
  public delete(
    path: string | string[],
    ...handlers: HandlersList
  ): GroupingProvider {
    this.registerRoute("delete", path, handlers);
    return this;
  }

  /**
   * Registers a repository, automatically creating RESTful routes based on its
   * methods and decorator metadata.
   * @param repository An instance of a class that implements IRepository.
   * @param path Optional. Overrides the base path name defined by the `@PathName` decorator or the class name.
   * @returns The `GroupingProvider` instance for chaining.
   */
  public repository(repository: IRepository, path?: string) {
    const classMeta =
      Reflect.getMetadata(CLASS_META_KEY, repository.constructor) ?? {};

    const methodMeta =
      Reflect.getMetadata(METHOD_META_KEY, repository.constructor.prototype) ??
      {};

    const pathName: string =
      path ??
      classMeta.pathName ??
      repository.constructor.name.replace(/Repository$/, "");
    const idParam = classMeta.idParam ?? `id`;

    const methods: Record<string, { verb: string; path: string }> = {
      create: { verb: "post", path: pathName },
      list: { verb: "get", path: pathName },
      get: { verb: "get", path: `${pathName}/:${idParam}` },
      update: { verb: "put", path: `${pathName}/:${idParam}` },
      patch: { verb: "patch", path: `${pathName}/:${idParam}` },
      delete: { verb: "delete", path: `${pathName}/:${idParam}` },
    };

    for (const methodName in methods) {
      const fn = (repository as any)[methodName];
      if (typeof fn !== "function") continue;

      const meta = methodMeta[methodName] ?? {};
      const args = [
        meta.schema,
        ...(meta.middleware || []),
        fn.bind(repository),
      ].filter(Boolean);

      (this as any)[methods[methodName].verb](
        methods[methodName].path,
        ...args
      );
    }

    return this;
  }
}
