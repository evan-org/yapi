/**
 * 使用 Vite 构建前端并输出到 static/prd，供 Hono 静态服务使用
 */
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");

const vendorsRoot = path.join(__dirname, "..");
const staticRoot = path.join(vendorsRoot, "static");
const prdRoot = path.join(staticRoot, "prd");
const publicRoot = path.join(vendorsRoot, "public");

require("./ensure-config.js");
require("./generate-plugin-module.js");

console.log("开始构建前端（vite build）...");
execSync("npx vite build", {
  cwd: vendorsRoot,
  stdio: "inherit",
  env: Object.assign({}, process.env, {
    NODE_ENV: "production",
  }),
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
  const copyOpts = {
    overwrite: true,
    filter(src) {
      const base = path.basename(src);
      return base !== "index.html";
    },
  };
  fs.copySync(publicRoot, staticRoot, copyOpts);
}

console.log("前端构建完成，输出目录: vendors/static/prd");
