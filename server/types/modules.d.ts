/**
 * 无官方类型或 CJS 模块声明
 */
declare module "yapi.js" {
  import type { YapiRuntime } from "./global";
  const yapi: YapiRuntime;
  export = yapi;
}

declare module "mockjs";
declare module "easy-json-schema";
declare module "json-schema-faker";
declare module "mongoose-auto-increment";
declare module "cpu-load";
declare module "safeify";
declare module "compare-versions";
declare module "generate-schema";
declare module "jsondiffpatch";
declare module "js-base64";
declare module "sha.js";
declare module "sha1";
declare module "swagger-client";
declare module "markdown-it-anchor";
declare module "markdown-it-table-of-contents";
declare module "html-pdf";
declare module "json5" {
  const json5: { parse: (text: string) => unknown; stringify: (v: unknown) => string };
  export = json5;
}

declare module "*/config.json" {
  const value: import("./global").YapiWebConfig;
  export = value;
}
