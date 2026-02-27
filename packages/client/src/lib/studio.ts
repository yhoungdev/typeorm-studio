import type { ModelRow } from "@/lib/types";

export function filterByTerm<T>(
  items: T[],
  getText: (item: T) => string,
  query: string,
): T[] {
  const term = query.trim().toLowerCase();
  if (!term) {
    return items;
  }

  return items.filter((item) => getText(item).toLowerCase().includes(term));
}

export function relationTargetModel(reference: string): string {
  return reference.split(".")[0] ?? "";
}

export function formatCellValue(value: unknown): string {
  if (value == null) {
    return "-";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function rowKey(row: ModelRow, fallback: string): string {
  const id = row.id;
  if (typeof id === "string" || typeof id === "number") {
    return String(id);
  }

  return fallback;
}
