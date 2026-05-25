/**
 * 项目（project）数据仓储
 */
import { createModelRepository, type ModelInstance } from "./base.repo.js";

import ProjectModel from "../models/project.js";

export type ProjectRepository = ModelInstance;

export const projectRepository =
  createModelRepository<ProjectRepository>(ProjectModel);
