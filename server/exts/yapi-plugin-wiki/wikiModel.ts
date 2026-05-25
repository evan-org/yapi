// @ts-nocheck
import baseModel from "models/base";

class wikiModel extends baseModel {
  getName() {
    return "wiki";
  }

  save(data) {
    return this.store.insert(data);
  }

  get(project_id) {
    return this.store.findOne({ project_id });
  }

  up(id, data) {
    return this.store.updateById(id, data);
  }

  upEditUid(id, uid) {
    return this.store.updateById(id, { edit_uid: uid });
  }
}

export default wikiModel;
