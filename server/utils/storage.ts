// @ts-nocheck
import storageModel from "../models/storage.js";
import yapi from "../yapi.js";

export default function storageCreator(id) {
  const defaultData = {};
  return {
    getItem: async (name = "") => {
      const inst = yapi.getInst(storageModel);
      let data = await inst.get(id);
      data = data || defaultData;
      if (name) {
        return data[name];
      }
      return data;
    },
    setItem: async (name, value) => {
      const inst = yapi.getInst(storageModel);
      let data = await inst.get(id);
      data = data || defaultData;
      data[name] = value;
      await inst.save(id, data);
    },
  };
}
