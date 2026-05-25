// @ts-nocheck
import harImport from "./harImport.js";

/**
 * 服务端注册 HAR 数据导入钩子
 */
export default function () {
  this.bindHook("import_data", harImport);
}
