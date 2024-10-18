const BaseModel = require("@server/models/BaseModel.js");

class AvatarModel extends BaseModel {
  constructor() {
    super();
  }
  getName() {
    return "avatar";
  }

  getSchema() {
    return { uid: { type: Number, required: true }, basecode: String, type: String };
  }

  get(uid) {
    return this.UseModel.findOne({ uid: uid });
  }

  up(uid, basecode, type) {
    return this.UseModel.update({ uid: uid }, { type: type, basecode: basecode }, { upsert: true });
  }
}

module.exports = AvatarModel;
