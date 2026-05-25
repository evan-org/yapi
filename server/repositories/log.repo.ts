/**
 * 日志（log）数据仓储
 */
import { createModelRepository, type LegacyModelInstance } from "./base.repo";

import LogModel from "../models/log.js";

export type LogRepository = LegacyModelInstance;

export const logRepository = createModelRepository<LogRepository>(LogModel);
