export { createStudioHandler } from "./core/handler";
export { startStudioServer } from "./core/server";

export { createTypeOrmProvider } from "./adapters/typeorm";
export { loadDataSource } from "./typeorm-loader";

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

export type { TypeOrmProviderConfig } from "./adapters/typeorm";
export type { LoadDataSourceOptions } from "./typeorm-loader";
export type { TypeOrmDataSourceLike } from "./adapters/typeorm";
