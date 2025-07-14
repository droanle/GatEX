import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { IRepository } from "../src/IRepository";
import { Schema, Middleware, IdParam, PathName } from "../src/decorators";

function Middleware1(req: Request, res: Response, next: NextFunction) {
  console.log("Middleware1");

  next();
}

function Middleware2(req: Request, res: Response, next: NextFunction) {
  console.log("Middleware2");

  next();
}

const createEntitySchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
});

@PathName("entities")
@IdParam("entityId")
export class TestRepository implements IRepository {
  @Schema(createEntitySchema)
  @Middleware(Middleware1, Middleware2)
  create(req: Request, res: Response) {
    const { name, email } = req.body;
    res.json({ message: "Usuário criado", name, email });
  }

  get(req: Request, res: Response) {
    res.json([{ id: req.params.entityId, name: "Leandro" }]);
  }
}
