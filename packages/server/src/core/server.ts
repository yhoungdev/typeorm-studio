import { createStudioHandler } from "./handler";
import type { StudioApiConfig } from "./config";

export interface StudioServerConfig extends StudioApiConfig {
  port?: number;
}

export function startStudioServer(config: StudioServerConfig) {
  const handler = createStudioHandler(config);
  let port = config.port ?? Number(process.env.PORT ?? 3000);
  const maxAttempts = 10;
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const server = Bun.serve({
        port,
        fetch: handler,
      });
      return server;
    } catch (e: any) {
      if (e.code === "EADDRINUSE" || e.message?.includes("address already in use")) {
        console.warn(`Port ${port} is in use, trying ${port + 1}...`);
        port++;
        attempts++;
      } else {
        throw e;
      }
    }
  }

  throw new Error(`Could not find an available port after ${maxAttempts} attempts.`);
}
