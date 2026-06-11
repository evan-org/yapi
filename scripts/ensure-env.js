/**
 * 构建/开发前确保 server/.env 存在（从 .env.example 复制）
 */
const fs = require("fs");
const path = require("path");

const serverRoot = path.join(__dirname, "..", "server");
const envPath = path.join(serverRoot, ".env");
const examplePath = path.join(serverRoot, ".env.example");

if (!fs.existsSync(envPath)) {
  if (!fs.existsSync(examplePath)) {
    console.error("未找到 server/.env.example");
    process.exit(1);
  }
  fs.copyFileSync(examplePath, envPath);
  console.log("已从 server/.env.example 生成 server/.env，请按需修改后重启");
}
