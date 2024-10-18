const yapi = require("@/yapi.js");
//
const storageModel = require("@/models/StorageModel.js");
//
function storageCreator(id) {
  const defaultData = {}
  return {
    getItem: async(name = "") => {
      let inst = yapi.getInst(storageModel);
      let data = await inst.get(id);
      data = data || defaultData;
      if (name) {
        return data[name];
      }
      return data;
    },
    setItem: async(name = "", value) => {
      let storageInset = yapi.getInst(storageModel);
      let curData = await storageInset.get(id);
      let data = curData || defaultData;
      let result;
      data[name] = value;
      if (!curData) {
        result = await storageInset.save(id, data, true)
      } else {
        result = await storageInset.save(id, data, false)
      }
      return result;
    }
  }
}
//
module.exports = storageCreator;
