"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRepository = void 0;
/**
 * 项目（project）数据仓储
 */
const base_repo_1 = require("./base.repo");
const ProjectModel = require("../models/project.js");
exports.projectRepository = (0, base_repo_1.createModelRepository)(ProjectModel);
