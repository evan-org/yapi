/**
 * 用户头像（avatar）数据仓储
 */
import { createModelRepository, type ModelInstance } from "./base.repo.js";

import AvatarModel from "../models/avatar.js";

export type AvatarRepository = ModelInstance;

export const avatarRepository =
  createModelRepository<AvatarRepository>(AvatarModel);
