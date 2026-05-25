// @ts-nocheck
import path from "node:path";
import { readFileSync } from "node:fs";
import fs from "fs-extra";
import nodemailer from "nodemailer";
import { dirnameFromMeta } from "./utils/esm-path.js";

const __dirname = dirnameFromMeta(import.meta);

/**
 * 解析 server 根目录：支持 tsx 直跑（server/）与 tsc 编译后（server/dist/）
 */
function resolveWebrootServer() {
  if (fs.existsSync(path.join(__dirname, "config.json"))) {
    return __dirname;
  }
  const parent = path.join(__dirname, "..");
  if (fs.existsSync(path.join(parent, "config.json"))) {
    return parent;
  }
  return __dirname;
}

const WEBROOT_SERVER = resolveWebrootServer();
const config = JSON.parse(
  readFileSync(path.join(WEBROOT_SERVER, "config.json"), "utf8")
);

const insts = new Map();
let mail;

/** 后端工作区根目录（config、exts、common、node_modules 均在 server/ 内） */
const WEBROOT = path.resolve(WEBROOT_SERVER, ".");
const WEBROOT_RUNTIME = WEBROOT;
const WEBROOT_LOG = path.join(WEBROOT, "log");
const WEBCONFIG = config;

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
};

if (mail) {
  runtime.mail = mail;
}

export default runtime;
