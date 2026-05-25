// @ts-nocheck
/**
 * 键值存储模型：委托关系型 storageRepository
 */
import baseModel from "./base.js";
import { storageRepository } from "../repositories/storage.repo.js";

class stroageModel extends baseModel {
  getName() {
    return "storage";
  }

  save(key: string, data: Record<string, unknown> = {}, isInsert = false) {
    return storageRepository.save(key, data, isInsert);
  }

  del(key: string) {
    return storageRepository.del(key);
  }

  get(key: string) {
    return storageRepository.get(key);
  }
}

export default stroageModel;
