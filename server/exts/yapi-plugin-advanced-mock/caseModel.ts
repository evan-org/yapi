// @ts-nocheck
import yapi from "runtime.js";
import baseModel from "models/base";

class caseModel extends baseModel {
  getName() {
    return "adv_mock_case";
  }

  get(data) {
    return this.store.findOne(data);
  }

  list(id) {
    return this.store.findMany({ interface_id: id });
  }

  delByInterfaceId(interface_id) {
    return this.store.delete({ interface_id });
  }

  delByProjectId(project_id) {
    return this.store.delete({ project_id });
  }

  save(data) {
    data.up_time = yapi.commons.time();
    return this.store.insert(data);
  }

  up(data) {
    const id = data.id;
    delete data.id;
    data.up_time = yapi.commons.time();
    return this.store.updateById(id, data);
  }

  del(id) {
    return this.store.delete({ _id: id });
  }
}

export default caseModel;
