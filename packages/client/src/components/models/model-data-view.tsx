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
import { Typography } from "@/components/ui/typography";
import { useModelRows } from "@/hooks/use-model-rows";
import { formatCellValue, rowKey } from "@/lib/studio";
import { useStudio } from "@/providers/studio-provider";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border px-3 py-2">
      <Typography variant="muted" className="text-xs">{label}</Typography>
      <Typography variant="large">{value}</Typography>
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
      <div className="rounded-lg border p-6">
        <Typography variant="muted">Loading schema...</Typography>
      </div>
    );
  }

  if (schemaError) {
    return (
      <div className="rounded-lg border p-6">
        <Typography variant="muted" className="text-destructive">{schemaError}</Typography>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="rounded-lg border p-6">
        <Typography variant="muted">Model not found.</Typography>
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
          <Typography variant="h3" as="h1">{model.tableName}</Typography>
          <Typography variant="muted">
            {data?.total ?? 0} total rows
          </Typography>
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
            placeholder="Search in table..."
          />

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column}>
                      <Typography variant="small" as="span" className="font-semibold">{column}</Typography>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <Typography variant="muted">Loading rows...</Typography>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <Typography variant="muted" className="text-destructive">{error}</Typography>
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <Typography variant="muted">No data found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={rowKey(row)}>
                      {columns.map((column) => (
                        <TableCell key={column}>
                          <Typography variant="small" as="span" className="font-normal">
                            {formatCellValue(row[column])}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border p-4">
            <Typography variant="large" className="mb-4">Model Details</Typography>
            <div className="space-y-3">
              {model.columns.map((column) => (
                <div key={column.name} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="space-y-0.5">
                    <Typography variant="small" className="font-semibold">{column.name}</Typography>
                    <Typography variant="muted" className="text-[10px] uppercase tracking-wider">{column.type}</Typography>
                  </div>
                  <div className="flex gap-1">
                    {column.isPrimary && (
                      <div className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary uppercase">PK</div>
                    )}
                    {column.nullable && (
                      <div className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">Null</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
