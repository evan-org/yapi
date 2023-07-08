const yapi = require("@server/yapi.js");
//
const BaseModel = require("@server/models/BaseModel.js");

class InterfaceColModel extends BaseModel {
  constructor() {
    super();
  }
  getName() {
    return "interface_col";
  }

  getSchema() {
    return {
      name: { type: String, required: true },
      uid: { type: Number, required: true },
      project_id: { type: Number, required: true },
      desc: String,
      add_time: Number,
      up_time: Number,
      index: { type: Number, default: 0 },
      test_report: { type: String, default: "{}" },
      checkHttpCodeIs200: {
        type: Boolean,
        default: false
      },
      checkResponseSchema: {
        type: Boolean,
        default: false
      },
      checkResponseField: {
        name: {
          type: String,
          required: true,
          default: "code"
        },
        value: {
          type: String,
          required: true,
          default: "0"
        },
        enable: {
          type: Boolean,
          default: false
        }
      },
      checkScript: {
        content: {
          type: String
        },
        enable: {
          type: Boolean,
          default: false
        }
      }
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
    return this.UseModel.find({ project_id: project_id }).select("name uid project_id desc add_time up_time, index").exec();
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

  upColIndex(id, index) {
    return this.UseModel.update({ _id: id }, { index: index });
  }
}

module.exports = InterfaceColModel;
