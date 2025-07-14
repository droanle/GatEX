# GatEX - Powerful Express Routing Toolkit

GatEX is a declarative routing toolkit for Express.js that simplifies route management, validation, and middleware organization with TypeScript decorators.

## Features

- 🏗️ Structured route grouping with middleware support
- 🔍 Automatic RESTful route generation from repositories
- ✅ Zod schema validation with decorators
- 🧩 Flexible middleware organization
- 🛠️ TypeScript-first design with decorator support

## Installation

```bash
npm install gatex express reflect-metadata zod
# or
yarn add gatex express reflect-metadata zod
```

## Peer Dependencies

GatEX requires:

- Express (^4.17.0 or ^5.0.0)
- reflect-metadata (^0.2.2)
- Zod (^3.0.0)

## Basic Usage

### 1. Create a Repository

```typescript
import { Request, Response } from "express";
import { z } from "zod";
import { IRepository, Schema, Middleware, PathName } from "gatex";

const userSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
});

@PathName("users")
export class UserRepository implements IRepository {
  @Schema(userSchema)
  create(req: Request, res: Response) {
    const { name, email } = req.body;
    res.json({ message: "User created", name, email });
  }

  list(req: Request, res: Response) {
    res.json([{ id: 1, name: "John Doe" }]);
  }
}
```

### 2. Set Up Your Express App

```typescript
import express from "express";
import bodyParser from "body-parser";
import { GroupingProvider } from "gatex";
import { UserRepository } from "./UserRepository";

const app = express();
app.use(bodyParser.json());

const provider = new GroupingProvider();
provider.repository(new UserRepository());
provider.finish(app);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

## Decorators

### `@PathName(path: string)`

Sets the base path for all routes in the repository.

### `@IdParam(paramName: string)`

Customizes the ID parameter name in routes (default: 'id').

### `@Schema(schema: RequestSchemaType)`

Attaches Zod validation to a method.

### `@Middleware(...middlewares: RequestHandler[])`

Adds Express middleware(s) to a method.

## Grouping Routes

```typescript
const provider = new GroupingProvider();

provider.group("/api", (api) => {
  api.group("/v1", (v1) => {
    v1.repository(new UserRepository());

    v1.get("/health", (req, res) => {
      res.json({ status: "OK" });
    });
  });
});

provider.finish(app);
```

## Validation Error Handling

GatEX automatically handles validation errors with detailed error responses:

```json
{
  "error": true,
  "content": {
    "message": "Validation Error",
    "request": {
      "body": { "name": "Jo", "email": "invalid" },
      "query": {},
      "params": {},
      "headers": {}
    },
    "schemaIssues": [
      {
        "attribute": "body.name",
        "error": "String must contain at least 3 character(s)"
      },
      {
        "attribute": "body.email",
        "error": "Invalid email"
      }
    ]
  }
}
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT
