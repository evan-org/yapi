// @ts-nocheck
/**
 * 开放 API 导入处理器注册表（插件通过 import_data hook 注入）
 */
import yapi from "../runtime.js";

export const importDataModule = {};

let registryInitialized = false;

/**
 * 延迟触发 import_data 钩子，避免单测加载 open.service 时 plugin 尚未挂载 emitHook
 */
export function ensureImportDataRegistry() {
  if (registryInitialized) {
    return;
  }
  if (typeof yapi.emitHook !== "function") {
    throw new Error("import_data 注册失败：插件系统尚未初始化");
  }
  yapi.emitHook("import_data", importDataModule);
  registryInitialized = true;
}
