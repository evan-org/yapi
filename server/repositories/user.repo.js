"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
/**
 * 用户（user）数据仓储
 */
const base_repo_1 = require("./base.repo");
const UserModel = require("../models/user.js");
exports.userRepository = (0, base_repo_1.createModelRepository)(UserModel);
