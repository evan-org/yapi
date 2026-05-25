/**
 * 项目 Token 数据仓储
 */
import { createModelRepository, type LegacyModelInstance } from "./base.repo.js";

import TokenModel from "../models/token.js";

export type TokenRepository = LegacyModelInstance;

export const tokenRepository = createModelRepository<TokenRepository>(TokenModel);
