/**
 * 关注项目业务逻辑
 */
import commons from "../utils/commons.js";
import { followRepository, projectRepository } from "../repositories/index.js";
import BaseService from "./base.service.js";
import { ok, fail } from "./service-result.js";

class FollowService extends BaseService {
  followModel = followRepository;
  projectModel = projectRepository;

  /**
   * 获取用户关注列表
   */
  async listByUser(uid: number | string | undefined | null) {
    if (!uid) {
      return fail(400, "用户id不能为空");
    }
    const list = await this.followModel.list(uid);
    return ok({ list });
  }

  /**
   * 取消关注
   */
  async unfollow(uid: number | string, projectid: number | undefined | null) {
    if (!projectid) {
      return fail(400, "项目id不能为空");
    }
    const exists = await this.followModel.checkProjectRepeat(uid, projectid);
    if (exists === 0) {
      return fail(401, "项目未关注");
    }
    const result = await this.followModel.del(projectid, uid);
    return ok(result);
  }

  /**
   * 添加关注
   */
  async follow(uid: number | string, projectid: number | undefined | null) {
    if (!projectid) {
      return fail(400, "项目id不能为空");
    }
    const exists = await this.followModel.checkProjectRepeat(uid, projectid);
    if (exists) {
      return fail(401, "项目已关注");
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
    result = commons.fieldSelect(result, [
      "_id",
      "uid",
      "projectid",
      "projectname",
      "icon",
      "color",
    ]);
    return ok(result);
  }
}

export default new FollowService();
