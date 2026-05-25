// @ts-nocheck
/**
 * 服务端注册 Postman 数据导入钩子
 */
module.exports = function () {
  this.bindHook("import_data", require("./postmanImport"));
};
