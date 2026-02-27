export interface ModelColumn {
  name: string;
  type: string;
  isPrimary?: boolean;
  nullable?: boolean;
}

export interface ModelRelation {
  field: string;
  references: string;
}

export interface StudioModel {
  name: string;
  tableName: string;
  columns: ModelColumn[];
  relations: ModelRelation[];
}

export type ModelRow = Record<string, unknown>;

export interface StudioSchema {
  models: StudioModel[];
}

export interface ListRowsResponse {
  rows: ModelRow[];
  total: number;
  limit: number;
  offset: number;
}
