/**
 * @name responseAction
 * @function responseAction
 * @param {object|number|string} data
 * @param {object|number|string} errcode
 * @param {object|number|string} errmsg
 * @module.exports.responseAction
 * */
module.exports = (data = null, errcode = 500, errmsg = "未知错误，请联系管理员") => ({
  errcode: errcode || 500,
  errmsg: errmsg || "success",
  data: data
});
