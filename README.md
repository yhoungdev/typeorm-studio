# typeorm-studio

To install dependencies:

```bash
bun install
```

## Run with a real TypeORM DataSource

Configure env vars, then run dev.

1. Copy env template:

```bash
cp packages/server/.env.example .env
```

2. Update `.env` values (`TYPEORM_DATA_SOURCE_PATH`, `TYPEORM_DATA_SOURCE_EXPORT`, and your `DATABASE_URL`).

3. Start:

```bash
bun run dev
```

- Client UI: `http://127.0.0.1:5173`
- Server API: `http://127.0.0.1:3000/api`

If you have port conflicts, set custom ports in `.env`:

```bash
PORT=3001
CLIENT_PORT=5174
```

NB: This is still a work in progress.

This project was created using `bun init` in bun v1.2.5. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Contributing

- Contribution guide and maintainer list: `CONTRIBUTORS.md`
