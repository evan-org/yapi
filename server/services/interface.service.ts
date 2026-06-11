/**
 * 接口模块门面：实现已拆分至 services/interface/，此处保持 import 路径稳定
 */
export {
  handleHeaders,
  buildQueryPathFromUrl,
  applyStatusTagFilter,
  mergeSaveResBody,
} from "./interface.util.js";

export { default } from "./interface/index.js";
