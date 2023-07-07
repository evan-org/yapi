const BaseModel = require("@server/models/BaseModel.js");
//
class WikiModel extends BaseModel {
  constructor() {
    super();
  }
  getName() {
    return "wiki";
  }
  getSchema() {
    return {
      project_id: { type: Number, required: true },
      username: String,
      uid: { type: Number, required: true },
      edit_uid: { type: Number, default: 0 },
      desc: String,
      markdown: String,
      add_time: Number,
      up_time: Number
    };
  }
  save(data) {
    const m = new this.model(data);
    return m.save();
  }
  get(project_id) {
    return this.model.findOne({ project_id: project_id }).exec();
  }
  up(id, data) {
    return this.model.update({ _id: id }, data, { runValidators: true });
  }
  upEditUid(id, uid) {
    return this.model.update({ _id: id }, { edit_uid: uid }, { runValidators: true });
  }
}
module.exports = WikiModel;