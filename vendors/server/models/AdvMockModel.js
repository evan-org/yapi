const yapi = require("@server/yapi.js");
//
const BaseModel = require("@server/models/BaseModel.js");

class AdvMockModel extends BaseModel {
  constructor() {
    super();
  }
  getName() {
    return "adv_mock";
  }

  getSchema() {
    return {
      interface_id: { type: Number, required: true },
      project_id: { type: Number, required: true },
      enable: { type: Boolean, default: false },
      mock_script: String,
      uid: String,
      up_time: Number
    };
  }

  get(interface_id) {
    return this.UseModel.findOne({ interface_id: interface_id });
  }

  delByInterfaceId(interface_id) {
    return this.UseModel.remove({ interface_id: interface_id });
  }

  delByProjectId(project_id) {
    return this.UseModel.remove({ project_id: project_id });
  }

  save(data) {
    data.up_time = yapi.commons.time();
    const m = new this.UseModel(data);
    return m.save();
  }

  up(data) {
    data.up_time = yapi.commons.time();
    return this.UseModel.update(
      {
        interface_id: data.interface_id
      },
      {
        uid: data.uid,
        up_time: data.up_time,
        mock_script: data.mock_script,
        enable: data.enable
      },
      {
        upsert: true
      }
    )
  }

}

module.exports = AdvMockModel;
