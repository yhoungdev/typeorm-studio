import type { ListRowsResponse, StudioSchema } from "@/lib/types"

interface StudioApiClientOptions {
  baseUrl?: string
}

interface FetchRowsParams {
  tableName: string
  limit?: number
  offset?: number
  search?: string
}

interface ApiErrorBody {
  error?: string
}

function normalizeBaseUrl(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody
    if (typeof body.error === "string" && body.error.length > 0) {
      return body.error
    }
  } catch {
    // Keep fallback message when response body is not JSON.
  }

  return `Request failed with status ${response.status}`
}

export class StudioApiClient {
  private readonly baseUrl: string

  constructor(options: StudioApiClientOptions = {}) {
    this.baseUrl = normalizeBaseUrl(options.baseUrl ?? import.meta.env.VITE_STUDIO_API_BASE ?? "/api")
  }

  private async getJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, init)

    if (!response.ok) {
      throw new Error(await parseApiError(response))
    }

    return (await response.json()) as T
  }

  getSchema(): Promise<StudioSchema> {
    return this.getJson<StudioSchema>("/schema")
  }

  getHealth(): Promise<{ ok: boolean; status: string }> {
    return this.getJson<{ ok: boolean; status: string }>("/health")
  }

  getModelRows(params: FetchRowsParams): Promise<ListRowsResponse> {
    const query = new URLSearchParams()
    if (params.limit != null) {
      query.set("limit", String(params.limit))
    }
    if (params.offset != null) {
      query.set("offset", String(params.offset))
    }
    if (params.search) {
      query.set("search", params.search)
    }

    const suffix = query.size > 0 ? `?${query.toString()}` : ""

    return this.getJson<ListRowsResponse>(
      `/models/${encodeURIComponent(params.tableName)}/rows${suffix}`,
    )
  }
}

export const studioApiClient = new StudioApiClient()
