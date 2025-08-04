import "reflect-metadata";
import express, { Application, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { GroupingProvider, IRepository, PathName, Schema } from "../src";

function testMiddleware(req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Group-Middleware", "activated");
  next();
}

const createProductSchema = z.object({ name: z.string().min(3) });

@PathName("products")
class ProductRepository implements IRepository {
  @Schema({ body: createProductSchema })
  create(req: Request, res: Response) {
    res.status(201).json({ message: "Product created!", ...req.body });
  }
}

export function createApp(): Application {
  const app: Application = express();
  app.use(express.json());

  const provider = new GroupingProvider();

  provider.get("/ping", (req: Request, res: Response) => {
    res.status(200).json({ message: "pong" });
  });

  provider.group("v1", (v1) => {
    v1.get("/health", (req, res) => res.status(200).send("OK"));

    v1.group("admin", testMiddleware, (admin) => {
      admin.get("/dashboard", (req, res) => res.json({ admin: true }));
    });
  });

  const userRegisterSchema = z.object({
    username: z.string().min(4),
    password: z.string().min(6),
  });
  provider.post("/register", { body: userRegisterSchema }, (req, res) => {
    res.status(201).json({ message: "User registered", user: req.body });
  });

  provider.repository(new ProductRepository());

  provider.finish(app);

  return app;
}
