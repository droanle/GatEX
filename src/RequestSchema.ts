import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodSchema } from "zod";
import ValidationSchemeError from "./ValidationSchemeError";
import { RequestSchemaType } from "./types";

export default function RequestSchema(
  schema: RequestSchemaType
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema instanceof ZodSchema) {
        const targetType = ["POST", "PUT", "PATCH"].includes(req.method)
          ? "body"
          : "query";

        schema = {
          [targetType]: schema,
        };
      }

      const validations: {
        key: "body" | "query" | "params" | "headers";
        source: any;
        schema?: ZodSchema<any>;
      }[] = [
        { key: "body", source: req.body ?? {}, schema: schema.body },
        { key: "query", source: req.query ?? {}, schema: schema.query },
        { key: "params", source: req.params ?? {}, schema: schema.params },
        { key: "headers", source: req.headers ?? {}, schema: schema.headers },
      ];

      for (const { key, source, schema } of validations) {
        if (!schema) continue;

        const result = schema.safeParse(source);

        if (!result.success) {
          throw new ValidationSchemeError(
            "Validation Error",
            schema,
            result.error.issues.map((issue) => {
              issue.path.unshift(key);

              return issue;
            }),
            {
              body: req.body ?? {},
              query: req.query ?? {},
              params: req.params ?? {},
              headers: req.headers,
            }
          );
        }

        Object.defineProperty(req, key, {
          value: result.data,
          writable: true,
          configurable: true,
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
