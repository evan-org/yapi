const yapi = require("@server/yapi.js");
//
const BaseModel = require("@server/models/BaseModel.js");
class GroupModel extends BaseModel {
  constructor() {
    super();
  }
  getName() {
    return "group";
  }
  getSchema() {
    return {
      uid: Number,
      group_name: String,
      group_desc: String,
      add_time: Number,
      up_time: Number,
      type: { type: String, default: "public", enum: ["public", "private"] },
      members: [
        {
          uid: Number,
          role: { type: String, enum: ["owner", "dev"] },
          username: String,
          email: String
        }
      ],
      custom_field1: {
        name: String,
        enable: { type: Boolean, default: false }
      }
      // custom_field2: {
      //   name: String,
      //   enable: { type: Boolean, default: false }
      // },
      // custom_field3: {
      //   name: String,
      //   enable: { type: Boolean, default: false }
      // }
    };
  }
  save(data) {
    const m = new this.UseModel(data);
    return m.save();
  }
  get(id) {
    return this.UseModel.findOne({ _id: id }).exec();
  }
  updateMember(data) {
    return this.UseModel.update(
      {
        "members.uid": data.uid
      },
      {
        $set: {
          "members.$.username": data.username,
          "members.$.email": data.email
        }
      },
      { multi: true }
    );
  }
  getByPrivateUid(uid) {
    return this.UseModel.findOne({ uid: uid, type: "private" })
      .select("group_name _id group_desc add_time up_time type custom_field1")
      .exec();
  }
  getGroupById(id) {
    return this.UseModel.findOne({ _id: id }).select("uid group_name group_desc add_time up_time type custom_field1").exec();
  }
  checkRepeat(name) {
    return this.UseModel.countDocuments({ group_name: name });
  }
  //  分组数量统计
  getGroupListCount() {
    return this.UseModel.countDocuments({ type: "public" });
  }
  addMember(id, data) {
    return this.UseModel.update({ _id: id }, {
      // $push: { members: data },
      $push: { members: { $each: data } }
    });
  }
  delMember(id, uid) {
    return this.UseModel.update({ _id: id }, { $pull: { members: { uid: uid } } });
  }
  changeMemberRole(id, uid, role) {
    return this.UseModel.update({ _id: id, "members.uid": uid }, { $set: { "members.$.role": role } });
  }
  checkMemberRepeat(id, uid) {
    return this.UseModel.countDocuments({ _id: id, "members.uid": uid });
  }
  list() {
    return this.UseModel.find({ type: "public" })
      .select("group_name _id group_desc add_time up_time type uid custom_field1")
      .exec();
  }
  getAuthList(uid) {
    return this.UseModel.find({
      $or: [
        { "members.uid": uid, "type": "public" },
        { "type": "public", uid }
      ]
    }).select(" _id group_name group_desc add_time up_time type uid custom_field1")
      .exec();
  }
  findByGroups(ids = []) {
    return this.UseModel.find({ _id: { $in: ids }, type: "public" })
  }
  del(id) {
    return this.UseModel.remove({ _id: id });
  }
  up(id, data) {
    return this.UseModel.update(
      { _id: id },
      {
        custom_field1: data.custom_field1,
        group_name: data.group_name,
        group_desc: data.group_desc,
        up_time: yapi.commons.time()
      }
    );
  }
  getcustomFieldName(name) {
    return this.UseModel
      .find({ "custom_field1.name": name, "custom_field1.enable": true })
      .select("_id")
      .exec();
  }
  search(keyword) {
    return this.UseModel
      .find({ group_name: new RegExp(keyword, "i") })
      .limit(10);
  }
}
module.exports = GroupModel;
