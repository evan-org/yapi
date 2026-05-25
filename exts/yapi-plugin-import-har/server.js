/**
 * 服务端注册 HAR 数据导入钩子
 */
module.exports = function () {
  this.bindHook("import_data", require("./harImport"));
};
