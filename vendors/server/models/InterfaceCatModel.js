const yapi = require("@server/yapi.js");
//
const BaseModel = require("@server/models/BaseModel.js");
/**
 * 接口分类
 */
class InterfaceCatModel extends BaseModel {
  constructor() {
    super();
  }
  getName() {
    return "interface_cat";
  }
  getSchema() {
    return {
      name: { type: String, required: true },
      uid: { type: Number, required: true },
      project_id: { type: Number, required: true },
      desc: String,
      add_time: Number,
      up_time: Number,
      index: { type: Number, default: 0 }
    };
  }
  save(data) {
    const m = new this.UseModel(data);
    return m.save();
  }
  get(id) {
    return this.UseModel.findOne({ _id: id }).exec();
  }
  checkRepeat(name) {
    return this.UseModel.countDocuments({ name: name });
  }
  list(project_id) {
    return this.UseModel.find({ project_id: project_id }).sort({ index: 1 }).exec();
  }
  del(id) {
    return this.UseModel.remove({ _id: id });
  }
  delByProjectId(id) {
    return this.UseModel.remove({ project_id: id });
  }
  up(id, data) {
    data.up_time = yapi.commons.time();
    return this.UseModel.update({ _id: id }, data);
  }
  upCatIndex(id, index) {
    return this.UseModel.update({ _id: id }, { index: index });
  }
}
module.exports = InterfaceCatModel;
