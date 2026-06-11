// @ts-nocheck
import fs from 'fs-extra';

import path from 'path';

import yapi from '../runtime.js';

import apiResponse from '../lib/api-response.js';

import sha1 from 'sha1';

import { appLog } from './app-log.js';
import notificationService from '../services/notification.service.js';
import userService from '../services/user.service.js';

import json5 from 'json5';

import _ from 'underscore';

import Ajv from 'ajv';

import Mock from 'mockjs';

import sandboxFn from './sandbox.js'


import ejs from 'easy-json-schema';


import jsf from 'json-schema-faker';

import { schemaValidator } from '../utils/schema-utils.js';

import http from "http";
import vm from "node:vm";
import localize from "ajv-i18n";


jsf.extend("mock", function() {
  return {
    mock: function(xx) {
      return Mock.mock(xx);
    }
  };
});

const defaultOptions = {
  failOnInvalidTypes: false,
  failOnInvalidFormat: false
};

// formats.forEach(item => {
//   item = item.name;
//   jsf.format(item, () => {
//     if (item === 'mobile') {
//       return jsf.random.randexp('^[1][34578][0-9]{9}$');
//     }
//     return Mock.mock('@' + item);
//   });
// });

export const schemaToJson = function(schema, options = {}) {
  Object.assign(options, defaultOptions);

  jsf.option(options);
  let result;
  try {
    result = jsf(schema);
  } catch (err) {
    result = err.message;
  }
  jsf.option(defaultOptions);
  return result;
};

export const resReturn = (data, num, errmsg) => {
  num = num || 0;

  return {
    errcode: num,
    errmsg: errmsg || "成功！",
    data: data
  };
};

export const log = appLog;

export const fileExist = (filePath) => {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
};

export const time = () => Date.parse(new Date()) / 1000;

export const fieldSelect = (data, field) => {
  if (!data || !field || !Array.isArray(field)) {
    return null;
  }

  let arr = {};

  field.forEach((f) => {
    typeof data[f] !== "undefined" && (arr[f] = data[f]);
  });

  return arr;
};

export const rand = (min, max) => Math.floor(Math.random() * (max - min) + min);

export const json_parse = (json) => {
  try {
    return json5.parse(json);
  } catch (e) {
    return json;
  }
};

export const randStr = () => Math.random()
  .toString(36)
  .substr(2);
export const getIp = (ctx) => {
  let ip;
  try {
    ip = ctx.ip.match(/\d+.\d+.\d+.\d+/) ? ctx.ip.match(/\d+.\d+.\d+.\d+/)[0] : "localhost";
  } catch (e) {
    ip = null;
  }
  return ip;
};

export const generatePassword = (password, passsalt) => sha1(password + sha1(passsalt));

export const expireDate = (day) => {
  let date = new Date();
  date.setTime(date.getTime() + day * 86400000);
  return date;
};

export const sendMail = (options, cb) =>
  notificationService.sendMail(options, cb);

export const validateSearchKeyword = (keyword) => {
  if (/^\*|\?|\+|\$|\^|\\|\.$/.test(keyword)) {
    return false;
  }

  return true;
};

export const filterRes = (list, rules) => list.map((item) => {
  let filteredRes = {};

  rules.forEach((rule) => {
    if (typeof rule == "string") {
      filteredRes[rule] = item[rule];
    } else if (typeof rule == "object") {
      filteredRes[rule.alias] = item[rule.key];
    }
  });

  return filteredRes;
});

export const handleVarPath = (pathname, params) => {
  function insertParams(name) {
    if (!_.find(params, { name: name })) {
      params.push({
        name: name,
        desc: ""
      });
    }
  }

  if (!pathname) {return;}
  if (pathname.indexOf(":") !== -1) {
    let paths = pathname.split("/"),
      name,
      i;
    for (i = 1; i < paths.length; i++) {
      if (paths[i] && paths[i][0] === ":") {
        name = paths[i].substr(1);
        insertParams(name);
      }
    }
  }
  pathname.replace(/\{(.+?)\}/g, function(str, match) {
    insertParams(match);
  });
};

/**
 * 验证一个 path 是否合法
 * path第一位必需为 /, path 只允许由 字母数字-/_:.{}= 组成
 */
export const verifyPath = (path) =>
  // if (/^\/[a-zA-Z0-9\-\/_:!\.\{\}\=]*$/.test(path)) {
  //   return true;
  // } else {
  //   return false;
  // }
  /^\/[a-zA-Z0-9\-\/_:!\.\{\}\=]*$/.test(path)
;

/**
 * 沙盒执行 js 代码
 * @sandbox Object context
 * @script String script
 * @return sandbox
 *
 * @example let a = sandbox({a: 1}, 'a=2')
 * a = {a: 2}
 */
export const sandbox = (sandbox, script) => {
  try {
    sandbox = sandbox || {};
    script = new vm.Script(script);
    const context = new vm.createContext(sandbox);
    script.runInContext(context, {
      timeout: 3000
    });
    return sandbox
  } catch (err) {
    throw err
  }
};

