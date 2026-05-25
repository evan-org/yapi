// @ts-nocheck
/**
 * 数据模型基类：关系型表委托 repository，非关系型表绑定 JSONB store
 */
import { getTable, parseFieldList } from "../db/store.js";
import { JSONB_COLLECTIONS } from "../db/table.js";

class baseModel {
  constructor() {
    this.table = this.getName();
    // 仅整表 JSONB 集合才绑定 store（当前为空）
    if ((JSONB_COLLECTIONS as readonly string[]).includes(this.table)) {
      this.store = getTable(this.table);
    }
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
