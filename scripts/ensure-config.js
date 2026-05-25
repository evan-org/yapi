/**
 * 构建前端前确保仓库根目录存在 config.json（供插件初始化读取）
 */
const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const configPath = path.join(projectRoot, "config.json");
const examplePath = path.join(projectRoot, "config_example.json");

if (!fs.existsSync(configPath)) {
  if (!fs.existsSync(examplePath)) {
    console.error("未找到 config_example.json，无法生成 config.json");
    process.exit(1);
  }
  fs.copyFileSync(examplePath, configPath);
  console.log("已从 config_example.json 生成 config.json");
}
