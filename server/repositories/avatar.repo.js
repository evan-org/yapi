"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.avatarRepository = void 0;
/**
 * 用户头像（avatar）数据仓储
 */
const base_repo_1 = require("./base.repo");
const AvatarModel = require("../models/avatar.js");
exports.avatarRepository = (0, base_repo_1.createModelRepository)(AvatarModel);
