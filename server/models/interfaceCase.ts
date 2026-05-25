// @ts-nocheck
import yapi from "../runtime.js";
import baseModel from "./base.js";

class interfaceCase extends baseModel {
  getName() {
    return "interface_case";
  }

  save(data) {
    return this.store.insert(data);
  }

  getInterfaceCaseListCount() {
    return this.store.count();
  }

  get(id) {
    return this.store.findById(id);
  }

  list(col_id, select) {
    select = select || "casename uid col_id _id index interface_id project_id";
    const opts =
      select === "all" ? {} : { fields: this._fields(select) };
    return this.store.findMany({ col_id }, opts);
  }

  del(id) {
    return this.store.delete({ _id: id });
  }

  delByProjectId(id) {
    return this.store.delete({ project_id: id });
  }

  delByInterfaceId(id) {
    return this.store.delete({ interface_id: id });
  }

  delByCol(id) {
    return this.store.delete({ col_id: id });
  }

  up(id, data) {
    data.up_time = yapi.commons.time();
    return this.store.updateById(id, data);
  }

  upCaseIndex(id, index) {
    return this.store.updateById(id, { index });
  }
}

export default interfaceCase;
