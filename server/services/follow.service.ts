// @ts-nocheck
/**
 * 关注项目业务逻辑
 */
import yapi from "../runtime.js";
import { followRepository, projectRepository } from "../repositories/index.js";
import BaseService from "./base.service.js";

class FollowService extends BaseService {
  constructor() {
    super();
    this.followModel = followRepository;
    this.projectModel = projectRepository;
  }

  /**
   * 获取用户关注列表
   * @param {number|string} uid
   */
  async listByUser(uid) {
    if (!uid) {
      return { ok: false, code: 400, message: "用户id不能为空" };
    }
    const list = await this.followModel.list(uid);
    return { ok: true, data: { list } };
  }

  /**
   * 取消关注
   * @param {number|string} uid
   * @param {number} projectid
   */
  async unfollow(uid, projectid) {
    if (!projectid) {
      return { ok: false, code: 400, message: "项目id不能为空" };
    }
    const exists = await this.followModel.checkProjectRepeat(uid, projectid);
    if (exists === 0) {
      return { ok: false, code: 401, message: "项目未关注" };
    }
    const result = await this.followModel.del(projectid, uid);
    return { ok: true, data: result };
  }

  /**
   * 添加关注
   * @param {number|string} uid
   * @param {number} projectid
   */
  async follow(uid, projectid) {
    if (!projectid) {
      return { ok: false, code: 400, message: "项目id不能为空" };
    }
    const exists = await this.followModel.checkProjectRepeat(uid, projectid);
    if (exists) {
      return { ok: false, code: 401, message: "项目已关注" };
    }
    const project = await this.projectModel.get(projectid);
    const data = {
      uid,
      projectid,
      projectname: project.name,
      icon: project.icon,
      color: project.color,
    };
    let result = await this.followModel.save(data);
    result = yapi.commons.fieldSelect(result, [
      "_id",
      "uid",
      "projectid",
      "projectname",
      "icon",
      "color",
    ]);
    return { ok: true, data: result };
  }
}

export default new FollowService();
