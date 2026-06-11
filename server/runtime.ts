// @ts-nocheck
/**
 * 应用运行时单例（路径、配置、Model 实例池、邮件等）
 * 配置来自环境变量，见 config/load-config.ts 与 server/.env.example / server/.env.local
 */
import path from "node:path";
import fs from "fs-extra";
import nodemailer from "nodemailer";
import { dirnameFromMeta } from "./utils/esm-path.js";
import { loadWebConfig } from "./config/load-config.js";

const __dirname = dirnameFromMeta(import.meta);

/**
 * 解析 server 根目录：YAPI_WEBROOT > 含 .env.local / .env 的目录 > tsx/tsc 布局
 */
function hasServerEnvFile(dir: string) {
  return (
    fs.existsSync(path.join(dir, ".env.local")) ||
    fs.existsSync(path.join(dir, ".env"))
  );
}

function resolveWebrootServer() {
  const fromEnv = process.env.YAPI_WEBROOT;
  if (fromEnv && fs.existsSync(fromEnv)) {
    return path.resolve(fromEnv);
  }
  if (hasServerEnvFile(__dirname)) {
    return __dirname;
  }
  const parent = path.join(__dirname, "..");
  if (hasServerEnvFile(parent)) {
    return parent;
  }
  if (fs.existsSync(path.join(parent, "package.json"))) {
    return parent;
  }
  return __dirname;
}

const WEBROOT_SERVER = resolveWebrootServer();
const WEBCONFIG = loadWebConfig(WEBROOT_SERVER);

let mail;

const WEBROOT = path.resolve(WEBROOT_SERVER, ".");
const WEBROOT_RUNTIME = WEBROOT;
const WEBROOT_LOG = path.join(WEBROOT, "log");

fs.ensureDirSync(WEBROOT_LOG);

if (WEBCONFIG.mail && WEBCONFIG.mail.enable) {
  mail = nodemailer.createTransport(WEBCONFIG.mail);
}

const runtime = {
  fs,
  path,
  WEBROOT,
  WEBROOT_SERVER,
  WEBROOT_RUNTIME,
  WEBROOT_LOG,
  WEBCONFIG,
  mail,
};

export default runtime;
