import "reflect-metadata";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { TypeOrmDataSourceLike } from "./adapters/typeorm";

function isDataSourceLike(value: unknown): value is TypeOrmDataSourceLike {
  if (typeof value !== "object" || value == null) {
    return false;
  }

  const candidate = value as Partial<TypeOrmDataSourceLike>;
  return (
    typeof candidate.initialize === "function" &&
    Array.isArray(candidate.entityMetadatas) &&
    typeof candidate.isInitialized === "boolean"
  );
}

export interface LoadDataSourceOptions {
  modulePath: string;
  exportName: string;
}

export async function loadDataSource(
  options: LoadDataSourceOptions,
): Promise<TypeOrmDataSourceLike> {
  const absolutePath = resolve(process.cwd(), options.modulePath);
  let loadedModule: Record<string, unknown>;

  try {
    // Try CommonJS require first, as it's often more lenient with circular dependencies
    // especially for projects with "module": "commonjs" in tsconfig
    loadedModule = require(absolutePath);
  } catch (e) {
    // Fallback to ESM import
    const moduleUrl = pathToFileURL(absolutePath).href;
    loadedModule = (await import(moduleUrl)) as Record<string, unknown>;
  }

  const exported = loadedModule[options.exportName];
  if (!isDataSourceLike(exported)) {
    throw new Error(
      `Export '${options.exportName}' from '${options.modulePath}' is not a valid TypeORM DataSource.`,
    );
  }

  return exported;
}
