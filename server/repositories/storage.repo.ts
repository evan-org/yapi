/**
 * 键值存储（storage）数据仓储
 */
import { createModelRepository, type LegacyModelInstance } from "./base.repo";

const StorageModel = require("../models/storage.js");

export type StorageRepository = LegacyModelInstance;

export const storageRepository =
  createModelRepository<StorageRepository>(StorageModel);
