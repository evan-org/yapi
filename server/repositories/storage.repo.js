"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageRepository = void 0;
/**
 * 键值存储（storage）数据仓储
 */
const base_repo_1 = require("./base.repo");
const StorageModel = require("../models/storage.js");
exports.storageRepository = (0, base_repo_1.createModelRepository)(StorageModel);
