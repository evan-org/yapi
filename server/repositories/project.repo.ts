/**
 * 项目（project）数据仓储
 */
import { createModelRepository, type LegacyModelInstance } from "./base.repo.js";

import ProjectModel from "../models/project.js";

export type ProjectRepository = LegacyModelInstance;

export const projectRepository =
  createModelRepository<ProjectRepository>(ProjectModel);
