/**
 * 校验 Next.js 构建产物是否存在
 */
const fs = require("fs");
const path = require("path");

const nextDir = path.join(__dirname, "../web/.next");
const required = ["BUILD_ID", "server"];

let ok = true;
if (!fs.existsSync(nextDir)) {
  console.error("未找到 web/.next 目录");
  process.exit(1);
}

for (const name of required) {
  const p = path.join(nextDir, name);
  if (!fs.existsSync(p)) {
    console.error("缺少构建产物:", p);
    ok = false;
  }
}

if (!ok) {
  process.exit(1);
}

console.log("Next.js 构建产物校验通过");
