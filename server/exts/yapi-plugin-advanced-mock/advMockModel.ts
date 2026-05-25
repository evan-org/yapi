// @ts-nocheck
import yapi from "runtime.js";
import baseModel from "models/base";

class advMockModel extends baseModel {
  getName() {
    return "adv_mock";
  }

  get(interface_id) {
    return this.store.findOne({ interface_id });
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

  async up(data) {
    data.up_time = yapi.commons.time();
    const existing = await this.store.findOne({ interface_id: data.interface_id });
    const patch = {
      uid: data.uid,
      up_time: data.up_time,
      mock_script: data.mock_script,
      enable: data.enable,
    };
    if (existing) {
      await this.store.updateById(existing._id, patch);
      return existing;
    }
    return this.store.insert({
      interface_id: data.interface_id,
      project_id: data.project_id,
      ...patch,
    });
  }
}

export default advMockModel;
