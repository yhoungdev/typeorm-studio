import { createStudioHandler } from "./handler";
import type { StudioApiConfig } from "./config";

export interface StudioServerConfig extends StudioApiConfig {
  port?: number;
}

export function startStudioServer(config: StudioServerConfig) {
  const handler = createStudioHandler(config);
  const server = Bun.serve({
    port: config.port ?? Number(process.env.PORT ?? 3000),
    fetch: handler,
  });

  return server;
}
