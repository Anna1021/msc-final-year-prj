import { spawn } from "node:child_process";

const commands = [
  { name: "backend", command: process.execPath, args: ["server/index.mjs"] },
  { name: "frontend", command: process.platform === "win32" ? "npm.cmd" : "npm", args: ["run", "dev:frontend"] }
];

const children = commands.map(({ name, command, args }) => {
  const child = spawn(command, args, { stdio: "inherit", env: process.env });
  child.on("error", (error) => {
    console.error(`[dev:${name}] failed to start`, error);
    stop(1);
  });
  return child;
});

let stopping = false;
function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  setTimeout(() => process.exit(exitCode), 100).unref();
}

for (const [index, child] of children.entries()) {
  child.on("exit", (code, signal) => {
    if (stopping) return;
    const name = commands[index].name;
    console.error(`[dev:${name}] stopped${signal ? ` (${signal})` : ` with code ${code ?? 1}`}.`);
    stop(code || 1);
  });
}

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
