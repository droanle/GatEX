import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import { Application } from "express";
import { createApp } from "../examples/app";
import TestAgent from "supertest/lib/agent";

// `describe` agrupa uma suíte de testes relacionados
describe("GatEX Repository Integration Tests", () => {
  let app: Application;
  let request: TestAgent;

  // `beforeAll` é executado uma vez antes de todos os testes neste arquivo
  beforeAll(() => {
    // Criamos uma instância do nosso app para ser usada nos testes
    app = createApp();
    // O supertest "envolve" nosso app para podermos fazer requisições
    request = supertest(app);
  });

  // Testes para o endpoint POST /entities
  describe("POST /entities", () => {
    // `it` define um caso de teste individual
    it("should create a user with valid data and run middlewares", async () => {
      const userData = {
        name: "Leandro",
        email: "leandro@teste.com",
      };

      // Faz a requisição POST para /entities
      const response = await request
        .post("/entities")
        .send(userData)
        .expect(200); // Espera que o status da resposta seja 200

      // `expect` verifica se o corpo da resposta está correto
      expect(response.body).toEqual({
        message: "Usuário criado",
        name: "Leandro",
        email: "leandro@teste.com",
      });

      // Para verificar os middlewares, você pode checar o console onde os testes rodam.
      // Uma forma melhor seria o middleware adicionar um header ou propriedade
      // que pudéssemos verificar na resposta.
    });

    it("should return 400 if validation fails (invalid email)", async () => {
      const invalidUserData = {
        name: "Teste",
        email: "email-invalido",
      };

      const response = await request
        .post("/entities")
        .send(invalidUserData)
        .expect(400); // Espera um erro de "Bad Request"

      // Verifica se a resposta de erro contém a estrutura esperada
      expect(response.body.error).toBe(true);
      expect(response.body.content.message).toBe("Validation Error");
      expect(response.body.content.schemaIssues[0].attribute).toBe(
        "body.email"
      );
      expect(response.body.content.schemaIssues[0].error).toBe("Invalid email");
    });

    it("should return 400 if validation fails (name too short)", async () => {
      const invalidUserData = {
        name: "Li",
        email: "teste@email.com",
      };

      const response = await request
        .post("/entities")
        .send(invalidUserData)
        .expect(400);

      expect(response.body.content.schemaIssues[0].attribute).toBe("body.name");
      expect(response.body.content.schemaIssues[0].error).toContain(
        "String must contain at least 3 character(s)"
      );
    });
  });

  // Testes para o endpoint GET /entities/:entityId
  describe("GET /entities/:entityId", () => {
    it("should return a user by id", async () => {
      const entityId = "123";
      const response = await request.get(`/entities/${entityId}`).expect(200);

      // Verifica se a resposta corresponde ao que o TestRepository.get retorna
      expect(response.body).toEqual([{ id: "123", name: "Leandro" }]);
    });
  });
});
