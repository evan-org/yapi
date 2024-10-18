/**
 * @name responseAction
 * @function responseAction
 * @param {object|number|string} data
 * @param {object|number|string} errcode
 * @param {object|number|string} errmsg
 * @module.exports.responseAction
 * */
module.exports = (data = null, errcode = 0, errmsg = "未知错误，请联系管理员") => ({
  errcode: errcode || 0,
  errmsg: errmsg || "success",
  data: data
});
