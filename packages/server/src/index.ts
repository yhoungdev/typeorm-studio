import "reflect-metadata";
import { createTypeOrmProvider, startStudioServer } from "./studio";
import { loadDataSource } from "./typeorm-loader";

const port = Number(process.env.PORT ?? 3000);
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

const dataSourcePath = process.env.TYPEORM_DATA_SOURCE_PATH;
const dataSourceExportName =
  process.env.TYPEORM_DATA_SOURCE_EXPORT ?? "AppDataSource";

if (!dataSourcePath) {
  throw new Error(
    "Missing TYPEORM_DATA_SOURCE_PATH. Example: TYPEORM_DATA_SOURCE_PATH=../app/src/data-source.ts",
  );
}

const dataSource = await loadDataSource({
  modulePath: dataSourcePath,
  exportName: dataSourceExportName,
});

if (!dataSource.isInitialized) {
  console.log("[Studio] Initializing DataSource...");
  await dataSource.initialize();
}

console.log(`[Studio] DataSource initialized. Entities found: ${dataSource.entityMetadatas.length}`);
dataSource.entityMetadatas.forEach(meta => {
  console.log(` - Model: ${meta.name} (Table: ${meta.tableName})`);
});

const server = startStudioServer({
  port,
  provider: createTypeOrmProvider({
    dataSource,
    defaultLimit: Number(process.env.STUDIO_DEFAULT_LIMIT ?? 50),
    maxLimit: Number(process.env.STUDIO_MAX_LIMIT ?? 200),
  }),
  apiPrefix: process.env.STUDIO_API_PREFIX ?? "/api",
  proxy: {
    enabled: true,
    origin: clientOrigin,
  },
});

console.log(`Server listening on http://localhost:${server.port}`);
console.log(`Proxying client from ${clientOrigin}`);
console.log(`Using DataSource: ${dataSourcePath}#${dataSourceExportName}`);
