import type { ModelRow, StudioModel } from "@/lib/types"

import { studioDataset } from "@/data/studio-dataset"

export const models = studioDataset.models

export function getModelByTable(tableName: string): StudioModel | undefined {
  return models.find((model) => model.tableName === tableName)
}

export function getRowsByTable(tableName: string): ModelRow[] {
  return studioDataset.rows[tableName] ?? []
}

export function filterByTerm<T>(items: T[], getText: (item: T) => string, query: string): T[] {
  const term = query.trim().toLowerCase()
  if (!term) {
    return items
  }
  return items.filter((item) => getText(item).toLowerCase().includes(term))
}

export function filterRows(rows: ModelRow[], query: string): ModelRow[] {
  const term = query.trim().toLowerCase()
  if (!term) {
    return rows
  }

  return rows.filter((row) =>
    Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(term)),
  )
}

export function relationTargetModel(reference: string): string {
  return reference.split(".")[0] ?? ""
}
