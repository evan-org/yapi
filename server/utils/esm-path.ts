/**
 * ESM 运行时路径与动态加载辅助
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

/**
 * 由 import.meta.url 得到当前模块目录（等同 CommonJS __dirname）
 */
export function dirnameFromMeta(meta: ImportMeta): string {
  return path.dirname(fileURLToPath(meta.url));
}

/**
 * 创建与当前模块绑定的 require（用于插件等动态 CJS/TS 路径加载）
 */
export function createMetaRequire(meta: ImportMeta): NodeRequire {
  return createRequire(meta.url);
}

/**
 * 将绝对路径转为 file:// URL，供 import() 使用
 */
export function toFileUrl(absolutePath: string): string {
  return pathToFileURL(absolutePath).href;
}
