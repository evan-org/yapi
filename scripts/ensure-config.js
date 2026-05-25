/**
 * 构建前端前确保 server/config.json 存在（供插件初始化读取）
 */
const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const serverRoot = path.join(repoRoot, "server");
const configPath = path.join(serverRoot, "config.json");
const examplePath = path.join(serverRoot, "config.example.json");
const legacyRootConfig = path.join(repoRoot, "config.json");

if (!fs.existsSync(configPath)) {
  if (fs.existsSync(legacyRootConfig)) {
    fs.copyFileSync(legacyRootConfig, configPath);
    console.log("已将根目录 config.json 迁移到 server/config.json");
  } else if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, configPath);
    console.log("已从 server/config.example.json 生成 server/config.json");
  } else {
    console.error("未找到 server/config.example.json，无法生成配置");
    process.exit(1);
  }
}
