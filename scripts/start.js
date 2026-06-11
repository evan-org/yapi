/**
 * 一键启动 YApi 前后端服务（跨平台）
 *
 * 用法：node scripts/start.js
 *   --dev     开发模式（默认）
 *   --prod    生产模式
 */
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const root = path.join(__dirname, "..");
const serverEnv = path.join(root, "server", ".env");
const serverEnvExample = path.join(root, "server", ".env.example");

// 解析参数
const args = process.argv.slice(2);
const isProd = args.includes("--prod");

// 确保 server/.env 存在
if (!fs.existsSync(serverEnv)) {
  if (fs.existsSync(serverEnvExample)) {
    fs.copyFileSync(serverEnvExample, serverEnv);
    console.log("[start] 已从 server/.env.example 生成 server/.env，请按需修改后重启");
  } else {
    console.error("[start] 未找到 server/.env.example，无法自动生成配置");
    process.exit(1);
  }
}

const isWindows = process.platform === "win32";

/**
 * 在子进程中通过 pnpm filter 启动 workspace 脚本
 */
function runWorkspace(filter, script, forwardArgs = []) {
  const args = ["--filter", filter, script];
  if (forwardArgs.length) {
    args.push("--", ...forwardArgs);
  }
  const child = spawn("pnpm", args, {
    cwd: root,
    stdio: "pipe",
    shell: true,
  });

  const tag = filter === "yapi-server" ? "server" : "client";

  child.stdout.on("data", (data) => {
    const lines = data.toString().trimEnd().split("\n");
    for (const line of lines) {
      console.log(`[${tag}] ${line}`);
    }
  });

  child.stderr.on("data", (data) => {
    const lines = data.toString().trimEnd().split("\n");
    for (const line of lines) {
      console.error(`[${tag}] ${line}`);
    }
  });

  child.on("exit", (code) => {
    console.log(`[${tag}] 进程退出 (code=${code})`);
  });

  return child;
}

const mode = isProd ? "start" : "dev";
console.log(`[start] 以${isProd ? "生产" : "开发"}模式启动 YApi...\n`);

const clientArgs = isProd ? ["-p", "4000", "-H", "0.0.0.0"] : ["-p", "4000"];
const server = runWorkspace("yapi-server", mode);
const client = runWorkspace("yapi-client", mode, clientArgs);

// Ctrl+C 优雅退出
function shutdown() {
  console.log("\n[start] 正在关闭服务...");
  server.kill();
  client.kill();
  setTimeout(() => process.exit(0), 2000);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
