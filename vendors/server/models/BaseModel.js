const yapi = require("@server/yapi.js");
//
const mongoose = require("mongoose");
const autoIncrement = require("@server/helper/mongooseAutoIncrement.js");

/**
 * 所有的model都需要继承BaseModel, 且需要 getSchema和getName方法，不然会报错
 */

class BaseModel {
  constructor() {
    this.schema = new mongoose.Schema(this.getSchema());
    this.name = this.getName();
    if (this.isNeedAutoIncrement() === true) {
      this.schema.plugin(autoIncrement.plugin, {
        model: this.name,
        field: this.getPrimaryKey(),
        startAt: 11,
        incrementBy: yapi.commons.rand(1, 10)
      });
    }

    this.model = yapi.db(this.name, this.schema);
  }

  isNeedAutoIncrement() {
    return true;
  }

  /**
   * 可通过覆盖此方法生成其他自增字段
   */
  getPrimaryKey() {
    return "_id";
  }

  /**
   * 获取collection的schema结构
   */
  getSchema() {
    yapi.commons.log("Model Class need getSchema function", "error");
    return {}
  }
  /**
   *
   * */
  getName() {
    yapi.commons.log("Model Class need name", "error");
    return ""
  }
}

module.exports = BaseModel;
