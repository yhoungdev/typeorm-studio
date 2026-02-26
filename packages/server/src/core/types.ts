export interface StudioColumn {
  name: string;
  type: string;
  isPrimary?: boolean;
  nullable?: boolean;
}

export interface StudioRelation {
  field: string;
  references: string;
}

export interface StudioModel {
  name: string;
  tableName: string;
  columns: StudioColumn[];
  relations: StudioRelation[];
}

export type StudioRow = Record<string, unknown>;

export interface StudioSchema {
  models: StudioModel[];
}

export interface ListRowsOptions {
  limit?: number;
  offset?: number;
  search?: string;
}

export interface ListRowsResult {
  rows: StudioRow[];
  total: number;
  limit: number;
  offset: number;
}

export interface StudioProvider {
  getSchema(): Promise<StudioSchema>;
  getModelShape(tableName: string): Promise<StudioModel>;
  listRows(tableName: string, options: ListRowsOptions): Promise<ListRowsResult>;
}
