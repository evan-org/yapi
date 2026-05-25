#!/usr/bin/env node
/** 修补首轮未转换的 require 与路径 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const serverRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "server");

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (name === "node_modules" || name === "dist") continue;
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (name.endsWith(".ts") && !name.endsWith(".d.ts") && !full.includes("tui-editor/dist")) acc.push(full);
  }
  return acc;
}

function fix(content, file) {
  let c = content;
  c = c.replace(/from 'utils\/esm-path\.ts'/g, "from './utils/esm-path.js'");
  c = c.replace(/from "utils\/esm-path\.ts"/g, 'from "./utils/esm-path.js"');
  // const x = require('y') 剩余
  c = c.replace(
    /const\s+(\w+)\s*=\s*require\((['"])([^'"]+)\2\)/g,
    "import $1 from '$3.js'"
  );
  c = c.replace(
    /const\s+\{([^}]+)\}\s*=\s*require\((['"])([^'"]+)\2\)/g,
    "import { $1 } from '$3.js'"
  );
  c = c.replace(
    /let\s+(\w+)\s*=\s*require\((['"])([^'"]+)\2\)/g,
    "import $1 from '$3.js'"
  );
  // require without .js extension on relative - fix double .js.js
  c = c.replace(/\.js\.js/g, ".js");
  // require(path.join(...)) -> keep for manual
  return c;
}

for (const f of walk(serverRoot)) {
  const before = fs.readFileSync(f, "utf8");
  const after = fix(before, f);
  if (after !== before) fs.writeFileSync(f, after);
}
console.log("pass2 done");
