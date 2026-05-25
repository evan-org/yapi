// @ts-nocheck
/**
 * 应用运行时单例（路径、配置、Model 实例池、邮件等）
 * 配置来自环境变量，见 config/load-config.ts 与 server/.env.example
 */
import path from "node:path";
import fs from "fs-extra";
import nodemailer from "nodemailer";
import { dirnameFromMeta } from "./utils/esm-path.js";
import { loadWebConfig } from "./config/load-config.js";

const __dirname = dirnameFromMeta(import.meta);

/**
 * 解析 server 根目录：YAPI_WEBROOT > 含 .env 的目录 > tsx/tsc 布局
 */
function resolveWebrootServer() {
  const fromEnv = process.env.YAPI_WEBROOT;
  if (fromEnv && fs.existsSync(fromEnv)) {
    return path.resolve(fromEnv);
  }
  if (fs.existsSync(path.join(__dirname, ".env"))) {
    return __dirname;
  }
  const parent = path.join(__dirname, "..");
  if (fs.existsSync(path.join(parent, ".env"))) {
    return parent;
  }
  if (fs.existsSync(path.join(parent, "package.json"))) {
    return parent;
  }
  return __dirname;
}

const WEBROOT_SERVER = resolveWebrootServer();
const WEBCONFIG = loadWebConfig(WEBROOT_SERVER);

const insts = new Map();
let mail;

const WEBROOT = path.resolve(WEBROOT_SERVER, ".");
const WEBROOT_RUNTIME = WEBROOT;
const WEBROOT_LOG = path.join(WEBROOT, "log");

fs.ensureDirSync(WEBROOT_LOG);

if (WEBCONFIG.mail && WEBCONFIG.mail.enable) {
  mail = nodemailer.createTransport(WEBCONFIG.mail);
}

/**
 * 获取一个 model 实例，如果不存在则创建一个新的返回
 */
function getInst(m, ...args) {
  if (!insts.get(m)) {
    insts.set(m, new m(args));
  }
  return insts.get(m);
}

function delInst(m) {
  try {
    insts.delete(m);
  } catch (err) {
    console.error(err);
  }
}

const runtime = {
  fs,
  path,
  WEBROOT,
  WEBROOT_SERVER,
  WEBROOT_RUNTIME,
  WEBROOT_LOG,
  WEBCONFIG,
  getInst,
  delInst,
  getInsts: insts,
  mail,
};

export default runtime;
