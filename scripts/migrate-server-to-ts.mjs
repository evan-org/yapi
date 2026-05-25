#!/usr/bin/env node
/**
 * 将 server 下业务 .js 批量重命名为 .ts，并规范化 require 路径（去掉 .js 后缀）
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.join(__dirname, "..", "server");

const SKIP_DIRS = new Set(["node_modules", "dist", "log"]);
const SKIP_FILES = new Set([".eslintrc.js", ".prettierrc.js"]);
const SKIP_PATH_PARTS = [];

function shouldSkip(relPath) {
  if (SKIP_FILES.has(path.basename(relPath))) {
    return true;
  }
  return SKIP_PATH_PARTS.some((p) => relPath.includes(p));
}

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.relative(serverRoot, full);
    if (SKIP_DIRS.has(name)) {
      continue;
    }
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full, files);
    } else if (name.endsWith(".js") && !shouldSkip(rel)) {
      files.push(full);
    }
  }
  return files;
}

function transformSource(code, filePath) {
  let next = code;
  // require('./foo.js') -> require('./foo')
  next = next.replace(
    /require\((['"])(\.[^'"]+)\.js\1\)/g,
    "require($1$2$1)"
  );
  return next;
}

const jsFiles = walk(serverRoot);
console.log(`迁移 ${jsFiles.length} 个 server .js 文件 -> .ts`);

for (const jsPath of jsFiles) {
  const tsPath = jsPath.replace(/\.js$/, ".ts");
  const code = fs.readFileSync(jsPath, "utf8");
  const transformed = transformSource(code, jsPath);
  fs.writeFileSync(tsPath, transformed, "utf8");
  fs.unlinkSync(jsPath);
}

console.log("完成。请运行: cd server && npm run typecheck");
