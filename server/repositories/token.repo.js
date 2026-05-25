"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenRepository = void 0;
/**
 * 项目 Token 数据仓储
 */
const base_repo_1 = require("./base.repo");
const TokenModel = require("../models/token.js");
exports.tokenRepository = (0, base_repo_1.createModelRepository)(TokenModel);
