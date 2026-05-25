/**
 * 测试集合（interface_col）数据仓储
 */
import { createModelRepository, type LegacyModelInstance } from "./base.repo";

const InterfaceColModel = require("../models/interfaceCol.js");

export type InterfaceColRepository = LegacyModelInstance;

export const interfaceColRepository =
  createModelRepository<InterfaceColRepository>(InterfaceColModel);
