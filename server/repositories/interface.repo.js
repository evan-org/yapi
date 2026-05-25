"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interfaceRepository = void 0;
/**
 * 接口（interface）数据仓储
 */
const base_repo_1 = require("./base.repo");
const InterfaceModel = require("../models/interface.js");
/** 接口集合仓储单例 */
exports.interfaceRepository = (0, base_repo_1.createModelRepository)(InterfaceModel);
