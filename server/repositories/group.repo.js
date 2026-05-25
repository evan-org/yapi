"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupRepository = void 0;
/**
 * 分组（group）数据仓储
 */
const base_repo_1 = require("./base.repo");
const GroupModel = require("../models/group.js");
exports.groupRepository = (0, base_repo_1.createModelRepository)(GroupModel);
