// @ts-nocheck
/**
 * 项目业务门面：聚合 query / mutation / member / token 子模块
 */
import BaseService from "../base.service.js";
import { repos } from "./shared.js";
import * as query from "./query.js";
import * as mutation from "./mutation.js";
import * as member from "./member.js";
import * as token from "./token.js";

class ProjectService extends BaseService {
  projectModel = repos.projectModel;
  groupModel = repos.groupModel;
  interfaceModel = repos.interfaceModel;
  interfaceColModel = repos.interfaceColModel;
  interfaceCaseModel = repos.interfaceCaseModel;
  followModel = repos.followModel;
  catModel = repos.catModel;
  tokenModel = repos.tokenModel;

  search = query.search;
  getDetail = query.getDetail;
  fetchSwaggerJson = query.fetchSwaggerJson;
  listByGroup = query.listByGroup;
  getMemberList = query.getMemberList;
  checkNameAvailable = query.checkNameAvailable;
  getProjectEnv = query.getProjectEnv;

  deleteById = mutation.deleteById;
  copyProject = mutation.copyProject;
  createProject = mutation.createProject;
  updateProject = mutation.updateProject;
  updateAppearance = mutation.updateAppearance;
  updateEnv = mutation.updateEnv;
  updateTag = mutation.updateTag;

  addMembers = member.addMembers;
  delMember = member.delMember;
  changeMemberEmailNotice = member.changeMemberEmailNotice;
  changeMemberRole = member.changeMemberRole;

  getOrCreateProjectToken = token.getOrCreateProjectToken;
  refreshProjectToken = token.refreshProjectToken;
}

export default new ProjectService();
