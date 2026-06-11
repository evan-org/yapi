// @ts-nocheck
/**
 * 测试集合业务门面：聚合 query / col / case / script 子模块
 */
import BaseService from "../base.service.js";
import { repos } from "./shared.js";
import * as query from "./query.js";
import * as col from "./col.js";
import * as caseOps from "./case.js";
import * as script from "./script.js";
import { requestParamsToObj, uniqueFieldValues } from "./util.js";

class InterfaceColService extends BaseService {
  colModel = repos.colModel;
  caseModel = repos.caseModel;
  interfaceModel = repos.interfaceModel;
  projectModel = repos.projectModel;

  getProjectBaseInfo = query.getProjectBaseInfo;
  requireCol = query.requireCol;
  requireCase = query.requireCase;
  getProjectByColId = query.getProjectByColId;
  getProjectForVariableParamsCol = query.getProjectForVariableParamsCol;
  listWithCases = query.listWithCases;
  getCaseDetail = query.getCaseDetail;
  getCaseEnvList = query.getCaseEnvList;
  getCaseListByVariableParams = query.getCaseListByVariableParams;

  addCol = col.addCol;
  deleteCol = col.deleteCol;
  updateCol = col.updateCol;
  updateColIndexBatch = col.updateColIndexBatch;

  addCase = caseOps.addCase;
  deleteCase = caseOps.deleteCase;
  updateCase = caseOps.updateCase;
  addCaseList = caseOps.addCaseList;
  cloneCaseList = caseOps.cloneCaseList;
  updateCaseIndexBatch = caseOps.updateCaseIndexBatch;

  buildCaseListResponse = script.buildCaseListResponse;
  fetchCaseList = script.fetchCaseList;
  executeCaseScript = script.executeCaseScript;
  runCaseScript = script.runCaseScript;

  requestParamsToObj = requestParamsToObj;
  uniqueFieldValues = uniqueFieldValues;
}

export default new InterfaceColService();
