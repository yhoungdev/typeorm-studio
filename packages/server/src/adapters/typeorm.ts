import type {
  ListRowsOptions,
  ListRowsResult,
  StudioColumn,
  StudioModel,
  StudioProvider,
  StudioRelation,
  StudioSchema,
} from "../core/types";
import { HttpError } from "../http/errors";

interface EntityMetadataLike {
  name: string;
  tableName: string;
  columns: Array<{
    propertyName: string;
    type: string | Function;
    isPrimary: boolean;
    isNullable: boolean;
  }>;
  relations: Array<{
    propertyName: string;
    inverseEntityMetadata?: {
      tableName: string;
    };
    inverseEntityMetadataName?: string;
  }>;
}

interface RepositoryLike {
  count(options?: { where?: Array<Record<string, unknown>> }): Promise<number>;
  find(options: {
    take: number;
    skip: number;
    where?: Array<Record<string, unknown>>;
    order?: Record<string, "ASC" | "DESC">;
  }): Promise<Record<string, unknown>[]>;
}

export interface TypeOrmDataSourceLike {
  isInitialized: boolean;
  initialize(): Promise<void>;
  entityMetadatas: EntityMetadataLike[];
  getRepository(target: string): RepositoryLike;
}

export interface TypeOrmProviderConfig {
  dataSource: TypeOrmDataSourceLike;
  defaultLimit?: number;
  maxLimit?: number;
}

function toColumnType(rawType: string | Function): string {
  if (typeof rawType === "string") {
    return rawType;
  }
  return rawType.name.toLowerCase();
}

function normalizeModel(meta: EntityMetadataLike): StudioModel {
  const columns: StudioColumn[] = meta.columns.map((column) => ({
    name: column.propertyName,
    type: toColumnType(column.type),
    isPrimary: column.isPrimary,
    nullable: column.isNullable,
  }));

  const relations: StudioRelation[] = meta.relations
    .filter((relation) => relation.inverseEntityMetadata?.tableName)
    .map((relation) => ({
      field: relation.propertyName,
      references: `${relation.inverseEntityMetadata?.tableName}.id`,
    }));

  return {
    name: meta.name,
    tableName: meta.tableName,
    columns,
    relations,
  };
}

function resolveLimit(limit: number | undefined, defaultLimit: number, maxLimit: number): number {
  const requested = limit ?? defaultLimit;
  if (requested <= 0) {
    throw new HttpError(400, "limit must be greater than 0");
  }
  return Math.min(requested, maxLimit);
}

export function createTypeOrmProvider(config: TypeOrmProviderConfig): StudioProvider {
  const defaultLimit = config.defaultLimit ?? 50;
  const maxLimit = config.maxLimit ?? 200;
  let typeormOps: { ILike?: (value: string) => unknown; Like?: (value: string) => unknown } | null =
    null;
  let typeormOpsResolved = false;

  async function ensureDataSource() {
    if (!config.dataSource.isInitialized) {
      await config.dataSource.initialize();
    }
  }

  function getMetadata(tableName: string): EntityMetadataLike {
    const metadata = config.dataSource.entityMetadatas.find(
      (item) => item.tableName === tableName,
    );

    if (!metadata) {
      throw new HttpError(404, `Model for table '${tableName}' not found`);
    }

    return metadata;
  }

  async function getLikeValue(value: string): Promise<unknown> {
    if (!typeormOpsResolved) {
      typeormOpsResolved = true;
      try {
        const moduleName = ["type", "orm"].join("");
        const module = await import(moduleName);
        typeormOps = {
          ILike: "ILike" in module ? module.ILike : undefined,
          Like: "Like" in module ? module.Like : undefined,
        };
      } catch {
        typeormOps = null;
      }
    }

    if (typeormOps?.ILike) {
      return typeormOps.ILike(value);
    }
    if (typeormOps?.Like) {
      return typeormOps.Like(value);
    }

    return value;
  }

  async function buildSearchWhere(
    metadata: EntityMetadataLike,
    search: string,
  ): Promise<Array<Record<string, unknown>> | undefined> {
    const term = search.trim();
    if (!term) {
      return undefined;
    }

    const textColumns = metadata.columns
      .filter((column) => {
        const type = toColumnType(column.type);
        return ["varchar", "text", "char", "nvarchar"].includes(type);
      })
      .map((column) => column.propertyName);

    if (textColumns.length === 0) {
      return undefined;
    }

    const likeValue = await getLikeValue(`%${term}%`);
    return textColumns.map((columnName) => ({
      [columnName]: likeValue,
    }));
  }

  return {
    async getSchema(): Promise<StudioSchema> {
      await ensureDataSource();

      return {
        models: config.dataSource.entityMetadatas.map(normalizeModel),
      };
    },
    async getModelShape(tableName: string): Promise<StudioModel> {
      await ensureDataSource();
      return normalizeModel(getMetadata(tableName));
    },

    async listRows(tableName: string, options: ListRowsOptions): Promise<ListRowsResult> {
      await ensureDataSource();
      const metadata = getMetadata(tableName);
      const repository = config.dataSource.getRepository(metadata.name);

      const limit = resolveLimit(options.limit, defaultLimit, maxLimit);
      const offset = options.offset ?? 0;
      const where = await buildSearchWhere(metadata, options.search ?? "");

      const [total, rows] = await Promise.all([
        repository.count({ where }),
        repository.find({
          take: limit,
          skip: offset,
          where,
          order: { [metadata.columns[0]?.propertyName ?? "id"]: "DESC" },
        }),
      ]);

      return {
        rows,
        total,
        limit,
        offset,
      };
    },
  };
}
