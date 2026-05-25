/**
 * 校验 Vite 前端构建产物是否完整
 */
const fs = require("fs");
const path = require("path");

const vendorsRoot = path.join(__dirname, "..");
const prdRoot = path.join(vendorsRoot, "static/prd");
const indexPath = path.join(prdRoot, "index.html");
const assetsDir = path.join(prdRoot, "static");

if (!fs.existsSync(indexPath)) {
  console.error("缺少 static/prd/index.html");
  process.exit(1);
}

const assetFiles = fs.existsSync(assetsDir)
  ? fs.readdirSync(assetsDir).filter((f) => /\.(js|css)$/.test(f))
  : [];
if (assetFiles.length === 0) {
  console.error("缺少 static/prd/static 下的 JS/CSS 资源");
  process.exit(1);
}

const html = fs.readFileSync(indexPath, "utf8");
if (html.indexOf("/prd/static/") === -1 && html.indexOf('type="module"') === -1) {
  console.error("index.html 未包含预期的 Vite 静态资源引用");
  process.exit(1);
}

console.log("构建产物校验通过:", assetFiles.length, "个资源文件");
