"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interfaceCaseRepository = void 0;
/**
 * 测试用例（interface_case）数据仓储
 */
const base_repo_1 = require("./base.repo");
const InterfaceCaseModel = require("../models/interfaceCase.js");
exports.interfaceCaseRepository = (0, base_repo_1.createModelRepository)(InterfaceCaseModel);
