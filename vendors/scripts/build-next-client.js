/**
 * 使用 Next.js 构建前端（产物目录 vendors/web/.next）
 */
const path = require("path");
const { execSync } = require("child_process");

const vendorsRoot = path.join(__dirname, "..");
const webRoot = path.join(vendorsRoot, "web");

require("./ensure-config.js");
require("./generate-plugin-module.js");

const webLock = path.join(webRoot, "package-lock.json");
if (!require("fs").existsSync(path.join(webRoot, "node_modules"))) {
  console.log("安装 web 依赖…");
  execSync("npm ci --legacy-peer-deps", { cwd: webRoot, stdio: "inherit" });
}

console.log("开始构建前端（next build）...");
execSync("npm run build", {
  cwd: webRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: "production",
    YAPI_API_URL: process.env.YAPI_API_URL || "http://127.0.0.1:3001",
  },
});

console.log("Next.js 构建完成，目录: vendors/web/.next");
