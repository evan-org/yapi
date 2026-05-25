/**
 * 日志（log）数据仓储
 */
import { createModelRepository, type ModelInstance } from "./base.repo.js";

import LogModel from "../models/log.js";

export type LogRepository = ModelInstance;

export const logRepository = createModelRepository<LogRepository>(LogModel);
