import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import { Application } from "express";
import { createApp } from "../examples/app";
import TestAgent from "supertest/lib/agent";

describe("Gatex End-to-End Test Suite", () => {
  let app: Application;
  let request: TestAgent;

  beforeAll(() => {
    app = createApp();
    request = supertest(app);
  });

  describe("Feature: Basic Routing", () => {
    it("should handle a simple GET route correctly", async () => {
      const response = await request.get("/ping").expect(200);
      expect(response.body).toEqual({ message: "pong" });
    });
  });

  describe("Feature: Route Grouping", () => {
    it("should access a route inside a group", async () => {
      const response = await request.get("/v1/health").expect(200);
      expect(response.text).toBe("OK");
    });

    it("should access a route in a nested group", async () => {
      const response = await request.get("/v1/admin/dashboard").expect(200);
      expect(response.body).toEqual({ admin: true });
    });

    it("should apply middleware attached to a group", async () => {
      const response = await request.get("/v1/admin/dashboard").expect(200);
      expect(response.headers["x-group-middleware"]).toBe("activated");
    });
  });

  describe("Feature: Standalone Schema Validation", () => {
    it("should succeed with valid data for a non-repository route", async () => {
      const validUser = { username: "john_doe", password: "password123" };
      const response = await request
        .post("/register")
        .send(validUser)
        .expect(201);
      expect(response.body.message).toBe("User registered");
      expect(response.body.user).toEqual(validUser);
    });

    it("should fail with 400 for invalid data", async () => {
      const invalidUser = { username: "joe", password: "123" };
      const response = await request
        .post("/register")
        .send(invalidUser)
        .expect(400);
      expect(response.body.error).toBe(true);
      expect(response.body.content.message).toBe("Validation Error");
      expect(response.body.content.schemaIssues).toHaveLength(2);
      expect(response.body.content.schemaIssues[0].attribute).toBe(
        "body.username"
      );
    });
  });

  describe("Feature: Repository", () => {
    it("should create a product with valid data via repository", async () => {
      const response = await request
        .post("/products")
        .send({ name: "My Product" })
        .expect(201);
      expect(response.body).toEqual({
        message: "Product created!",
        name: "My Product",
      });
    });

    it("should fail to create a product with invalid data via repository", async () => {
      const response = await request
        .post("/products")
        .send({ name: "a" })
        .expect(400);
      expect(response.body.error).toBe(true);
      expect(response.body.content.schemaIssues[0].attribute).toBe("body.name");
    });
  });
});
