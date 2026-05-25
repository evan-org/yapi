// @ts-nocheck
import baseModel from "./base.js";

class stroageModel extends baseModel {
  getName() {
    return "storage";
  }

  save(key, data = {}, isInsert = false) {
    const saveData = {
      key,
      data: JSON.stringify(data, null, 2),
    };
    if (isInsert) {
      return this.store.insert(saveData);
    }
    return this.store.updateWhere({ key }, saveData, 1);
  }

  del(key) {
    return this.store.delete({ key });
  }

  get(key) {
    return this.store.findOne({ key }).then((row) => {
      this.save(key, {});
      if (!row) {
        return null;
      }
      const raw = row.data;
      try {
        return JSON.parse(raw);
      } catch (e) {
        return {};
      }
    });
  }
}

export default stroageModel;
