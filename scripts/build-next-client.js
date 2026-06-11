/**
 * 使用 Next.js 构建前端（产物目录 client/.next）
 */
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const projectRoot = path.join(__dirname, "..");
const clientRoot = path.join(projectRoot, "client");

require("./ensure-env.js");

if (!fs.existsSync(path.join(projectRoot, "node_modules"))) {
  console.log("安装 workspace 依赖…");
  execSync("pnpm install --frozen-lockfile", { cwd: projectRoot, stdio: "inherit" });
}

console.log("开始构建前端（next build）...");
execSync("pnpm --filter yapi-client build", {
  cwd: projectRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: "production",
    YAPI_API_URL: process.env.YAPI_API_URL || "http://127.0.0.1:3001",
  },
});

console.log("Next.js 构建完成，目录: client/.next");
