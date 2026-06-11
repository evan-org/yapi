// @ts-nocheck
/**
 * 应用日志：控制台 + 按月落盘
 * 从 commons 拆出，避免 utils ↔ services 循环依赖
 */
import fs from "fs-extra";
import path from "node:path";
import yapi from "../runtime.js";

export function appLog(msg, type) {
  if (!msg) {
    return;
  }

  type = type || "log";

  let f;
  switch (type) {
    case "log":
      f = console.log; // eslint-disable-line
      break;
    case "warn":
      f = console.warn; // eslint-disable-line
      break;
    case "error":
      f = console.error; // eslint-disable-line
      break;
    default:
      f = console.log; // eslint-disable-line
      break;
  }

  f(type + ":", msg);

  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const logfile = path.join(yapi.WEBROOT_LOG, year + "-" + month + ".log");

  if (typeof msg === "object") {
    if (msg instanceof Error) {
      msg = msg.message;
    } else {
      msg = JSON.stringify(msg);
    }
  }

  const data = `[ ${new Date().toLocaleString()} ] [ ${type} ] ${msg}\n`;
  fs.writeFileSync(logfile, data, { flag: "a" });
}
