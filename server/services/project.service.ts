/**
 * 项目模块门面：实现已拆分至 services/project/，此处保持 import 路径稳定
 */
export { normalizeBasepath, hasDuplicateField } from "./project.util.js";

export { default } from "./project/index.js";
