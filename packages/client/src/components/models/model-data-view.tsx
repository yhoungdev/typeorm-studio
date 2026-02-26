import { useMemo, useState } from "react"
import { useParams } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { filterRows, getModelByTable, getRowsByTable } from "@/lib/studio"

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}

export function ModelDataView() {
  const { modelName } = useParams({ from: "/models/$modelName" })
  const [search, setSearch] = useState("")

  const model = getModelByTable(modelName)

  if (!model) {
    return <div className="rounded-lg border p-6 text-sm text-muted-foreground">Model not found.</div>
  }

  const rows = getRowsByTable(model.tableName)
  const columns = model.columns.map((column) => column.name)
  const nullableCount = model.columns.filter((column) => column.nullable).length

  const filtered = useMemo(() => filterRows(rows, search), [rows, search])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">{model.tableName}</h1>
          <p className="text-sm text-muted-foreground">{rows.length} total rows</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Refresh</Button>
          <Button>New row</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Rows" value={rows.length} />
        <StatCard label="Columns" value={model.columns.length} />
        <StatCard label="Nullable" value={nullableCount} />
        <StatCard label="Filtered" value={filtered.length} />
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        <section className="space-y-3">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search in rows"
          />

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column}>{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row, index) => (
                  <TableRow key={String(row.id ?? `${model.tableName}-${index}`)}>
                    {columns.map((column) => (
                      <TableCell key={`${index}-${column}`}>{String(row[column] ?? "-")}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="rounded-lg border p-3">
          <h2 className="mb-3 text-sm font-semibold">Schema</h2>
          <div className="space-y-2">
            {model.columns.map((column) => (
              <div
                key={column.name}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-medium">{column.name}</div>
                  <div className="text-xs text-muted-foreground">{column.type}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {column.nullable ? "nullable" : "required"}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
