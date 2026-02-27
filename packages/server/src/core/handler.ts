import { resolveConfig, type StudioApiConfig, corsHeaders } from "./config";
import { asHttpError, HttpError } from "../http/errors";
import { json, noContent } from "../http/response";
import { getTableName, parsePositiveInt, removePrefix } from "../http/request";

async function proxyRequest(req: Request, origin: string): Promise<Response> {
  const incomingUrl = new URL(req.url);
  const target = `${origin}${incomingUrl.pathname}${incomingUrl.search}`;
  const proxied = await fetch(target, {
    method: req.method,
    headers: req.headers,
  });

  return new Response(proxied.body, {
    status: proxied.status,
    headers: proxied.headers,
  });
}

export function createStudioHandler(rawConfig: StudioApiConfig) {
  const config = resolveConfig(rawConfig);
  const cors = corsHeaders(config);

  return async function studioHandler(req: Request): Promise<Response> {
    try {
      if (req.method === "OPTIONS") {
        return noContent({ headers: cors });
      }

      const url = new URL(req.url);
      const internalPath = removePrefix(url.pathname, config.apiPrefix);

      if (internalPath == null) {
        if (config.proxy.enabled && config.proxy.origin) {
          return proxyRequest(req, config.proxy.origin);
        }
        throw new HttpError(404, "Route not found");
      }

      if (req.method !== "GET") {
        throw new HttpError(405, "Method not allowed");
      }

      if (internalPath === "/" || internalPath === "") {
        return json(
          {
            ok: true,
            message: "TypeORM Studio API",
          },
          { headers: cors },
        );
      }

      if (internalPath === "/health") {
        return json(
          {
            ok: true,
            status: "healthy",
          },
          { headers: cors },
        );
      }

      if (internalPath === "/schema" || internalPath === "/models") {
        const schema = await config.provider.getSchema();
        return json(schema, { headers: cors });
      }

      if (
        internalPath.startsWith("/models/") &&
        internalPath.endsWith("/shape")
      ) {
        const tableName = getTableName(internalPath);
        const shape = await config.provider.getModelShape(tableName);
        return json(shape, { headers: cors });
      }

      if (
        internalPath.startsWith("/models/") &&
        internalPath.endsWith("/rows")
      ) {
        const tableName = getTableName(internalPath);
        const limit = parsePositiveInt(
          url.searchParams.get("limit"),
          50,
          "limit",
        );
        const offset = parsePositiveInt(
          url.searchParams.get("offset"),
          0,
          "offset",
        );
        const search = url.searchParams.get("search") ?? "";

        const payload = await config.provider.listRows(tableName, {
          limit,
          offset,
          search,
        });

        return json(payload, { headers: cors });
      }

      throw new HttpError(404, "Route not found");
    } catch (error) {
      const httpError = asHttpError(error);
      return json(
        {
          ok: false,
          error: httpError.message,
        },
        {
          status: httpError.status,
          headers: cors,
        },
      );
    }
  };
}
