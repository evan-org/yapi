// @ts-nocheck
/**
 * 解析 Next.js 前端 public 目录（静态资源由 client 托管）
 */
import path from "node:path";
import fs from "fs-extra";
import runtime from "../runtime.js";

let cachedDir: string | null = null;

/**
 * 定位 client/public（支持 tsx 直跑 server/ 与 dist/ 编译目录）
 */
export function getClientPublicDir(): string {
  if (cachedDir) {
    return cachedDir;
  }
  const candidates = [
    process.env.YAPI_CLIENT_PUBLIC,
    path.join(runtime.WEBROOT_SERVER, "../client/public"),
    path.join(runtime.WEBROOT_SERVER, "../../client/public"),
  ].filter(Boolean);

  for (const dir of candidates) {
    const resolved = path.resolve(dir);
    if (fs.existsSync(resolved)) {
      cachedDir = resolved;
      return cachedDir;
    }
  }

  cachedDir = path.resolve(runtime.WEBROOT_SERVER, "../client/public");
  return cachedDir;
}

/**
 * 拼接 client/public 下的文件绝对路径
 */
export function clientPublicFile(...segments: string[]): string {
  return path.join(getClientPublicDir(), ...segments);
}
