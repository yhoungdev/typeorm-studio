import { useState } from "react";
import { useParams } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useModelRows } from "@/hooks/use-model-rows";
import { formatCellValue, rowKey } from "@/lib/studio";
import { useStudio } from "@/providers/studio-provider";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

export function ModelDataView() {
  const { modelName } = useParams({ from: "/models/$modelName" });
  const [search, setSearch] = useState("");

  const { models, isLoading: schemaLoading, error: schemaError } = useStudio();
  const model = models.find((item) => item.tableName === modelName);

  const { data, isLoading, error, refresh } = useModelRows({
    tableName: modelName,
    search,
    limit: 100,
  });

  if (schemaLoading) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        Loading schema...
      </div>
    );
  }

  if (schemaError) {
    return (
      <div className="rounded-lg border p-6 text-sm text-destructive">
        {schemaError}
      </div>
    );
  }

  if (!model) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        Model not found.
      </div>
    );
  }

  const rows = data?.rows ?? [];
  const columns = model.columns.map((column) => column.name);
  const nullableCount = model.columns.filter(
    (column) => column.nullable,
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">{model.tableName}</h1>
          <p className="text-sm text-muted-foreground">
            {data?.total ?? 0} total rows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void refresh()}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Rows" value={data?.total ?? 0} />
        <StatCard label="Columns" value={model.columns.length} />
        <StatCard label="Nullable" value={nullableCount} />
        <StatCard label="Fetched" value={rows.length} />
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
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length || 1}
                      className="text-center text-sm text-muted-foreground"
                    >
                      Loading rows...
                    </TableCell>
                  </TableRow>
                ) : null}

                {!isLoading && error ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length || 1}
                      className="text-center text-sm text-destructive"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                ) : null}

                {!isLoading && !error && rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length || 1}
                      className="text-center text-sm text-muted-foreground"
                    >
                      No rows found.
                    </TableCell>
                  </TableRow>
                ) : null}

                {!isLoading && !error
                  ? rows.map((row, index) => (
                      <TableRow
                        key={rowKey(row, `${model.tableName}-${index}`)}
                      >
                        {columns.map((column) => (
                          <TableCell key={`${index}-${column}`}>
                            {formatCellValue(row[column])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : null}
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
                  <div className="text-xs text-muted-foreground">
                    {column.type}
                  </div>
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
  );
}
