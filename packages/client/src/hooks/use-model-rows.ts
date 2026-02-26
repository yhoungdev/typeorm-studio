import { useCallback, useEffect, useState } from "react"

import { studioApiClient } from "@/lib/studio-api"
import type { ListRowsResponse } from "@/lib/types"

interface UseModelRowsOptions {
  tableName: string
  search: string
  limit?: number
}

interface UseModelRowsResult {
  data: ListRowsResponse | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useModelRows(options: UseModelRowsOptions): UseModelRowsResult {
  const [data, setData] = useState<ListRowsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const payload = await studioApiClient.getModelRows({
        tableName: options.tableName,
        search: options.search,
        limit: options.limit ?? 100,
        offset: 0,
      })
      setData(payload)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load rows"
      setError(message)
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [options.tableName, options.search, options.limit])

  useEffect(() => {
    void load()
  }, [load])

  return {
    data,
    isLoading,
    error,
    refresh: load,
  }
}
