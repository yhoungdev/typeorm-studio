# @typeorm-studio/server

Reusable backend for TypeORM Studio, powered by a real TypeORM `DataSource`.

## Features

- Configurable API prefix and CORS
- Pluggable handler that can run standalone or mounted in host apps
- TypeORM provider that reads model shape from `DataSource.entityMetadatas`

## Run in this repository

Set your app's data-source module path and export name, then start server:

```bash
TYPEORM_DATA_SOURCE_PATH=../your-app/src/data-source.ts \
TYPEORM_DATA_SOURCE_EXPORT=AppDataSource \
bun run --cwd packages/server dev
```

Environment variables:

- `TYPEORM_DATA_SOURCE_PATH` (required): relative path to your data-source module
- `TYPEORM_DATA_SOURCE_EXPORT` (optional): export name, default `AppDataSource`
- `STUDIO_API_PREFIX` (optional): API prefix, default `/api`
- `STUDIO_DEFAULT_LIMIT` (optional): rows page size default, default `50`
- `STUDIO_MAX_LIMIT` (optional): max rows page size, default `200`

## Test in your application

1. Ensure your TypeORM app starts and can initialize `AppDataSource`.
2. From this repo, point studio server to your app data source:

```bash
TYPEORM_DATA_SOURCE_PATH=../your-app/src/data-source.ts \
TYPEORM_DATA_SOURCE_EXPORT=AppDataSource \
PORT=3000 bun run --cwd packages/server dev
```

3. Validate API connectivity and model metadata:

```bash
curl http://127.0.0.1:3000/api/health
curl http://127.0.0.1:3000/api/schema
curl http://127.0.0.1:3000/api/models/<table_name>/shape
curl "http://127.0.0.1:3000/api/models/<table_name>/rows?limit=20"
```

4. Run client against this backend:

```bash
bun run dev:app -- --ds ../your-app/src/data-source.ts --export AppDataSource
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

## How model shape is resolved

Model shape comes from TypeORM metadata:

- `dataSource.entityMetadatas[]` -> one entry per entity
- `metadata.columns[]` -> field names/types/nullability/primary key
- `metadata.relations[]` -> relation field + referenced table

This is normalized into `StudioModel` for the UI.
