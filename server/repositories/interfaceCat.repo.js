"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interfaceCatRepository = void 0;
/**
 * 接口分类（interface_cat）数据仓储
 */
const base_repo_1 = require("./base.repo");
const InterfaceCatModel = require("../models/interfaceCat.js");
exports.interfaceCatRepository = (0, base_repo_1.createModelRepository)(InterfaceCatModel);
