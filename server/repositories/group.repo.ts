/**
 * 分组（group）数据仓储
 */
import { createModelRepository, type ModelInstance } from "./base.repo.js";

import GroupModel from "../models/group.js";

export type GroupRepository = ModelInstance;

export const groupRepository = createModelRepository<GroupRepository>(GroupModel);
