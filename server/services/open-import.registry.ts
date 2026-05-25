/**
 * 开放 API 导入处理器注册表（插件通过 import_data hook 注入）
 */
import yapi from "../runtime.js";
import type { YapiRuntime } from "../types/global.js";

/** 各格式导入实现挂载点（postman / swagger / …） */
export const importDataModule: Record<string, unknown> = {};

let registryInitialized = false;

/**
 * 延迟触发 import_data 钩子，避免单测加载 open.service 时 plugin 尚未挂载 emitHook
 */
export function ensureImportDataRegistry() {
  if (registryInitialized) {
    return;
  }
  const hook = (yapi as YapiRuntime).emitHook;
  if (typeof hook !== "function") {
    throw new Error("import_data 注册失败：插件系统尚未初始化");
  }
  hook("import_data", importDataModule);
  registryInitialized = true;
}
