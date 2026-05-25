// @ts-nocheck
import baseModel from "./base.js";

class tokenModel extends baseModel {
  getName() {
    return "token";
  }

  save(data) {
    return this.store.insert(data);
  }

  get(project_id) {
    return this.store.findOne({ project_id });
  }

  findId(token) {
    return this.store.findOne({ token }, { fields: ["project_id"] });
  }

  up(project_id, token) {
    return this.store.updateWhere({ project_id }, { token });
  }
}

export default tokenModel;
