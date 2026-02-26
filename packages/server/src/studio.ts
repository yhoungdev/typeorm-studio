export { createStudioHandler } from "./core/handler";
export { startStudioServer } from "./core/server";

export { createInMemoryProvider } from "./adapters/in-memory";
export { createTypeOrmProvider } from "./adapters/typeorm";

export type {
  StudioColumn,
  StudioModel,
  StudioProvider,
  StudioRelation,
  StudioRow,
  StudioSchema,
  ListRowsOptions,
  ListRowsResult,
} from "./core/types";

export type {
  CorsConfig,
  ProxyConfig,
  StudioApiConfig,
  ResolvedStudioApiConfig,
} from "./core/config";

export type { InMemoryDataset } from "./adapters/in-memory";
export type { TypeOrmProviderConfig } from "./adapters/typeorm";
