/**
 * 使用 Next.js 构建前端（产物目录 client/.next）
 */
const path = require("path");
const { execSync } = require("child_process");

const projectRoot = path.join(__dirname, "..");
const clientRoot = path.join(projectRoot, "client");

require("./ensure-env.js");

const clientLock = path.join(clientRoot, "package-lock.json");
if (!require("fs").existsSync(path.join(clientRoot, "node_modules"))) {
  console.log("安装 client 依赖…");
  execSync("npm ci --legacy-peer-deps", { cwd: clientRoot, stdio: "inherit" });
}

console.log("开始构建前端（next build）...");
execSync("npm run build", {
  cwd: clientRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: "production",
    YAPI_API_URL: process.env.YAPI_API_URL || "http://127.0.0.1:3001",
  },
});

console.log("Next.js 构建完成，目录: client/.next");
