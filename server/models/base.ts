// @ts-nocheck
/**
 * 数据模型基类：绑定 PostgreSQL JSONB 表 store
 */
import { getTable, parseFieldList } from "../db/store.js";

class baseModel {
  constructor() {
    this.table = this.getName();
    this.store = getTable(this.table);
  }

  getName() {
    return "";
  }

  /** 解析 select 字段串 */
  _fields(spec) {
    return parseFieldList(spec);
  }
}

export default baseModel;
