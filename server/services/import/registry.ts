// @ts-nocheck
/**
 * 开放 API 数据导入格式注册表（原 import_data 插件钩子，现静态注册）
 */
import registerPostman from "./postman.js";
import registerHar from "./har.js";
import runSwagger from "./swagger.js";
import { registerYapiJsonImport } from "./yapiJson.js";
import yapi from "../../runtime.js";

/** 各格式导入实现挂载点 */
export const importDataModule = {};

export type ImportDataModule = Record<string, unknown>;

let registryInitialized = false;

/** 注册全部内置导入格式 */
export function initImportDataRegistry() {
  if (registryInitialized) {
    return;
  }
  registerPostman(importDataModule);
  registerHar(importDataModule);
  registerYapiJsonImport(importDataModule);
  importDataModule.swagger = async (res) => {
    try {
      return await runSwagger(res);
    } catch (err) {
      yapi.commons.log(err, "error");
      return false;
    }
  };
  registryInitialized = true;
}

/** 兼容 open-import.registry 旧导出 */
export function ensureImportDataRegistry() {
  initImportDataRegistry();
}
