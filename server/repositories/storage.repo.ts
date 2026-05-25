/**
 * 键值存储（storage）数据仓储
 */
import { createModelRepository, type LegacyModelInstance } from "./base.repo";

import StorageModel from "../models/storage.js";

export type StorageRepository = LegacyModelInstance;

export const storageRepository =
  createModelRepository<StorageRepository>(StorageModel);
