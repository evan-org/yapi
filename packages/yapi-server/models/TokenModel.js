const BaseModel = require("@/models/BaseModel.js");
class TokenModel extends BaseModel {
  constructor() {
    super();
  }
  getName() {
    return "token";
  }
  getSchema() {
    return { project_id: { type: Number, required: true }, token: String };
  }
  save(data) {
    const m = new this.UseModel(data);
    return m.save();
  }
  get(project_id) {
    return this.UseModel.findOne({ project_id: project_id });
  }
  findId(token) {
    return this.UseModel.findOne({ token: token }).select("project_id").exec();
  }
  up(project_id, token) {
    return this.UseModel.update({ project_id: project_id }, { token: token });
  }
}
module.exports = TokenModel;
