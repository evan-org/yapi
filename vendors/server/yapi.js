const path = require("path");
const fs = require("fs-extra");
const nodemailer = require("nodemailer");
const config = require("../../config.json");
const insets = new Map();
const WEBROOT = path.resolve(__dirname, ".."); // 路径
const WEBROOT_SERVER = __dirname;
const WEBROOT_RUNTIME = path.resolve(__dirname, "../..");
const WEBROOT_LOG = path.join(WEBROOT_RUNTIME, "log");
const WEBROOT_CONFIG = config;
fs.ensureDirSync(WEBROOT_LOG);
//
let mail = WEBROOT_CONFIG.mail && WEBROOT_CONFIG.mail.enable ? nodemailer.createTransport(WEBROOT_CONFIG.mail) : {};
/**
 * 获取一个model实例，如果不存在则创建一个新的返回
 * @param Class
 * @param args
 * @example
 * yapi.getInst(GroupModel, arg1, arg2)
 */
function getInst(Class, ...args) {
  if (!insets.get(Class)) {
    insets.set(Class, new Class(args));
  }
  return insets.get(Class);
}
/**
 * @param {string} className
 * */
function delInst(className) {
  try {
    insets.delete(className);
  } catch (err) {
    console.error(err); // eslint-disable-line
  }
}
//
const yapi = {
  fs: fs,
  path: path,
  WEBROOT: WEBROOT,
  WEBROOT_SERVER: WEBROOT_SERVER,
  WEBROOT_RUNTIME: WEBROOT_RUNTIME,
  WEBROOT_LOG: WEBROOT_LOG,
  WEBROOT_CONFIG: WEBROOT_CONFIG,
  getInst: getInst,
  delInst: delInst,
  getInsets: insets
};
//
if (mail) {
  yapi.mail = mail;
}
module.exports = yapi;
