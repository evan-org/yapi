"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRepository = void 0;
/**
 * 日志（log）数据仓储
 */
const base_repo_1 = require("./base.repo");
const LogModel = require("../models/log.js");
exports.logRepository = (0, base_repo_1.createModelRepository)(LogModel);
