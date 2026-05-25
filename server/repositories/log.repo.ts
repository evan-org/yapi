/**
 * 日志（log）数据仓储
 */
import { createModelRepository, type LegacyModelInstance } from "./base.repo";

const LogModel = require("../models/log.js");

export type LogRepository = LegacyModelInstance;

export const logRepository = createModelRepository<LogRepository>(LogModel);
