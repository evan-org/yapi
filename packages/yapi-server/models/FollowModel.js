const BaseModel = require("@/models/BaseModel.js");
class FollowModel extends BaseModel {
  constructor() {
    super();
  }
  getName() {
    return "follow";
  }
  getSchema() {
    return {
      uid: { type: Number, required: true },
      projectid: { type: Number, required: true },
      projectname: { type: String, required: true },
      icon: String,
      color: String
    };
  }
  /**
   * @param {Object} data
   * @params {Number} uid 用户id
   * @params {Number} projectid 项目id
   * @params {String} projectname 项目名
   * @params {String} icon 项目图标
   */
  save(data) {
    // 关注
    const saveData = {
      uid: data.uid,
      projectid: data.projectid,
      projectname: data.projectname,
      icon: data.icon,
      color: data.color
    };
    const m = new this.UseModel(saveData);
    return m.save();
  }
  del(projectid, uid) {
    return this.UseModel.remove({ projectid: projectid, uid: uid });
  }
  delByProjectId(projectid) {
    return this.UseModel.remove({ projectid: projectid })
  }
  list(uid) {
    return this.UseModel.find({ uid: uid }).exec();
  }
  listByProjectId(projectid) {
    return this.UseModel.find({ projectid: projectid });
  }
  checkProjectRepeat(uid, projectid) {
    return this.UseModel.countDocuments({ uid: uid, projectid: projectid });
  }
  updateById(id, typeid, data) {
    return this.UseModel.update({ uid: id, projectid: typeid }, data, { runValidators: true });
  }
}
module.exports = FollowModel;
