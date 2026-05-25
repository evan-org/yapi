// @ts-nocheck
import yapi from "runtime.js";
import baseModel from "models/base";

class syncModel extends baseModel {
  getName() {
    return "interface_auto_sync";
  }

  getByProjectId(id) {
    return this.store.findOne({ project_id: id });
  }

  delByProjectId(project_id) {
    return this.store.delete({ project_id });
  }

  save(data) {
    data.up_time = yapi.commons.time();
    return this.store.insert(data);
  }

  listAll() {
    return this.store.findMany(
      {},
      {
        fields: this._fields(
          "_id uid project_id add_time up_time is_sync_open sync_cron sync_json_url sync_mode old_swagger_content last_sync_time"
        ),
        sort: { _id: -1 },
      }
    );
  }

  up(data) {
    const id = data.id;
    delete data.id;
    data.up_time = yapi.commons.time();
    return this.store.updateById(id, data);
  }

  upById(id, data) {
    delete data.id;
    data.up_time = yapi.commons.time();
    return this.store.updateById(id, data);
  }

  del(id) {
    return this.store.delete({ _id: id });
  }

  delByProjectId(projectId) {
    return this.store.delete({ project_id: projectId });
  }
}

export default syncModel;
