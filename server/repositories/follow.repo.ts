/**
 * 关注（follow）数据仓储
 */
import { createModelRepository, type LegacyModelInstance } from "./base.repo";

const FollowModel = require("../models/follow.js");

export type FollowRepository = LegacyModelInstance;

export const followRepository =
  createModelRepository<FollowRepository>(FollowModel);
