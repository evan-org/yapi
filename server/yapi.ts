// @ts-nocheck
const path = require("path");
const fs = require("fs-extra");
const nodemailer = require("nodemailer");

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
const config = require(path.join(WEBROOT_SERVER, "config.json"));

let insts = new Map();
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
 * 获取一个model实例，如果不存在则创建一个新的返回
 * @param {*} m class
 * @example
 * yapi.getInst(groupModel, arg1, arg2)
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
    console.error(err); // eslint-disable-line
  }
}


let r = {
  fs: fs,
  path: path,
  WEBROOT: WEBROOT,
  WEBROOT_SERVER: WEBROOT_SERVER,
  WEBROOT_RUNTIME: WEBROOT_RUNTIME,
  WEBROOT_LOG: WEBROOT_LOG,
  WEBCONFIG: WEBCONFIG,
  getInst: getInst,
  delInst: delInst,
  getInsts: insts
};
if (mail) {r.mail = mail;}
module.exports = r;
