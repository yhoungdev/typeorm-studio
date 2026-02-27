import { createServer } from "node:net";

function getCliArg(flag: string): string | undefined {
  const args = Bun.argv.slice(2);
  const index = args.findIndex((arg) => arg === flag);
  if (index < 0) {
    return undefined;
  }

  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    return undefined;
  }

  return value;
}

const requestedServerPort = Number(process.env.PORT ?? "3000");
const requestedClientPort = Number(process.env.CLIENT_PORT ?? "5173");
const clientHost = process.env.CLIENT_HOST ?? "127.0.0.1";
const dataSourcePath =
  getCliArg("--ds") ?? process.env.TYPEORM_DATA_SOURCE_PATH;
const dataSourceExport =
  getCliArg("--export") ?? process.env.TYPEORM_DATA_SOURCE_EXPORT;

if (!dataSourcePath) {
  console.error("Missing DataSource path.");
  console.error(
    "Run with: bun run dev:app -- --ds ../your-app/src/data-source.ts",
  );
  process.exit(1);
}

function canBindPort(port: number, host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, host);
  });
}

async function findOpenPort(
  startPort: number,
  host: string,
): Promise<number | null> {
  for (let port = startPort; port < startPort + 25; port++) {
    if (await canBindPort(port, host)) {
      return port;
    }
  }
  return null;
}

const serverPort =
  (await findOpenPort(requestedServerPort, "127.0.0.1")) ?? requestedServerPort;
const clientPort =
  (await findOpenPort(requestedClientPort, clientHost)) ?? requestedClientPort;

const commands = [
  {
    name: "server",
    cmd: ["bun", "run", "--cwd", "packages/server", "dev"],
    env: {
      ...process.env,
      PORT: String(serverPort),
      CLIENT_ORIGIN: `http://${clientHost}:${clientPort}`,
      TYPEORM_DATA_SOURCE_PATH: dataSourcePath,
      ...(dataSourceExport
        ? { TYPEORM_DATA_SOURCE_EXPORT: dataSourceExport }
        : {}),
    },
  },
  {
    name: "client",
    cmd: [
      "bun",
      "run",
      "--cwd",
      "packages/client",
      "dev",
      "--host",
      clientHost,
      "--port",
      String(clientPort),
      "--strictPort",
    ],
    env: process.env,
  },
] as const;

const children = commands.map(({ name, cmd, env }) => {
  const child = Bun.spawn({
    cmd,
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
    env,
  });

  child.exited.then((code) => {
    if (code !== 0) {
      console.error(`${name} exited with code ${code}`);
      console.error(
        `Startup failed. Check port usage: server=${serverPort}, client=${clientHost}:${clientPort}`,
      );
      for (const proc of children) {
        proc.kill();
      }
      process.exit(code ?? 1);
    }
  });

  return child;
});

process.on("SIGINT", () => {
  for (const child of children) {
    child.kill();
  }
  process.exit(0);
});

console.log("TypeORM Studio");
console.log(`Client: http://${clientHost}:${clientPort}`);
console.log(`Server/API: http://127.0.0.1:${serverPort}/api`);
console.log(
  `DataSource: ${dataSourcePath}${dataSourceExport ? `#${dataSourceExport}` : "#AppDataSource"}`,
);
if (serverPort !== requestedServerPort || clientPort !== requestedClientPort) {
  console.log(
    `Requested ports were busy. Using server=${serverPort}, client=${clientPort}`,
  );
}
