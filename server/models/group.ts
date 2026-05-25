// @ts-nocheck
import yapi from "../runtime.js";
import baseModel from "./base.js";

class groupModel extends baseModel {
  getName() {
    return "group";
  }

  save(data) {
    return this.store.insert(data);
  }

  get(id) {
    return this.store.findById(id);
  }

  updateMember(data) {
    return this.store.mutateWhere({ "members.uid": data.uid }, (doc) => {
      const members = doc.members || [];
      for (const m of members) {
        if (m && m.uid == data.uid) {
          m.username = data.username;
          m.email = data.email;
        }
      }
      doc.members = members;
      return doc;
    });
  }

  getByPrivateUid(uid) {
    return this.store.findOne(
      { uid, type: "private" },
      { fields: this._fields("group_name _id group_desc add_time up_time type custom_field1") }
    );
  }

  getGroupById(id) {
    return this.store.findOne(
      { _id: id },
      { fields: this._fields("uid group_name group_desc add_time up_time type custom_field1") }
    );
  }

  checkRepeat(name) {
    return this.store.count({ group_name: name });
  }

  getGroupListCount() {
    return this.store.count({ type: "public" });
  }

  addMember(id, data) {
    const items = Array.isArray(data) ? data : [data];
    return this.store.mutateById(id, (doc) => {
      doc.members = doc.members || [];
      doc.members.push(...items);
      return doc;
    });
  }

  delMember(id, uid) {
    return this.store.mutateById(id, (doc) => {
      doc.members = (doc.members || []).filter((m) => m && m.uid != uid);
      return doc;
    });
  }

  changeMemberRole(id, uid, role) {
    return this.store.mutateById(id, (doc) => {
      const m = (doc.members || []).find((x) => x && x.uid == uid);
      if (m) {
        m.role = role;
      }
      return doc;
    });
  }

  checkMemberRepeat(id, uid) {
    return this.store.count({ _id: id, "members.uid": uid });
  }

  list() {
    return this.store.findMany(
      { type: "public" },
      { fields: this._fields("group_name _id group_desc add_time up_time type uid custom_field1") }
    );
  }

  getAuthList(uid) {
    return this.store.findMany(
      {
        $or: [{ "members.uid": uid, type: "public" }, { type: "public", uid }],
      },
      { fields: this._fields("_id group_name group_desc add_time up_time type uid custom_field1") }
    );
  }

  findByGroups(ids = []) {
    return this.store.findMany({ _id: { $in: ids }, type: "public" });
  }

  del(id) {
    return this.store.delete({ _id: id });
  }

  up(id, data) {
    return this.store.updateById(id, {
      custom_field1: data.custom_field1,
      group_name: data.group_name,
      group_desc: data.group_desc,
      up_time: yapi.commons.time(),
    });
  }

  getcustomFieldName(name) {
    return this.store.findMany(
      { "custom_field1.name": name, "custom_field1.enable": true },
      { fields: ["_id"] }
    );
  }

  search(keyword) {
    return this.store.findMany({ group_name: new RegExp(keyword, "i") }, { limit: 10 });
  }
}

export default groupModel;
