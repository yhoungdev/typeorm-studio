# typeorm-studio

To install dependencies:

```bash
bun install
```

## Run with a real TypeORM DataSource

Set your app data-source path before starting dev:

```bash
TYPEORM_DATA_SOURCE_PATH=../your-app/src/data-source.ts \
TYPEORM_DATA_SOURCE_EXPORT=AppDataSource \
bun run dev
```

- Client UI: `http://127.0.0.1:5173`
- Server API: `http://127.0.0.1:3000/api`

If you have port conflicts, run with custom ports:

```bash
PORT=3001 CLIENT_PORT=5174 TYPEORM_DATA_SOURCE_PATH=../your-app/src/data-source.ts bun run dev
```

NB: This is still a work in progress.

This project was created using `bun init` in bun v1.2.5. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Contributing

- Contribution guide and maintainer list: `CONTRIBUTORS.md`
