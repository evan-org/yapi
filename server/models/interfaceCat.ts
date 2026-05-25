// @ts-nocheck
import yapi from "../runtime.js";
import baseModel from "./base.js";

class interfaceCat extends baseModel {
  getName() {
    return "interface_cat";
  }

  save(data) {
    return this.store.insert(data);
  }

  get(id) {
    return this.store.findById(id);
  }

  checkRepeat(name) {
    return this.store.count({ name });
  }

  list(project_id) {
    return this.store.findMany({ project_id }, { sort: { index: 1 } });
  }

  del(id) {
    return this.store.delete({ _id: id });
  }

  delByProjectId(id) {
    return this.store.delete({ project_id: id });
  }

  up(id, data) {
    data.up_time = yapi.commons.time();
    return this.store.updateById(id, data);
  }

  upCatIndex(id, index) {
    return this.store.updateById(id, { index });
  }
}

export default interfaceCat;
