/**
 * 开发启动前释放 YApi 占用的端口（避免重复 pnpm dev 导致 EADDRINUSE）
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function readEnvValue(filePath, key, fallback) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }
  const text = fs.readFileSync(filePath, "utf8");
  const match = text.match(new RegExp(`^${key}=(.+)$`, "m"));
  if (!match) {
    return fallback;
  }
  return match[1].trim().replace(/^["']|["']$/g, "");
}

function getDevPorts() {
  const envLocal = path.join(root, "server", ".env.local");
  const envFile = path.join(root, "server", ".env");
  const source = fs.existsSync(envLocal) ? envLocal : envFile;
  const apiPort = Number(readEnvValue(source, "YAPI_PORT", "7102"));
  const clientPort = Number(
    readEnvValue(source, "YAPI_DEV_CLIENT_PORT", "7101")
  );
  return [clientPort, apiPort];
}

function pidsOnPortWindows(port) {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      if (!/LISTENING/i.test(line)) {
        continue;
      }
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid) && pid !== "0") {
        pids.add(pid);
      }
    }
    return [...pids];
  } catch {
    return [];
  }
}

function pidsOnPortUnix(port) {
  try {
    const out = execSync(`lsof -ti :${port} -sTCP:LISTEN`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    return out
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function killPid(pid) {
  try {
    if (process.platform === "win32") {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
    } else {
      execSync(`kill -9 ${pid}`, { stdio: "ignore" });
    }
    return true;
  } catch {
    return false;
  }
}

function freePort(port) {
  const pids =
    process.platform === "win32"
      ? pidsOnPortWindows(port)
      : pidsOnPortUnix(port);
  for (const pid of pids) {
    if (killPid(pid)) {
      console.log(`[start] 已释放端口 ${port}（PID ${pid}）`);
    }
  }
}

function freeDevPorts() {
  const ports = [...new Set(getDevPorts())];
  for (const port of ports) {
    freePort(port);
  }
}

module.exports = { freeDevPorts, getDevPorts };

if (require.main === module) {
  freeDevPorts();
}
