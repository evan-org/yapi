const yapi = require("@/yapi.js");
//
const BaseModel = require("@/models/BaseModel.js");
let mongoose = require("mongoose");
let Schema = mongoose.Schema;

class MockModel extends BaseModel {
  constructor() {
    super();
    let Col = mongoose.connection.db.collection("statis_mock");
    Col.createIndex({
      interface_id: 1
    });
    Col.createIndex({
      project_id: 1
    });
    Col.createIndex({
      group_id: 1
    });
    Col.createIndex({
      time: 1
    });
    Col.createIndex({
      date: 1
    });
  }
  getName() {
    return "mock";
  }
  getSchema() {
    return {
      uid: { type: Number, required: true },
      typeid: { type: Number, required: true },
      type: {
        type: String,
        enum: ["user", "group", "interface", "project", "other", "interface_col"],
        required: true
      },
      content: { type: String, required: true },
      username: { type: String, required: true },
      add_time: Number,
      data: Schema.Types.Mixed // 用于原始数据存储
    };
  }
}

module.exports = MockModel;
