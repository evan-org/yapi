// @ts-nocheck
/**
 * 接口业务门面：聚合 query / category / mutation / upload 子模块，保持对外 API 不变
 */
import BaseService from "../base.service.js";
import { repos } from "./shared.js";
import * as query from "./query.js";
import * as category from "./category.js";
import * as mutation from "./mutation.js";
import * as upload from "./upload.js";

class InterfaceService extends BaseService {
  interfaceModel = repos.interfaceModel;
  catModel = repos.catModel;
  caseModel = repos.caseModel;
  groupModel = repos.groupModel;
  projectModel = repos.projectModel;
  userModel = repos.userModel;

  getProjectBaseInfo = query.getProjectBaseInfo;
  listMenuByProject = query.listMenuByProject;
  listCategories = query.listCategories;
  getById = query.getById;
  requireInterface = query.requireInterface;
  requireCategory = query.requireCategory;
  schemaToJson = query.schemaToJson;
  queryByCustomField = query.queryByCustomField;
  listOpenByProject = query.listOpenByProject;
  listByProject = query.listByProject;
  listByCategory = query.listByCategory;
  checkEditConflict = query.checkEditConflict;
  releaseEditLock = query.releaseEditLock;

  updateCategory = category.updateCategory;
  deleteCategory = category.deleteCategory;
  addCategory = category.addCategory;
  updateCatIndexBatch = category.updateCatIndexBatch;

  deleteInterface = mutation.deleteInterface;
  updateIndexBatch = mutation.updateIndexBatch;
  autoAddTag = mutation.autoAddTag;
  saveInterface = mutation.saveInterface;
  addInterface = mutation.addInterface;
  diffNoticeHtml = mutation.diffNoticeHtml;
  updateInterface = mutation.updateInterface;

  parseUploadApis = upload.parseUploadApis;
  batchUploadInterfaces = upload.batchUploadInterfaces;
}

export default new InterfaceService();
