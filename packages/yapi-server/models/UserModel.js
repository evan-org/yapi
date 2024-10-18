const BaseModel = require("@/models/BaseModel.js");
// import BaseModel from "@/models/base.mjs";
class UserModel extends BaseModel {
  constructor() {
    super();
  }
  getName() {
    return "user";
  }
  getSchema() {
    return {
      username: {
        type: String,
        required: true
      },
      password: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      passsalt: String,
      study: { type: Boolean, default: false },
      role: String,
      add_time: Number,
      up_time: Number,
      type: { type: String, enum: ["site", "third"], default: "site" } // site用户是网站注册用户, third是第三方登录过来的用户
    };
  }
  save(data) {
    const m = new this.UseModel(data);
    return m.save();
  }
  checkRepeat(email) {
    return this.UseModel.countDocuments({ email: email });
  }
  list() {
    return this.UseModel.find().select("_id username email role type  add_time up_time study").exec(); // 显示id name email role
  }
  findByUids(uids) {
    return this.UseModel.find({ _id: { $in: uids } }).select("_id username email role type  add_time up_time study").exec();
  }
  listWithPaging(page, limit) {
    page = parseInt(page);
    limit = parseInt(limit);
    return this.UseModel.find().sort({ _id: -1 }).skip((page - 1) * limit).limit(limit)
      .select("_id username email role type  add_time up_time study")
      .exec();
  }
  listCount() {
    return this.UseModel.countDocuments();
  }
  findByEmail(email) {
    return this.UseModel.findOne({ email: email });
  }
  findById(id) {
    return this.UseModel.findOne({ _id: id });
  }
  del(id) {
    return this.UseModel.remove({ _id: id });
  }
  update(id, data) {
    return this.UseModel.update({ _id: id }, data);
  }
  search(keyword) {
    return this.UseModel.find(
      {
        $or: [{ email: new RegExp(keyword, "i") }, { username: new RegExp(keyword, "i") }]
      },
      {
        passsalt: 0,
        password: 0
      }
    )
      .limit(10);
  }
}
module.exports = UserModel;
