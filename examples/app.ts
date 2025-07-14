import express, { Application } from "express";
import bodyParser from "body-parser";
import GroupingProvider from "../src/GroupingProvider";
import { TestRepository } from "./TestRepository";

export function createApp(): Application {
  const app: Application = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  const provider = new GroupingProvider();

  // Registra o repositório para criar as rotas /entities
  provider.repository(new TestRepository());

  // Finaliza a configuração do GatEX no app
  provider.finish(app);

  return app;
}
