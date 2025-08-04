<p align="center">
<!-- <a href="https://.com" target="_blank"> -->

![GatEX](https://i.imgur.com/9yTRCQC.png "GatEX")

<!-- </a> -->
</p>

A declarative toolkit for routing and validation in Express, built with TypeScript and Decorators.

GatEX simplifies the creation of robust APIs by allowing the organization of routes into groups and the definition of complete RESTful endpoints using classes and decorators, with native integration with Zod for validation.

## Key Features

- **Route Grouping**: Organize your routes into nested groups with shared prefixes and middlewares.
- **Repositories with Decorators**: Define a complete RESTful API in a single class, declaratively.
- **Zod Integration**: Validate `body`, `query`, and `params` simply and directly.
- **Error Handling**: Detailed and out-of-the-box validation error responses, with support for custom handlers.
- **TypeScript-First**: Designed to offer the best development experience with type safety.

## Installation

GatEX requires peer dependencies. Install everything needed before using Gatex:

```bash
npm install express zod reflect-metadata gatex
```

Or using Yarn:

```bash
yarn add express zod reflect-metadata gatex
```

## Required Configuration

For decorators to work correctly, two configurations are **essential**.

### 1\. `tsconfig.json`

Your `tsconfig.json` file needs to have the following `compilerOptions` enabled:

```json
{
  "compilerOptions": {
    // ...
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### 2\. `reflect-metadata`

You **must** import `reflect-metadata` once, and only once, as the **very first line** of your application's entry file.

```typescript
// In your main file, e.g., server.ts or index.ts
import "reflect-metadata";

// The rest of your code comes after...
import express from "express";
```

---

## Quick Start

This is a complete example of a basic server using `Gatex`.

```typescript
// server.ts
import "reflect-metadata";
import express from "express";
import { GroupingProvider } from "gatex";

const app = express();
app.use(express.json()); // Middleware for JSON parsing

const provider = new GroupingProvider();

// Basic route
provider.get("/ping", (req, res) => {
  res.status(200).json({ message: "pong" });
});

// Applies the routes and error handlers to the Express app
provider.finish(app);

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
```

## Applying Middlewares

You can apply as many middlewares as you want to individual routes or entire groups.

```typescript
const authMiddleware = (req, res, next) => {
  console.log("Auth Middleware");
  // Authentication logic here...
  next();
};

// Middleware applied to a specific route
provider.get("/profile", authMiddleware, (req, res) => {
  res.send("User Profile");
});

// Middleware applied to a group of routes
provider.group("/api/v1", authMiddleware, (v1) => {
  // All routes within this group will go through the authMiddleware
  v1.get("/users", (req, res) => {
    res.send("Users list");
  });
  v1.get("/products", (req, res) => {
    res.send("Products list");
  });
});
```

## Repositories with Decorators

This is the main feature of Gatex. Define a complete RESTful API in a class/repository.

#### 1\. Create your Class as a GatEX Repository

```typescript
// UserRepository.ts
import { Request, Response } from "express";
import { z } from "zod";
import { IRepository, Schema, Middleware, PathName, IdParam } from "gatex";

const authMiddleware = (req, res, next) => {
  console.log("Auth Middleware running for a repository method!");
  next();
};

const userCreateSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
});

@PathName("users") // Sets the base path to /users
@IdParam("userId") // Sets the ID parameter name to :userId
export class UserRepository implements IRepository {
  // Mapped to: POST /users
  @Schema({ body: userCreateSchema })
  @Middleware(authMiddleware)
  create(req: Request, res: Response) {
    const newUser = req.body;
    res.status(201).json({ message: "User created", user: newUser });
  }

  // Mapped to: GET /users/:userId
  get(req: Request, res: Response) {
    const { userId } = req.params;
    res.json({ id: userId, name: "John Doe" });
  }
}
```

#### 2\. Register the Repository

```typescript
import { UserRepository } from "./UserRepository";

const provider = new GroupingProvider();
provider.repository(new UserRepository());
provider.finish(app);
```

#### 3\. Generated Routes

The code above will automatically generate and configure the following routes:

| Verb   | Route            | Repository Method | Middlewares                         |
| :----- | :--------------- | :---------------- | :---------------------------------- |
| `POST` | `/users`         | `create`          | `authMiddleware`, Schema Validation |
| `GET`  | `/users/:userId` | `get`             | -                                   |

#### 4\. Available Repository Methods

Your repository can implement any of the following methods.

| Method in Class | HTTP Verb | Generated Route          |
| :-------------- | :-------- | :----------------------- |
| `create`        | `POST`    | `/{pathName}`            |
| `list`          | `GET`     | `/{pathName}`            |
| `get`           | `GET`     | `/{pathName}/:{idParam}` |
| `update`        | `PUT`     | `/{pathName}/:{idParam}` |
| `patch`         | `PATCH`   | `/{pathName}/:{idParam}` |
| `delete`        | `DELETE`  | `/{pathName}/:{idParam}` |

_- You don't need to implement all of them._

## Validation and Error Handling

Gatex uses Zod for validation. If a schema fails, a detailed `400 Bad Request` error response is sent automatically.

**Example of a default error response:**

```json
{
  "error": true,
  "content": {
    "message": "Validation Error",
    "request": { "body": { "name": "Jo" } },
    "schemaIssues": [
      {
        "attribute": "body.name",
        "error": "String must contain at least 3 character(s)"
      }
    ]
  }
}
```

## Customizing Error Handling

You can easily override the default handler for validation errors and format the response as you wish.

```typescript
const provider = new GroupingProvider();

provider.schemeErrorHandler = (err, req, res, next) => {
  // 'err' is an instance of ValidationSchemeError
  res.status(400).json({
    message: "The submitted data is invalid.",
    errors: err.issues.map((issue) => ({
      field: issue.path.join("."),
      problem: issue.message,
    })),
  });
};

// ... register your routes and repositories
provider.finish(app);
```

<!-- ## API Reference

The complete API documentation, with all the details of classes, methods, and types, can be generated with TypeDoc.

```bash
npm run docs
```

After running the command, open the `docs/index.html` file in your browser. -->

## Tests

To run the integration test suite, use:

```bash
npm test
```

## Contributions

Contributions are welcome\! Feel free to open an issue or submit a pull request.

## License

[MIT]()
