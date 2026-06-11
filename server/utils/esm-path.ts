/**
 * ESM 运行时路径辅助
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * 由 import.meta.url 得到当前模块目录（等同 CommonJS __dirname）
 */
export function dirnameFromMeta(meta: ImportMeta): string {
  return path.dirname(fileURLToPath(meta.url));
}
