import type {
  ListRowsOptions,
  ListRowsResult,
  StudioProvider,
  StudioRow,
  StudioSchema,
} from "../core/types";

export interface InMemoryDataset {
  schema: StudioSchema;
  rows: Record<string, StudioRow[]>;
}

function matchesSearch(row: StudioRow, search: string): boolean {
  const term = search.trim().toLowerCase();
  if (!term) {
    return true;
  }

  return Object.values(row).some((value) =>
    String(value ?? "").toLowerCase().includes(term),
  );
}

export function createInMemoryProvider(dataset: InMemoryDataset): StudioProvider {
  return {
    async getSchema(): Promise<StudioSchema> {
      return dataset.schema;
    },

    async listRows(tableName: string, options: ListRowsOptions): Promise<ListRowsResult> {
      const source = dataset.rows[tableName] ?? [];
      const filtered = source.filter((row) => matchesSearch(row, options.search ?? ""));

      const limit = options.limit ?? 50;
      const offset = options.offset ?? 0;
      const rows = filtered.slice(offset, offset + limit);

      return {
        rows,
        total: filtered.length,
        limit,
        offset,
      };
    },
  };
}
