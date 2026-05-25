/**
 * 分组（group）数据仓储
 */
import { createModelRepository, type LegacyModelInstance } from "./base.repo";

import GroupModel from "../models/group.js";

export type GroupRepository = LegacyModelInstance;

export const groupRepository = createModelRepository<GroupRepository>(GroupModel);
