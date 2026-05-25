// @ts-nocheck
import yapi from "runtime.js";
import baseModel from "models/base";

class statisMockModel extends baseModel {
  getName() {
    return "statis_mock";
  }

  countByGroupId(id) {
    return this.store.count({ group_id: id });
  }

  save(data) {
    return this.store.insert(data);
  }

  getTotalCount() {
    return this.store.count();
  }

  getDayCount(timeInterval) {
    return this.store.countByDateRange(timeInterval[0], timeInterval[1]);
  }

  list() {
    return this.store.findMany({}, { fields: ["date"] });
  }

  up(id, data) {
    data.up_time = yapi.commons.time();
    return this.store.updateById(id, data);
  }
}

export default statisMockModel;
