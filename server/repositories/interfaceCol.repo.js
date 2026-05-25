"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interfaceColRepository = void 0;
/**
 * 测试集合（interface_col）数据仓储
 */
const base_repo_1 = require("./base.repo");
const InterfaceColModel = require("../models/interfaceCol.js");
exports.interfaceColRepository = (0, base_repo_1.createModelRepository)(InterfaceColModel);
