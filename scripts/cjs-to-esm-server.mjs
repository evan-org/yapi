#!/usr/bin/env node
/**
 * server/*.ts：CommonJS require/module.exports → ESM import/export
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.join(__dirname, "..", "server");

const SKIP_PARTS = ["types/"];

function shouldSkip(rel) {
  return SKIP_PARTS.some((p) => rel.includes(p));
}

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.relative(serverRoot, full);
    if (name === "node_modules" || name === "dist") continue;
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (name.endsWith(".ts") && !name.endsWith(".d.ts") && !shouldSkip(rel)) acc.push(full);
  }
  return acc;
}

/** 相对路径 import 补全 .js 后缀（TypeScript NodeNext 约定） */
function withJsExt(spec) {
  if (!spec.startsWith(".")) return spec;
  if (spec.endsWith(".json") || spec.endsWith(".js")) return spec;
  return `${spec}.js`;
}

function esmPathToUtils(filePath) {
  const dir = path.dirname(filePath);
  const rel = path.relative(dir, path.join(serverRoot, "utils", "esm-path.ts"));
  return withJsExt(rel.split(path.sep).join("/"));
}

function convertRequires(code) {
  let next = code;
  // require('side'); 独立语句
  next = next.replace(/(^|\n)\s*require\((['"])([^'"]+)\2\)\s*;/g, (m, pre, q, spec) => {
    return `${pre}import '${withJsExt(spec)}';\n`;
  });
  // const { a, b } = require('x');
  next = next.replace(
    /const\s+\{([^}]+)\}\s*=\s*require\((['"])([^'"]+)\2\)\s*;/g,
    (m, names, q, spec) => `import { ${names.trim()} } from '${withJsExt(spec)}';\n`
  );
  // const x = require('x');
  next = next.replace(
    /const\s+(\w+)\s*=\s*require\((['"])([^'"]+)\2\)\s*;/g,
    (m, name, q, spec) => `import ${name} from '${withJsExt(spec)}';\n`
  );
  // let x = require
  next = next.replace(
    /let\s+(\w+)\s*=\s*require\((['"])([^'"]+)\2\)\s*;/g,
    (m, name, q, spec) => `import ${name} from '${withJsExt(spec)}';\n`
  );
  return next;
}

function convertExports(code) {
  let next = code;
  next = next.replace(
    /exports\.(\w+)\s*=\s*async\s+function\s+(\w+)?/g,
    (m, name1, name2) => `export async function ${name2 || name1}`
  );
  next = next.replace(
    /exports\.(\w+)\s*=\s*function\s+(\w+)?/g,
    (m, name1, name2) => `export function ${name2 || name1}`
  );
  next = next.replace(/exports\.(\w+)\s*=/g, "export const $1 =");
  next = next.replace(/module\.exports\s*=\s*function\b/, "export default function");
  next = next.replace(/module\.exports\s*=\s*class\b/, "export default class");
  next = next.replace(/module\.exports\s*=\s*/, "export default ");
  return next;
}

function ensureDirnameImport(code, filePath) {
  if (!code.includes("__dirname") && !code.includes("__filename")) {
    return code;
  }
  const helperImport = `import { dirnameFromMeta } from '${esmPathToUtils(filePath)}';\nconst __dirname = dirnameFromMeta(import.meta);\n`;
  if (code.includes("dirnameFromMeta")) return code;
  const lines = code.split("\n");
  let insertAt = 0;
  if (lines[0]?.includes("@ts-nocheck")) insertAt = 1;
  lines.splice(insertAt, 0, helperImport.trim());
  return lines.join("\n");
}

/** yapi.js / models/* 等裸模块名 → 带 .js 的 TS 路径别名 */
function aliasBareSpecifiers(code) {
  return code
    .replace(/from 'yapi\.js'/g, "from 'yapi.js'")
    .replace(/from "yapi\.js"/g, 'from "yapi.js"')
    .replace(/from 'models\//g, "from 'models/")
    .replace(/from "models\//g, 'from "models/')
    .replace(/from 'controllers\//g, "from 'controllers/")
    .replace(/from "controllers\//g, 'from "controllers/');
}

const files = walk(serverRoot);
let count = 0;
for (const file of files) {
  if (file.endsWith("utils/esm-path.ts")) continue;
  let code = fs.readFileSync(file, "utf8");
  const orig = code;
  code = convertExports(code);
  code = convertRequires(code);
  code = aliasBareSpecifiers(code);
  code = ensureDirnameImport(code, file);
  if (code !== orig) {
    fs.writeFileSync(file, code);
    count++;
  }
}
console.log(`ESM 转换完成，更新 ${count} 个文件`);
