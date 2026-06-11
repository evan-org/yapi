// @ts-nocheck
/**
 * 用户业务门面：聚合 auth / profile / query / admin 子模块
 */
import BaseService from "../base.service.js";
import { repos, toSessionUser } from "./shared.js";
import * as auth from "./auth.js";
import * as profile from "./profile.js";
import * as query from "./query.js";
import * as admin from "./admin.js";
import { createPrivateGroup } from "./group.js";

class UserService extends BaseService {
  userModel = repos.userModel;
  groupModel = repos.groupModel;
  projectModel = repos.projectModel;
  interfaceModel = repos.interfaceModel;
  avatarModel = repos.avatarModel;

  login = auth.login;
  loginByLdap = auth.loginByLdap;
  ensureThirdPartyUser = auth.ensureThirdPartyUser;
  changePassword = auth.changePassword;
  register = auth.register;

  markStudyDone = profile.markStudyDone;
  updateProfile = profile.updateProfile;
  uploadAvatar = profile.uploadAvatar;
  getAvatarBuffer = profile.getAvatarBuffer;

  listPaged = query.listPaged;
  findById = query.findById;
  search = query.search;
  loadNavigationChain = query.loadNavigationChain;
  getUserdata = query.getUserdata;
  getMemberProfile = query.getMemberProfile;

  remove = admin.remove;
  createPrivateGroup = createPrivateGroup;

  toSessionUser = toSessionUser;
}

export default new UserService();
