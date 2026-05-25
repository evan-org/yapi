/**
 * 关注（follow）数据仓储
 */
import { createModelRepository, type ModelInstance } from "./base.repo.js";

import FollowModel from "../models/follow.js";

export type FollowRepository = ModelInstance;

export const followRepository =
  createModelRepository<FollowRepository>(FollowModel);
