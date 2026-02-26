const API_PREFIX = "/api";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(),
      });
    }

    if (url.pathname.startsWith(API_PREFIX)) {
      return new Response(
        JSON.stringify({
          ok: true,
          message: "TypeORM Studio API",
        }),
        {
          headers: {
            ...getCorsHeaders(),
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Proxy app routes/assets to Vite dev server so the UI is reachable on server port.
    try {
      const upstreamUrl = `${CLIENT_ORIGIN}${url.pathname}${url.search}`;
      const upstreamRes = await fetch(upstreamUrl, {
        method: req.method,
        headers: req.headers,
      });

      return new Response(upstreamRes.body, {
        status: upstreamRes.status,
        headers: upstreamRes.headers,
      });
    } catch {
      return new Response(
        `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>TypeORM Studio - Client Not Running</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 2rem; line-height: 1.5; }
      code { background: #f3f4f6; padding: 0.15rem 0.35rem; border-radius: 4px; }
    </style>
  </head>
  <body>
    <h1>Client is not running</h1>
    <p>The server is up, but the frontend was not reachable at <code>${CLIENT_ORIGIN}</code>.</p>
    <p>Start both with <code>bun run dev</code>, or start client only with <code>npm run --workspace packages/client dev</code>.</p>
  </body>
</html>`,
        {
          status: 503,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        },
      );
    }
  },
});

console.log(`Server listening on http://localhost:${server.port}`);
console.log(`Proxying client from ${CLIENT_ORIGIN}`);
