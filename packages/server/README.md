# @typeorm-studio/server

Reusable backend for TypeORM Studio, powered by a real TypeORM `DataSource`.

## Features

- Configurable API prefix and CORS
- Pluggable handler that can run standalone or mounted in host apps
- TypeORM provider that reads model shape from `DataSource.entityMetadatas`

## Run in this repository

Use `.env` for datasource configuration.

1. Copy template:

```bash
cp packages/server/.env.example .env
```

2. Start server:

```bash
bun run --cwd packages/server dev
```

## Test in your application

1. Ensure your TypeORM app can initialize `AppDataSource` with env vars.
2. Start studio with `.env` configured:

```bash
bun run dev
```

3. Validate API connectivity and model metadata:

```bash
curl http://127.0.0.1:3000/api/health
curl http://127.0.0.1:3000/api/schema
curl http://127.0.0.1:3000/api/models/<table_name>/shape
curl "http://127.0.0.1:3000/api/models/<table_name>/rows?limit=20"
```

## Mount in host app

```ts
import {
  createStudioHandler,
  createTypeOrmProvider,
} from "@typeorm-studio/server";
import { AppDataSource } from "./data-source";

const studioHandler = createStudioHandler({
  apiPrefix: "/studio-api",
  provider: createTypeOrmProvider({ dataSource: AppDataSource }),
});
```

## API routes

- `GET /<prefix>`: API info
- `GET /<prefix>/health`: health check
- `GET /<prefix>/schema`: all model shapes
- `GET /<prefix>/models`: alias of `/schema`
- `GET /<prefix>/models/:table/shape`: one model shape
- `GET /<prefix>/models/:table/rows?limit=50&offset=0&search=term`: paginated rows
