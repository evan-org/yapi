/**
 * 用户头像（avatar）数据仓储
 */
import { createModelRepository, type LegacyModelInstance } from "./base.repo";

import AvatarModel from "../models/avatar.js";

export type AvatarRepository = LegacyModelInstance;

export const avatarRepository =
  createModelRepository<AvatarRepository>(AvatarModel);
