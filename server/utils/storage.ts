// @ts-nocheck
import { storageRepository } from "../repositories/index.js";

export default function storageCreator(id) {
  const defaultData = {};
  return {
    getItem: async (name = "") => {
      const inst = storageRepository;
      let data = await inst.get(id);
      data = data || defaultData;
      if (name) {
        return data[name];
      }
      return data;
    },
    setItem: async (name, value) => {
      const inst = storageRepository;
      let data = await inst.get(id);
      data = data || defaultData;
      data[name] = value;
      await inst.save(id, data);
    },
  };
}
