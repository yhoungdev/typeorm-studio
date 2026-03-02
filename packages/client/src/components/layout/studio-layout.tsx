import { useMemo, useState } from "react";
import { Link, Outlet } from "@tanstack/react-router";
import { Database, Table2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { filterByTerm } from "@/lib/studio";
import { useStudio } from "@/providers/studio-provider";
import { cn } from "@/lib/utils";

export function StudioLayout() {
  const [query, setQuery] = useState("");
  const { models, isLoading, connected, error } = useStudio();

  const filteredModels = useMemo(
    () => filterByTerm(models, (model) => model.tableName, query),
    [models, query],
  );

  return (
    <div className="flex h-screen flex-col bg-background font-sans antialiased">
      <header className="flex h-12 shrink-0 items-center justify-between border-b bg-card px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
         
            <Typography variant="small" className="font-bold tracking-tight">
              TypeORM Studio
            </Typography>
          </div>
          <nav className="flex items-center">
            <Link
              to="/"
              className="flex h-12 items-center px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground border-b-2 border-primary" }}
              activeOptions={{ exact: false, includeSearch: false }}
            >
              Data
            </Link>
            <Link
              to="/visualize"
              className="flex h-12 items-center px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground border-b-2 border-primary" }}
            >
              Visualize
            </Link>
          </nav>
        </div>
        <div className="flex items-center">
  <div
    className={cn(
      "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-all",
      // isLoading && "border-amber-500/30 bg-amber-500/10 text-amber-600",
      // !isLoading && connected && "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
      // !isLoading && !connected && "border-destructive/30 bg-destructive/10 text-destructive"
    )}
  >
    <span
      className={cn(
        "h-2 w-2 rounded-full",
        isLoading && "animate-pulse bg-amber-500",
        !isLoading && connected && "bg-emerald-500",
        !isLoading && !connected && "bg-destructive"
      )}
    />
    {isLoading ? "Syncing" : connected ? "Live" : "Offline"}
  </div>
</div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-64 flex-col border-r bg-muted/20">
          <div className="p-3">
            <div className="relative">
              <Table2 className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter entities..."
                className="h-8 bg-background pl-8 text-xs focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2">
            {isLoading ? (
              <div className="space-y-1 p-1">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full rounded" />)}
              </div>
            ) : error ? (
              <div className="m-2 rounded border border-destructive/20 bg-destructive/5 p-2">
                <Typography variant="muted" className="text-[10px] text-destructive">{error}</Typography>
              </div>
            ) : (
              <div className="space-y-0.5">
                <Typography variant="muted" className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider">
                  Entities
                </Typography>
                {filteredModels.map((model) => (
                  <Link
                    key={model.tableName}
                    to="/models/$modelName"
                    params={{ modelName: model.tableName }}
                    className="flex items-center gap-2 rounded px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    activeProps={{ className: "bg-primary/10 text-primary font-medium" }}
                  >
                    <Table2 className="size-3.5 opacity-50" />
                    <span className="truncate">{model.tableName}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 overflow-auto bg-card/30">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
