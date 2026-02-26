import { createInMemoryProvider, startStudioServer } from "./studio";
import { sampleDataset } from "./sample-data";

const port = Number(process.env.PORT ?? 3000);
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

const server = startStudioServer({
  port,
  provider: createInMemoryProvider(sampleDataset),
  apiPrefix: "/api",
  proxy: {
    enabled: true,
    origin: clientOrigin,
  },
});

console.log(`Server listening on http://localhost:${server.port}`);
console.log(`Proxying client from ${clientOrigin}`);
