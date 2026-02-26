# @typeorm-studio/server

Reusable backend for TypeORM Studio.

## Features

- Configurable API prefix and CORS
- Pluggable provider interface
- Built-in providers:
  - `createInMemoryProvider` for demos/tests
  - `createTypeOrmProvider` for live TypeORM data
- Can run standalone (`startStudioServer`) or mounted in existing apps (`createStudioHandler`)

## Quick start (standalone)

```ts
import { createTypeOrmProvider, startStudioServer } from "@typeorm-studio/server";
import { AppDataSource } from "./data-source";

const server = startStudioServer({
  port: 3000,
  apiPrefix: "/api/studio",
  provider: createTypeOrmProvider({
    dataSource: AppDataSource,
    defaultLimit: 50,
    maxLimit: 200,
  }),
});

console.log(`Studio API on http://localhost:${server.port}/api/studio`);
```

## Mount in host application

```ts
import { createStudioHandler, createTypeOrmProvider } from "@typeorm-studio/server";
import { AppDataSource } from "./data-source";

const studioHandler = createStudioHandler({
  apiPrefix: "/studio-api",
  provider: createTypeOrmProvider({ dataSource: AppDataSource }),
});

// Example with a fetch-based router/runtime:
// app.all("/*", (req) => studioHandler(req));
```

## API routes

- `GET /<prefix>`: API info
- `GET /<prefix>/health`: health check
- `GET /<prefix>/schema`: models metadata
- `GET /<prefix>/models`: alias of `/schema`
- `GET /<prefix>/models/:table/rows?limit=50&offset=0&search=term`: paginated rows
