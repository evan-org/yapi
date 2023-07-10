const BaseModel = require("@server/models/BaseModel.js");
const mongoose = require("mongoose");
class StorageModel extends BaseModel {
  constructor() {
    super()
    const storageCol = mongoose.connection.db.collection("storage");
    storageCol.createIndex({ key: 1 }, { unique: true });
  }
  getName() {
    return "storage";
  }
  getSchema() {
    return {
      key: { type: Number, required: true },
      data: {
        type: String,
        default: ""
      } // 用于原始数据存储
    };
  }
  save(key, data = {}, isInsert = false) {
    let saveData = {
      key,
      data: JSON.stringify(data, null, 2)
    };
    if (isInsert) {
      const m = new this.UseModel(saveData);
      return m.save();
    }
    return this.UseModel.updateOne({
      key
    }, saveData)
  }
  del(key) {
    return this.UseModel.remove({
      key
    });
  }
  get(key) {
    return this.UseModel
    .findOne({
      key
    })
    .exec().then((data) => {
      this.save(key, {})
      if (!data) {
        return null;
      }
      data = data.toObject().data;
      try {
        return JSON.parse(data)
      } catch (e) {
        return {}
      }
    });
  }
}
module.exports = StorageModel;
