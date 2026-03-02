import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { RefreshCw, Search, Hash, LayoutGrid, Database } from "lucide-react";
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

  if (schemaLoading) return <div className="flex h-64 items-center justify-center"><RefreshCw className="size-5 animate-spin text-muted-foreground" /></div>;
  if (schemaError) return <div className="p-8 text-center"><Typography variant="muted" className="text-destructive">{schemaError}</Typography></div>;
  if (!model) return <div className="p-8 text-center"><Typography variant="muted">Entity not found.</Typography></div>;

  const rows = data?.rows ?? [];
  const columns = model.columns.map((c) => c.name);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b bg-card/50 px-6 py-3">
        <div className="flex items-center gap-4">
          <Typography variant="h4" className="font-bold tracking-tight">{model.tableName}</Typography>
          <div className="h-4 w-px bg-border" />
          <Typography variant="muted" className="text-xs font-medium uppercase tracking-widest">{data?.total ?? 0} Records</Typography>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="h-8 w-64 bg-background pl-8 text-xs focus-visible:ring-1 focus-visible:ring-primary/30"
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-semibold" onClick={() => void refresh()}>
            <RefreshCw className={cn("size-3", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-px bg-border xl:grid-cols-[1fr_300px]">
        <div className="bg-background">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  {model.columns.map((col) => (
                    <TableHead key={col.name} className="h-10 border-r py-0 last:border-r-0">
                      <div className="flex items-center gap-1.5">
                        {col.isPrimary && <Hash className="size-2.5 text-primary" />}
                        <span className="text-[10px] font-bold uppercase tracking-wider">{col.name}</span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={columns.length} className="h-32 text-center text-xs text-muted-foreground">Loading records...</TableCell></TableRow>
                ) : rows.length === 0 ? (
                  <TableRow><TableCell colSpan={columns.length} className="h-32 text-center text-xs text-muted-foreground">No records found.</TableCell></TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={rowKey(row)} className="hover:bg-muted/20">
                      {columns.map((col) => (
                        <TableCell key={col} className="border-r py-2 last:border-r-0">
                          <span className="truncate text-xs font-medium text-foreground/80">{formatCellValue(row[col])}</span>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <aside className="border-l bg-muted/5 p-6">
          <div className="mb-6 flex items-center gap-2 text-muted-foreground">
            <LayoutGrid className="size-4" />
            <Typography variant="small" className="font-bold uppercase tracking-wider">Definition</Typography>
          </div>
          <div className="space-y-3">
            {model.columns.map((col) => (
              <div key={col.name} className="flex items-start justify-between border-b border-border/50 pb-2 last:border-0">
                <div className="space-y-0.5">
                  <Typography variant="small" className="font-bold text-foreground/90">{col.name}</Typography>
                  <Typography variant="muted" className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground/60">{col.type}</Typography>
                </div>
                <div className="flex gap-1">
                  {col.isPrimary && <div className="rounded  px-1 py-0.5 text-[8px] font-black ">PK</div>}
                  {col.nullable && <div className="rounded bg-muted px-1 py-0.5 text-[8px] font-black text-muted-foreground">NULL</div>}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
