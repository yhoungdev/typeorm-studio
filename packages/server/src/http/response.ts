const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
};

export function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...JSON_HEADERS,
      ...(init.headers ?? {}),
    },
  });
}

export function noContent(init: ResponseInit = {}): Response {
  return new Response(null, { ...init, status: init.status ?? 204 });
}
