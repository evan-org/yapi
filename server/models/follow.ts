// @ts-nocheck
import baseModel from "./base.js";

class followModel extends baseModel {
  getName() {
    return "follow";
  }

  save(data) {
    return this.store.insert({
      uid: data.uid,
      projectid: data.projectid,
      projectname: data.projectname,
      icon: data.icon,
      color: data.color,
    });
  }

  del(projectid, uid) {
    return this.store.delete({ projectid, uid });
  }

  delByProjectId(projectid) {
    return this.store.delete({ projectid });
  }

  list(uid) {
    return this.store.findMany({ uid });
  }

  listByProjectId(projectid) {
    return this.store.findMany({ projectid });
  }

  checkProjectRepeat(uid, projectid) {
    return this.store.count({ uid, projectid });
  }

  updateById(id, typeid, data) {
    return this.store.updateWhere({ uid: id, projectid: typeid }, data);
  }
}

export default followModel;
