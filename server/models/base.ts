// @ts-nocheck
/**
 * 数据模型基类：通过 yapi.db 注册 PostgreSQL JSONB 集合
 */
import yapi from "../runtime.js";

/**
 * 子类需实现 getSchema()、getName()；schema 仅作文档结构参考，不入库校验
 */
class baseModel {
  constructor() {
    this.name = this.getName();
    this.model = yapi.db(this.name, this.getSchema());
  }

  isNeedAutoIncrement() {
    return true;
  }

  getPrimaryKey() {
    return "_id";
  }

  getSchema() {
    yapi.commons.log("Model Class need getSchema function", "error");
  }

  getName() {
    yapi.commons.log("Model Class need name", "error");
  }
}

export default baseModel;
