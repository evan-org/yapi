/**
 * 用户（user）数据仓储
 */
import { createModelRepository, type LegacyModelInstance } from "./base.repo.js";

import UserModel from "../models/user.js";

export type UserRepository = LegacyModelInstance;

export const userRepository = createModelRepository<UserRepository>(UserModel);
