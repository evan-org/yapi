"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.followRepository = void 0;
/**
 * 关注（follow）数据仓储
 */
const base_repo_1 = require("./base.repo");
const FollowModel = require("../models/follow.js");
exports.followRepository = (0, base_repo_1.createModelRepository)(FollowModel);
