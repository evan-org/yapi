const yapi = require("@/yapi.js");
//
const BaseModel = require("@/models/BaseModel.js");
let mongoose = require("mongoose");
let Schema = mongoose.Schema;
class LogModel extends BaseModel {
  constructor() {
    super();
  }
  getName() {
    return "log";
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
  /**
   * @param {String} data.content log内容
   * @param {Enum} data.type log类型， ['user', 'group', 'interface', 'project', 'other']
   * @param {Number} data.uid 用户id
   * @param {String} data.username 用户名
   * @param {Number} data.typeid 类型id
   * @param {Number} data.add_time 时间
   */
  save(data) {
    let saveData = {
      content: data.content,
      type: data.type,
      uid: data.uid,
      username: data.username,
      typeid: data.typeid,
      add_time: yapi.commons.time(),
      data: data.data
    };
    const m = new this.UseModel(saveData);
    return m.save();
  }
  del(id) {
    return this.UseModel.remove({ _id: id });
  }
  list(typeid, type) {
    return this.UseModel.find({ typeid: typeid, type: type }).exec();
  }
  listWithPaging(typeid, type, page, limit, selectValue) {
    page = parseInt(page);
    limit = parseInt(limit);
    const params = { type: type, typeid: typeid };
    if (selectValue === "wiki") {
      params["data.type"] = selectValue;
    }
    if (selectValue && !isNaN(selectValue)) {
      params["data.interface_id"] = +selectValue;
    }
    return this.UseModel.find(params).sort({ add_time: -1 }).skip((page - 1) * limit).limit(limit).exec();
  }
  listWithPagingByGroup(typeid, pidList, page, limit) {
    page = parseInt(page);
    limit = parseInt(limit);
    return this.UseModel.find({
      $or: [
        {
          type: "project",
          typeid: { $in: pidList }
        },
        {
          type: "group",
          typeid: typeid
        }
      ]
    }).sort({ add_time: -1 }).skip((page - 1) * limit).limit(limit)
    .exec();
  }
  listCountByGroup(typeid, pidList) {
    return this.UseModel.countDocuments({
      $or: [
        {
          type: "project",
          typeid: { $in: pidList }
        },
        {
          type: "group",
          typeid: typeid
        }
      ]
    });
  }
  listCount(typeid, type, selectValue) {
    const params = {
      type: type,
      typeid: typeid
    };
    if (selectValue === "wiki") {
      params["data.type"] = selectValue;
    }
    if (selectValue && !isNaN(selectValue)) {
      params["data.interface_id"] = +selectValue;
    }
    return this.UseModel.countDocuments(params);
  }
  listWithCatid(typeid, type, interfaceId) {
    const params = {
      type: type,
      typeid: typeid
    };
    if (interfaceId && !isNaN(interfaceId)) {
      params["data.interface_id"] = +interfaceId;
    }
    return this.UseModel
    .find(params)
    .sort({ add_time: -1 })
    .limit(1)
    .select("uid content type username typeid add_time")
    .exec();
  }
}
module.exports = LogModel;
