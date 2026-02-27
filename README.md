# typeorm-studio

To install dependencies:

```bash
bun install
```

## Run with a real TypeORM DataSource

Use the app-focused command and pass your data-source path:

```bash
bun run dev:app -- --ds ../your-app/src/data-source.ts --export AppDataSource
```

- Client UI: `http://127.0.0.1:5173`
- Server API: `http://127.0.0.1:3000/api`

If you have port conflicts, run with custom ports:

```bash
PORT=3001 CLIENT_PORT=5174 bun run dev:app -- --ds ../your-app/src/data-source.ts
```

NB: This is still a work in progress.

This project was created using `bun init` in bun v1.2.5. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Contributing

- Contribution guide and maintainer list: `CONTRIBUTORS.md`
