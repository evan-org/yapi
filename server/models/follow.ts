// @ts-nocheck
/**
 * 项目关注模型：委托关系型 followRepository
 */
import baseModel from "./base.js";
import { followRepository } from "../repositories/follow.repo.js";

class followModel extends baseModel {
  getName() {
    return "follow";
  }

  save(data) {
    return followRepository.save(data);
  }

  del(projectid, uid) {
    return followRepository.del(projectid, uid);
  }

  delByProjectId(projectid) {
    return followRepository.delByProjectId(projectid);
  }

  list(uid) {
    return followRepository.list(uid);
  }

  listByProjectId(projectid) {
    return followRepository.listByProjectId(projectid);
  }

  checkProjectRepeat(uid, projectid) {
    return followRepository.checkProjectRepeat(uid, projectid);
  }

  updateById(id, typeid, data) {
    return followRepository.updateById(id, typeid, data);
  }
}

export default followModel;
