// @ts-nocheck
import yapi from "../runtime.js";
import baseModel from "./base.js";

class interfaceModel extends baseModel {
  getName() {
    return "interface";
  }

  save(data) {
    return this.store.insert(data);
  }

  get(id) {
    return this.store.findById(id);
  }

  getBaseinfo(id) {
    return this.store.findById(id, {
      fields: this._fields("path method uid title project_id cat_id status"),
    });
  }

  getVar(project_id, method) {
    return this.store.findMany(
      { project_id, type: "var", method },
      { fields: ["_id", "path"] }
    );
  }

  getByQueryPath(project_id, path, method) {
    return this.store.findMany({
      project_id,
      "query_path.path": path,
      method,
    });
  }

  getByPath(project_id, path, method, select) {
    const fields = this._fields(
      select ||
        "_id title uid path method project_id catid edit_uid status add_time up_time type query_path req_query req_headers req_params req_body_type req_body_form req_body_other res_body_type custom_field_value res_body res_body_is_json_schema req_body_is_json_schema"
    );
    return this.store.findMany({ project_id, path, method }, { fields });
  }

  checkRepeat(id, path, method) {
    return this.store.count({ project_id: id, path, method });
  }

  countByProjectId(id) {
    return this.store.count({ project_id: id });
  }

  list(project_id, select) {
    const fields = this._fields(
      select || "_id title uid path method project_id catid edit_uid status add_time up_time"
    );
    return this.store.findMany({ project_id }, { fields, sort: { title: 1 } });
  }

  listWithPage(project_id, page, limit) {
    page = parseInt(page);
    limit = parseInt(limit);
    return this.store.findMany(
      { project_id },
      {
        sort: { title: 1 },
        skip: (page - 1) * limit,
        limit,
        fields: this._fields(
          "_id title uid path method project_id catid api_opened edit_uid status add_time up_time tag"
        ),
      }
    );
  }

  listByPid(project_id) {
    return this.store.findMany({ project_id }, { sort: { title: 1 } });
  }

  getInterfaceListCount() {
    return this.store.count();
  }

  listByCatid(catid, select) {
    const fields = this._fields(
      select ||
        "_id title uid path method project_id catid edit_uid status add_time up_time index tag"
    );
    return this.store.findMany({ catid }, { fields, sort: { index: 1 } });
  }

  listByCatidWithPage(catid, page, limit) {
    page = parseInt(page);
    limit = parseInt(limit);
    return this.store.findMany(
      { catid },
      {
        sort: { index: 1 },
        skip: (page - 1) * limit,
        limit,
        fields: this._fields(
          "_id title uid path method project_id catid edit_uid api_opened status add_time up_time index tag"
        ),
      }
    );
  }

  listByOptionWithPage(option, page, limit) {
    page = parseInt(page);
    limit = parseInt(limit);
    return this.store.findMany(option, {
      sort: { index: 1 },
      skip: (page - 1) * limit,
      limit,
      fields: this._fields(
        "_id title uid path method project_id catid edit_uid api_opened status add_time up_time index tag"
      ),
    });
  }

  listByInterStatus(catid, status) {
    const option =
      status === "open" ? { catid, api_opened: true } : { catid };
    return this.store.findMany(option, { sort: { title: 1 } });
  }

  del(id) {
    return this.store.delete({ _id: id });
  }

  delByCatid(id) {
    return this.store.delete({ catid: id });
  }

  delByProjectId(id) {
    return this.store.delete({ project_id: id });
  }

  up(id, data) {
    data.up_time = yapi.commons.time();
    return this.store.updateById(id, data);
  }

  upEditUid(id, uid) {
    return this.store.updateById(id, { edit_uid: uid });
  }

  getcustomFieldValue(id, value) {
    return this.store.findMany(
      { project_id: id, custom_field_value: value },
      {
        fields: this._fields(
          "title uid path method edit_uid status desc add_time up_time type query_path req_query req_headers req_params req_body_type req_body_form req_body_other res_body_type custom_field_value"
        ),
      }
    );
  }

  listCount(option) {
    return this.store.count(option);
  }

  upIndex(id, index) {
    return this.store.updateById(id, { index });
  }

  search(keyword) {
    return this.store.findMany(
      {
        $or: [{ title: new RegExp(keyword, "ig") }, { path: new RegExp(keyword, "ig") }],
      },
      { limit: 10 }
    );
  }
}

export default interfaceModel;
