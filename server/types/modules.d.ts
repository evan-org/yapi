/**
 * 无官方类型或 CJS 遗留模块声明（ESM default export）
 */
declare module "runtime.js" {
  import type { YapiRuntime } from "./global.js";
  const runtime: YapiRuntime;
  export default runtime;
}

declare module "mockjs";
declare module "easy-json-schema";
declare module "json-schema-faker";
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
declare module "extend";

declare module "json5" {
  const json5: {
    parse: (text: string) => unknown;
    stringify: (v: unknown) => string;
  };
  export default json5;
}
