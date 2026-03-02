import { useMemo, useState } from "react";
import { Link, Outlet } from "@tanstack/react-router";
import {
  CircleAlert,
  CircleCheckBig,
  Database,
  LoaderCircle,
  Table2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { filterByTerm } from "@/lib/studio";
import { useStudio } from "@/providers/studio-provider";

export function StudioLayout() {
  const [query, setQuery] = useState("");
  const { models, isLoading, connected, error } = useStudio();

  const filteredModels = useMemo(
    () => filterByTerm(models, (model) => model.tableName, query),
    [models, query],
  );

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <header className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Database className="size-4" />
            <Typography variant="small" as="span" className="font-semibold">
              TypeORM Studio
            </Typography>
          </div>
          <div className="flex items-center gap-1 rounded-md border p-1">
            <Link
              to="/"
              className="rounded-sm px-2 py-1"
              activeProps={{
                className: "rounded-sm bg-muted",
              }}
              activeOptions={{ exact: false, includeSearch: false }}
            >
              <Typography variant="small" as="span" className="text-xs text-muted-foreground hover:text-foreground">
                Data
              </Typography>
            </Link>
            <Link
              to="/visualize"
              className="rounded-sm px-2 py-1"
              activeProps={{
                className: "rounded-sm bg-muted",
              }}
            >
              <Typography variant="small" as="span" className="text-xs text-muted-foreground hover:text-foreground">
                Visualize
              </Typography>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && <LoaderCircle className="size-3.5 animate-spin" />}
          {!isLoading && connected && <CircleCheckBig className="size-3.5" />}
          {!isLoading && !connected && <CircleAlert className="size-3.5" />}
          <Typography variant="muted" className="text-xs">
            {isLoading ? "Connecting" : connected ? "Connected" : "Disconnected"}
          </Typography>
        </div>
      </header>

      <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 md:grid-cols-[260px_1fr]">
        <aside className="overflow-auto border-r p-3">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search models"
            className="mb-3"
          />

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-9" />
              <Skeleton className="h-9" />
              <Skeleton className="h-9" />
            </div>
          ) : null}

          {!isLoading && error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-2">
              <Typography variant="muted" className="text-xs text-destructive">
                {error}
              </Typography>
            </div>
          ) : null}

          {!isLoading && !error ? (
            <div className="space-y-1">
              {filteredModels.map((model) => (
                <Link
                  key={model.tableName}
                  to="/models/$modelName"
                  params={{ modelName: model.tableName }}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted"
                  activeProps={{ className: "bg-muted font-medium" }}
                >
                  <Typography variant="small" as="span" className="flex items-center gap-2">
                    <Table2 className="size-3.5" />
                    {model.tableName}
                  </Typography>
                </Link>
              ))}
            </div>
          ) : null}
        </aside>

        <main className="overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
