"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageRepository = exports.avatarRepository = exports.tokenRepository = exports.logRepository = exports.followRepository = exports.groupRepository = exports.userRepository = exports.projectRepository = exports.interfaceColRepository = exports.interfaceCaseRepository = exports.interfaceCatRepository = exports.interfaceRepository = exports.createModelRepository = void 0;
/**
 * 数据仓储统一导出（编译后为 CommonJS，供 controllers 使用）
 */
var base_repo_1 = require("./base.repo");
Object.defineProperty(exports, "createModelRepository", { enumerable: true, get: function () { return base_repo_1.createModelRepository; } });
var interface_repo_1 = require("./interface.repo");
Object.defineProperty(exports, "interfaceRepository", { enumerable: true, get: function () { return interface_repo_1.interfaceRepository; } });
var interfaceCat_repo_1 = require("./interfaceCat.repo");
Object.defineProperty(exports, "interfaceCatRepository", { enumerable: true, get: function () { return interfaceCat_repo_1.interfaceCatRepository; } });
var interfaceCase_repo_1 = require("./interfaceCase.repo");
Object.defineProperty(exports, "interfaceCaseRepository", { enumerable: true, get: function () { return interfaceCase_repo_1.interfaceCaseRepository; } });
var interfaceCol_repo_1 = require("./interfaceCol.repo");
Object.defineProperty(exports, "interfaceColRepository", { enumerable: true, get: function () { return interfaceCol_repo_1.interfaceColRepository; } });
var project_repo_1 = require("./project.repo");
Object.defineProperty(exports, "projectRepository", { enumerable: true, get: function () { return project_repo_1.projectRepository; } });
var user_repo_1 = require("./user.repo");
Object.defineProperty(exports, "userRepository", { enumerable: true, get: function () { return user_repo_1.userRepository; } });
var group_repo_1 = require("./group.repo");
Object.defineProperty(exports, "groupRepository", { enumerable: true, get: function () { return group_repo_1.groupRepository; } });
var follow_repo_1 = require("./follow.repo");
Object.defineProperty(exports, "followRepository", { enumerable: true, get: function () { return follow_repo_1.followRepository; } });
var log_repo_1 = require("./log.repo");
Object.defineProperty(exports, "logRepository", { enumerable: true, get: function () { return log_repo_1.logRepository; } });
var token_repo_1 = require("./token.repo");
Object.defineProperty(exports, "tokenRepository", { enumerable: true, get: function () { return token_repo_1.tokenRepository; } });
var avatar_repo_1 = require("./avatar.repo");
Object.defineProperty(exports, "avatarRepository", { enumerable: true, get: function () { return avatar_repo_1.avatarRepository; } });
var storage_repo_1 = require("./storage.repo");
Object.defineProperty(exports, "storageRepository", { enumerable: true, get: function () { return storage_repo_1.storageRepository; } });
