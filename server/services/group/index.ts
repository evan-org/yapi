// @ts-nocheck
/**
 * 分组业务门面：聚合 query / mutation / member 子模块
 */
import BaseService from "../base.service.js";
import { repos } from "./shared.js";
import * as query from "./query.js";
import * as mutation from "./mutation.js";
import * as member from "./member.js";

class GroupService extends BaseService {
  groupModel = repos.groupModel;
  projectModel = repos.projectModel;
  interfaceModel = repos.interfaceModel;
  interfaceColModel = repos.interfaceColModel;
  interfaceCaseModel = repos.interfaceCaseModel;

  getById = query.getById;
  getOrCreatePrivateGroup = query.getOrCreatePrivateGroup;
  getMemberList = query.getMemberList;
  listForUser = query.listForUser;

  create = mutation.create;
  removeGroup = mutation.removeGroup;
  updateGroup = mutation.updateGroup;

  addMembers = member.addMembers;
  changeMemberRole = member.changeMemberRole;
  removeMember = member.removeMember;
}

export default new GroupService();
