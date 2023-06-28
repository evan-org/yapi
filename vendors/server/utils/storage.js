const storageModel = require("@server/models/StorageModel.js");
const yapi = require("@server/yapi.js");
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
      let inst = yapi.getInst(storageModel);
      let curData = await inst.get(id);
      let data = curData || defaultData;
      let result;
      data[name] = value;
      if (!curData) {
        result = await inst.save(id, data, true)
      } else {
        result = await inst.save(id, data, false)
      }
      return result;
    }
  }
}
//
module.exports = storageCreator;
