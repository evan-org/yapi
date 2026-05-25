/**
 * 项目 Token 数据仓储
 */
import { createModelRepository, type ModelInstance } from "./base.repo.js";

import TokenModel from "../models/token.js";

export type TokenRepository = ModelInstance;

export const tokenRepository = createModelRepository<TokenRepository>(TokenModel);
