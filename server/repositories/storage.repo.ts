/**
 * 键值存储（storage）数据仓储
 */
import { createModelRepository, type ModelInstance } from "./base.repo.js";

import StorageModel from "../models/storage.js";

export type StorageRepository = ModelInstance;

export const storageRepository =
  createModelRepository<StorageRepository>(StorageModel);
