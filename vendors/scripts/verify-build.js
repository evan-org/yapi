/**
 * 校验前端构建产物是否完整
 */
const fs = require("fs");
const path = require("path");

const vendorsRoot = path.join(__dirname, "..");
const prdRoot = path.join(vendorsRoot, "static/prd");
const indexPath = path.join(prdRoot, "index.html");
const jsDir = path.join(prdRoot, "static/js");

if (!fs.existsSync(indexPath)) {
  console.error("缺少 static/prd/index.html");
  process.exit(1);
}

const jsFiles = fs.existsSync(jsDir) ? fs.readdirSync(jsDir).filter((f) => f.endsWith(".js")) : [];
if (jsFiles.length === 0) {
  console.error("缺少 static/prd/static/js 下的 JS 文件");
  process.exit(1);
}

const html = fs.readFileSync(indexPath, "utf8");
if (html.indexOf("/prd/") === -1 && html.indexOf("static/js") === -1) {
  console.error("index.html 未包含预期的静态资源引用");
  process.exit(1);
}

console.log("构建产物校验通过:", jsFiles.length, "个 JS 文件");
