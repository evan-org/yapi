// @ts-nocheck
import baseModel from "./base.js";

class userModel extends baseModel {
  getName() {
    return "user";
  }

  save(data) {
    return this.store.insert(data);
  }

  checkRepeat(email) {
    return this.store.count({ email });
  }

  list() {
    return this.store.findMany(
      {},
      { fields: this._fields("_id username email role type add_time up_time study") }
    );
  }

  findByUids(uids) {
    return this.store.findMany(
      { _id: { $in: uids } },
      { fields: this._fields("_id username email role type add_time up_time study") }
    );
  }

  listWithPaging(page, limit) {
    page = parseInt(page);
    limit = parseInt(limit);
    return this.store.findMany(
      {},
      {
        sort: { _id: -1 },
        skip: (page - 1) * limit,
        limit,
        fields: this._fields("_id username email role type add_time up_time study"),
      }
    );
  }

  listCount() {
    return this.store.count();
  }

  findByEmail(email) {
    return this.store.findOne({ email });
  }

  findById(id) {
    return this.store.findOne({ _id: id });
  }

  del(id) {
    return this.store.delete({ _id: id });
  }

  update(id, data) {
    return this.store.updateById(id, data);
  }

  search(keyword) {
    return this.store.findMany(
      {
        $or: [{ email: new RegExp(keyword, "i") }, { username: new RegExp(keyword, "i") }],
      },
      { limit: 10, exclude: ["passsalt", "password"] }
    );
  }
}

export default userModel;
