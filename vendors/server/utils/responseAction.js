/**
 * @name responseAction
 * @function responseAction
 * @param {object|number|string} data
 * @param {object|number|string} errcode
 * @param {object|number|string} errmsg
 * */
module.exports = (data, errcode, errmsg) => ({
  errcode: errcode || 500,
  errmsg: errmsg || "success",
  data: data
});
