import { createServer } from "node:net";

const requestedServerPort = Number(process.env.PORT ?? "3000");
const requestedClientPort = Number(process.env.CLIENT_PORT ?? "5173");
const clientHost = process.env.CLIENT_HOST ?? "127.0.0.1";

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

async function findOpenPort(startPort: number, host: string): Promise<number | null> {
  for (let port = startPort; port < startPort + 25; port++) {
    if (await canBindPort(port, host)) {
      return port;
    }
  }
  return null;
}

const serverPort = (await findOpenPort(requestedServerPort, "127.0.0.1")) ?? requestedServerPort;
const clientPort = (await findOpenPort(requestedClientPort, clientHost)) ?? requestedClientPort;

const commands = [
  {
    name: "server",
    cmd: ["bun", "run", "--cwd", "packages/server", "dev"],
    env: {
      ...process.env,
      PORT: String(serverPort),
      CLIENT_ORIGIN: `http://${clientHost}:${clientPort}`,
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
if (serverPort !== requestedServerPort || clientPort !== requestedClientPort) {
  console.log(
    `Requested ports were busy. Using server=${serverPort}, client=${clientPort}`,
  );
}
