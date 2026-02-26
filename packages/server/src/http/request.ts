import { HttpError } from "./errors";

export function removePrefix(pathname: string, prefix: string): string | null {
  if (!pathname.startsWith(prefix)) {
    return null;
  }

  const value = pathname.slice(prefix.length);
  if (value === "") {
    return "/";
  }

  return value.startsWith("/") ? value : `/${value}`;
}

export function parsePositiveInt(
  value: string | null,
  fallback: number,
  fieldName: string,
): number {
  if (value == null || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new HttpError(400, `Invalid ${fieldName}. Expected a positive integer.`);
  }

  return parsed;
}

export function getTableName(pathname: string): string {
  const match = pathname.match(/^\/models\/([^/]+)\/rows\/?$/);
  if (!match?.[1]) {
    throw new HttpError(404, "Route not found");
  }

  return decodeURIComponent(match[1]);
}
