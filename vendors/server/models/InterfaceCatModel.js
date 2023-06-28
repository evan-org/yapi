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
    const m = new this.model(data);
    return m.save();
  }
  get(id) {
    return this.model.findOne({ _id: id }).exec();
  }
  checkRepeat(name) {
    return this.model.countDocuments({ name: name });
  }
  list(project_id) {
    return this.model.find({ project_id: project_id }).sort({ index: 1 }).exec();
  }
  del(id) {
    return this.model.remove({ _id: id });
  }
  delByProjectId(id) {
    return this.model.remove({ project_id: id });
  }
  up(id, data) {
    data.up_time = yapi.commons.time();
    return this.model.update({ _id: id }, data);
  }
  upCatIndex(id, index) {
    return this.model.update({ _id: id }, { index: index });
  }
}
module.exports = InterfaceCatModel;
