/**
 * 使用 Craco 构建前端并输出到 static/prd，供 Fastify 静态服务使用
 */
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");

const vendorsRoot = path.join(__dirname, "..");
const staticRoot = path.join(vendorsRoot, "static");
const prdRoot = path.join(staticRoot, "prd");
const publicRoot = path.join(vendorsRoot, "public");

require("./ensure-config.js");

const nodeOptions = [
  process.env.NODE_OPTIONS,
  "--openssl-legacy-provider",
  "--max-old-space-size=4096"
]
  .filter(Boolean)
  .join(" ");

console.log("开始构建前端（craco build）...");
execSync("npx craco build", {
  cwd: vendorsRoot,
  stdio: "inherit",
  env: Object.assign({}, process.env, {
    NODE_ENV: "production",
    GENERATE_SOURCEMAP: "false",
    DISABLE_ESLINT_PLUGIN: process.env.CI ? "true" : process.env.DISABLE_ESLINT_PLUGIN || "false",
    NODE_OPTIONS: nodeOptions
  })
});

const prdIndex = path.join(prdRoot, "index.html");
if (!fs.existsSync(prdIndex)) {
  console.error("构建失败：未找到 static/prd/index.html");
  process.exit(1);
}

fs.mkdirSync(staticRoot, { recursive: true });
fs.copySync(prdIndex, path.join(staticRoot, "index.html"));
fs.copySync(prdIndex, path.join(staticRoot, "dev.html"));
if (fs.existsSync(publicRoot)) {
  fs.copySync(publicRoot, staticRoot, { overwrite: true });
}

console.log("前端构建完成，输出目录: vendors/static/prd");
