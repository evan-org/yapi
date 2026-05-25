// @ts-nocheck
import postmanImport from "./postmanImport.js";

export default function () {
  this.bindHook("import_data", postmanImport);
}
