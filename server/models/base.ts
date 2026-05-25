// @ts-nocheck
/**
 * 数据模型基类：业务表均委托 repository，整表 JSONB 表可绑定 store
 */
import { getTable } from "../db/store.js";
import { JSONB_COLLECTIONS } from "../db/table.js";

class baseModel {
  constructor() {
    this.table = this.getName();
    // 仅整表 JSONB 集合才绑定 store（当前为空，供后续插件扩展）
    if ((JSONB_COLLECTIONS as readonly string[]).includes(this.table)) {
      this.store = getTable(this.table);
    }
  }

  getName() {
    return "";
  }
}

export default baseModel;