function trim(str) {
  if (!str) {
    return str;
  }

  str = str + "";

  return str.replace(/(^\s*)|(\s*$)/g, "");
}

function ltrim(str) {
  if (!str) {
    return str;
  }

  str = str + "";

  return str.replace(/(^\s*)/g, "");
}

function rtrim(str) {
  if (!str) {
    return str;
  }

  str = str + "";

  return str.replace(/(\s*$)/g, "");
}

export { trim, ltrim, rtrim };

/**
 * 处理请求参数类型，String 字符串去除两边空格，Number 使用parseInt 转换为数字
 * @params Object {a: ' ab ', b: ' 123 '}
 * @keys Object {a: 'string', b: 'number'}
 * @return Object {a: 'ab', b: 123}
 */
export const handleParams = (params, keys) => {
  if (!params || typeof params !== "object" || !keys || typeof keys !== "object") {
    return false;
  }

  for (let key in keys) {
    let filter = keys[key];
    if (params[key]) {
      switch (filter) {
        case "string":
          params[key] = trim(params[key] + "");
          break;
        case "number":
          params[key] = !isNaN(params[key]) ? parseInt(params[key], 10) : 0;
          break;
        default:
          params[key] = trim(params + "");
      }
    }
  }

  return params;
};

export const validateParams = (schema2, params) => {
  const flag = schema2.closeRemoveAdditional;
  const ajv = new Ajv({
    allErrors: true,
    coerceTypes: true,
    useDefaults: true,
    removeAdditional: !flag
  });

  delete schema2.closeRemoveAdditional;

  const schema = ejs(schema2);

  schema.additionalProperties = !!flag;
  const validate = ajv.compile(schema);
  let valid = validate(params);

  let message = "请求参数 ";
  if (!valid) {
    localize.zh(validate.errors);
    message += ajv.errorsText(validate.errors, { separator: "\n" });
  }

  return {
    valid: valid,
    message: message
  };
};

export const saveLog = (logData) => notificationService.saveLog(logData);

/**
 *
 * @param {*} params 接口定义的参数
 * @param {*} val  接口case 定义的参数值
 */
export function handleParamsValue(params, val) {
  let value = {};
  try {
    params = params;
  } catch (e) { }
  if (params.length === 0 || val.length === 0) {
    return params;
  }
  val.forEach((item) => {
    value[item.name] = item;
  });
  params.forEach((item, index) => {
    if (!value[item.name] || typeof value[item.name] !== "object") {return null;}
    params[index].value = value[item.name].value;
    if (!_.isUndefined(value[item.name].enable)) {
      params[index].enable = value[item.name].enable;
    }
  });
  return params;
}

export const getUserdata = (uid, role) => userService.getUserdata(uid, role);

// 处理mockJs脚本
export const handleMockScript = async function(script, context) {
  let sandbox = {
    header: context.ctx.header,
    query: context.ctx.query,
    body: context.ctx.request.body,
    mockJson: context.mockJson,
    params: Object.assign({}, context.ctx.query, context.ctx.request.body),
    resHeader: context.resHeader,
    httpCode: context.httpCode,
    delay: context.httpCode,
    Random: Mock.Random
  };
  sandbox.cookie = {};

  context.ctx.header.cookie &&
    context.ctx.header.cookie.split(";").forEach(function(Cookie) {
      let parts = Cookie.split("=");
      sandbox.cookie[parts[0].trim()] = (parts[1] || "").trim();
    });
  sandbox = await sandboxFn(sandbox, script);
  sandbox.delay = isNaN(sandbox.delay) ? 0 : +sandbox.delay;

  context.mockJson = sandbox.mockJson;
  context.resHeader = sandbox.resHeader;
  context.httpCode = sandbox.httpCode;
  context.delay = sandbox.delay;
};


export const createWebAPIRequest = function(ops) {
  return new Promise(function(resolve, reject) {
    let req = "";
    let http_client = http.request(
      {
        host: ops.hostname,
        method: "GET",
        port: ops.port,
        path: ops.path
      },
      function(res) {
        res.on("error", function(err) {
          reject(err);
        });
        res.setEncoding("utf8");
        if (res.statusCode != 200) {
          reject({ message: "statusCode != 200" });
        } else {
          res.on("data", function(chunk) {
            req += chunk;
          });
          res.on("end", function() {
            resolve(req);
          });
        }
      }
    );
    http_client.on("error", (e) => {
      reject({ message: `request error: ${e.message}` });
    });
    http_client.end();
  });
}

/**
 * 默认导出：供 app.ts 挂载到 yapi.commons
 */
export default {
  schemaToJson,
  resReturn,
  log,
  fileExist,
  time,
  fieldSelect,
  rand,
  json_parse,
  randStr,
  getIp,
  generatePassword,
  expireDate,
  sendMail,
  validateSearchKeyword,
  filterRes,
  handleVarPath,
  verifyPath,
  sandbox,
  trim,
  ltrim,
  rtrim,
  handleParams,
  validateParams,
  saveLog,
  handleParamsValue,
  getUserdata,
  handleMockScript,
  createWebAPIRequest,
};

