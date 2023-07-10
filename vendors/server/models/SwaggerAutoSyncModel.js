const yapi = require("@server/yapi.js");
//
const BaseModel = require("@server/models/BaseModel.js");
//
class swaggerAutoSyncModel extends BaseModel {
  constructor() {
    super();
  }
  getName() {
    return "interface_auto_sync";
  }
  getSchema() {
    return {
      uid: { type: Number },
      project_id: { type: Number, required: true },
      // 是否开启自动同步
      is_sync_open: { type: Boolean, default: false },
      // 自动同步定时任务的cron表达式
      sync_cron: String,
      // 自动同步获取json的url
      sync_json_url: String,
      // 接口合并模式  good,nomarl等等 意思也就是智能合并,完全覆盖等
      sync_mode: String,
      // 上次成功同步接口时间,
      last_sync_time: Number,
      // 上次同步的swagger 文档内容
      old_swagger_content: String,
      add_time: Number,
      up_time: Number,
    };
  }
  getByProjectId(id) {
    return this.UseModel.findOne({ project_id: id })
  }
  save(data) {
    data.up_time = yapi.commons.time();
    const m = new this.UseModel(data);
    return m.save();
  }
  listAll() {
    return this.UseModel.find({})
      .select("_id uid project_id add_time up_time is_sync_open sync_cron sync_json_url sync_mode old_swagger_content last_sync_time")
      .sort({ _id: -1 })
      .exec();
  }
  up(data) {
    let id = data.id;
    delete data.id;
    data.up_time = yapi.commons.time();
    return this.UseModel.update({ _id: id }, data)
  }
  upById(id, data) {
    delete data.id;
    data.up_time = yapi.commons.time();
    return this.UseModel.update({ _id: id }, data)
  }
  del(id) {
    return this.UseModel.remove({ _id: id })
  }
  delByProjectId(projectId) {
    return this.UseModel.remove({ project_id: projectId })
  }
}
module.exports = swaggerAutoSyncModel;
