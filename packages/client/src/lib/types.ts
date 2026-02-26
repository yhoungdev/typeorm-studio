export type ColumnType =
  | 'uuid'
  | 'varchar'
  | 'text'
  | 'boolean'
  | 'int'
  | 'decimal'
  | 'timestamp'

export interface ModelColumn {
  name: string
  type: ColumnType
  isPrimary?: boolean
  nullable?: boolean
}

export interface ModelRelation {
  field: string
  references: string
}

export interface StudioModel {
  name: string
  tableName: string
  columns: ModelColumn[]
  relations: ModelRelation[]
}

export type ModelRow = Record<string, string | number | boolean | null>

export interface StudioDataset {
  models: StudioModel[]
  rows: Record<string, ModelRow[]>
}
