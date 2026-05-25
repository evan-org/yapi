/**
 * 用户（user）数据仓储
 */
import { createModelRepository, type ModelInstance } from "./base.repo.js";

import UserModel from "../models/user.js";

export type UserRepository = ModelInstance;

export const userRepository = createModelRepository<UserRepository>(UserModel);
