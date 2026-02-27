import type { StudioProvider } from "./types";

export interface CorsConfig {
  origin?: string;
  methods?: string;
  headers?: string;
}

export interface ProxyConfig {
  enabled?: boolean;
  origin: string;
}

export interface StudioApiConfig {
  provider: StudioProvider;
  apiPrefix?: string;
  cors?: CorsConfig;
  proxy?: ProxyConfig;
}

export interface ResolvedStudioApiConfig {
  provider: StudioProvider;
  apiPrefix: string;
  cors: Required<CorsConfig>;
  proxy: Required<ProxyConfig>;
}

export function resolveConfig(
  config: StudioApiConfig,
): ResolvedStudioApiConfig {
  return {
    provider: config.provider,
    apiPrefix: config.apiPrefix ?? "/api",
    cors: {
      origin: config.cors?.origin ?? "*",
      methods: config.cors?.methods ?? "GET,OPTIONS",
      headers: config.cors?.headers ?? "Content-Type, Authorization",
    },
    proxy: {
      enabled: config.proxy?.enabled ?? false,
      origin: config.proxy?.origin ?? "",
    },
  };
}

export function corsHeaders(
  config: ResolvedStudioApiConfig,
): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": config.cors.origin,
    "Access-Control-Allow-Methods": config.cors.methods,
    "Access-Control-Allow-Headers": config.cors.headers,
  };
}
