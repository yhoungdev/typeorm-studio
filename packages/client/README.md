# TypeORM Studio Client

The client consumes the backend API directly.

## API base URL

By default, the app calls `/api`.

For local development with client-only dev server (`vite`), requests are proxied to `http://127.0.0.1:3000` via `vite.config.ts`.

You can override the API base with:

```bash
VITE_STUDIO_API_BASE=/api/studio
```

## Required backend routes

- `GET /api/schema`
- `GET /api/models/:table/shape`
- `GET /api/models/:table/rows`
