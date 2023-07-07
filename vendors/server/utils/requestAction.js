const path = require("path");
const Ajv = require("ajv");
const easyJsonScheme = require("easy-json-schema");
const { WEBROOT_LOG } = require("@server/yapi.js");
const fs = require("fs-extra");
/* ******************************************************************************** */
/**
 * 参数校验
 * @param {object} schema2
 * @param {object} params
 */
const validateParams = (schema2, params) => {
  const flag = schema2.closeRemoveAdditional;
  const ajv = new Ajv({
    allErrors: true,
    coerceTypes: true,
    useDefaults: true,
    removeAdditional: !flag
  });
  let localize = require("ajv-i18n");
  delete schema2.closeRemoveAdditional;
  const schema = easyJsonScheme(schema2);
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
/**
 * 打印日志
 * @param {string} message
 * @param {string} type
 * **/
const logger = (message, type) => {
  if (!message) {
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
  f(type + ":", message);
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const logfile = path.join(WEBROOT_LOG, year + "-" + month + ".log");
  if (typeof message === "object") {
    if (message instanceof Error) {
      message = message.message;
    } else {
      message = JSON.stringify(message);
    }
  }
  // let data = (new Date).toLocaleString() + '\t|\t' + type + '\t|\t' + msg + '\n';
  let data = `[ ${new Date().toLocaleString()} ] [ ${type} ] ${message}\n`;
  fs.writeFileSync(logfile, data, {
    flag: "a"
  });
};
/**
 * router 出参
 * @param {String} errMsg
 * @param {Number} code
 * @param {Object|Array} data
 * **/
const responseAction = (data, code, errMsg) => ({
  code: code,
  errcode: code || 0,
  errmsg: errMsg || "成功！",
  message: errMsg || "成功！",
  data: data || null
});
/**
 * router 入参
 * @param ctx
 * @param {*} Controller controller
 * @param {*} action controller action_name
 */
const requestAction = async(ctx, Controller, action = "") => {
  // console.log("exports.createAction ==> ", router, baseurl, RouterController, action, path, method, ws);
  // console.log("exports.createAction ==> 1", router[method]);
  if (!action) {
    ctx.body = responseAction(null, 40011, "服务器出错...");
    return ctx
  }
  try {
    const inst = new Controller(ctx);
    await inst.init(ctx);
    ctx.params = Object.assign({}, ctx.request.query, ctx.request.body, ctx.params);
    //
    if (inst.schemaMap && typeof inst.schemaMap === "object" && inst.schemaMap[action]) {
      let validResult = validateParams(inst.schemaMap[action], ctx.params);
      if (!validResult.valid) {
        return (ctx.body = responseAction(null, 400, validResult.message));
      }
    }
    //
    if (inst.$auth === true) {
      await inst[action].call(inst, ctx);
    } else {
      return (ctx.body = responseAction(null, 40011, "请登录..."));
    }
  } catch (err) {
    logger(err, "error");
    return (ctx.body = responseAction(null, 40011, "服务器出错..."));
  }
  return ctx;
};
//
module.exports = requestAction;


