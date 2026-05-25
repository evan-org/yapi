// @ts-nocheck
import baseModel from "./base.js";

class avatarModel extends baseModel {
  getName() {
    return "avatar";
  }

  get(uid) {
    return this.store.findOne({ uid });
  }

  async up(uid, basecode, type) {
    const existing = await this.store.findOne({ uid });
    if (existing) {
      await this.store.updateById(existing._id, { type, basecode });
      return existing._id;
    }
    const row = await this.store.insert({ uid, type, basecode });
    return row._id;
  }
}

export default avatarModel;
