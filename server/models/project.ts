// @ts-nocheck
import yapi from "../runtime.js";
import baseModel from "./base.js";

class projectModel extends baseModel {
  getName() {
    return "project";
  }

  constructor() {
    super();
    this.handleEnvNullData = this.handleEnvNullData.bind(this);
  }

  getAuthList(uid) {
    return this.store.findMany(
      {
        $or: [
          { "members.uid": uid, project_type: "private" },
          { uid, project_type: "private" },
          { project_type: "public" },
        ],
      },
      { fields: ["group_id"] }
    );
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

  save(data) {
    return this.store.insert(data);
  }

  handleEnvNullData(data) {
    if (!data) {
      return data;
    }
    let isFix = false;
    if (Array.isArray(data.env)) {
      data.env = data.env.map((item) => {
        item.global = item.global.filter((g) => {
          if (!g || typeof g !== "object") {
            isFix = true;
            return false;
          }
          return true;
        });
        return item;
      });
    }
    if (isFix) {
      this.store.updateById(data._id, { env: data.env });
    }
    return data;
  }

  get(id) {
    return this.store.findById(id).then(this.handleEnvNullData);
  }

  getByEnv(id) {
    return this.store
      .findById(id, { fields: ["env", "_id"] })
      .then(this.handleEnvNullData);
  }

  getProjectWithAuth(group_id, uid) {
    return this.store.count({ group_id, "members.uid": uid });
  }

  getBaseInfo(id, select) {
    const fields = this._fields(
      select ||
        "_id uid name basepath switch_notice desc group_id project_type env icon color add_time up_time pre_script after_script project_mock_script is_mock_open strice is_json5 tag"
    );
    return this.store.findById(id, { fields }).then(this.handleEnvNullData);
  }

  getByDomain(domain) {
    return this.store.findMany({ prd_host: domain }).then((rows) => {
      if (!rows.length) {
        return null;
      }
      return this.handleEnvNullData(rows[0]);
    });
  }

  checkNameRepeat(name, groupid) {
    return this.store.count({ name, group_id: groupid });
  }

  checkDomainRepeat(domain, basepath) {
    return this.store.count({ prd_host: domain, basepath });
  }

  list(group_id) {
    return this.store.findMany(
      { group_id },
      {
        fields: this._fields(
          "_id uid name basepath switch_notice desc group_id project_type color icon env add_time up_time"
        ),
        sort: { _id: -1 },
      }
    );
  }

  getProjectListCount() {
    return this.store.count();
  }

  countWithPublic(group_id) {
    return this.store.count({ group_id, project_type: "public" });
  }

  listWithPaging(group_id, page, limit) {
    page = parseInt(page);
    limit = parseInt(limit);
    return this.store.findMany(
      { group_id },
      { sort: { _id: -1 }, skip: (page - 1) * limit, limit }
    );
  }

  listCount(group_id) {
    return this.store.count({ group_id });
  }

  countByGroupId(group_id) {
    return this.store.count({ group_id });
  }

  del(id) {
    return this.store.delete({ _id: id });
  }

  delByGroupid(groupId) {
    return this.store.delete({ group_id: groupId });
  }

  up(id, data) {
    data.up_time = yapi.commons.time();
    return this.store.updateById(id, data);
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

  checkMemberRepeat(id, uid) {
    return this.store.count({ _id: id, "members.uid": uid });
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

  changeMemberEmailNotice(id, uid, notice) {
    return this.store.mutateById(id, (doc) => {
      const m = (doc.members || []).find((x) => x && x.uid == uid);
      if (m) {
        m.email_notice = notice;
      }
      return doc;
    });
  }

  search(keyword) {
    return this.store.findMany({ name: new RegExp(keyword, "ig") }, { limit: 10 });
  }
}

export default projectModel;
