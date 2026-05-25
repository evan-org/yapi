// @ts-nocheck
/**
 * 项目模型：委托关系型 projectRepository（供 yapi.getInst 与插件使用）
 */
import baseModel from "./base.js";
import { projectRepository } from "../repositories/project.repo.js";

class projectModel extends baseModel {
  getName() {
    return "project";
  }

  constructor() {
    super();
    this.handleEnvNullData = this.handleEnvNullData.bind(this);
  }

  handleEnvNullData(data) {
    if (!data) {
      return data;
    }
    let isFix = false;
    if (Array.isArray(data.env)) {
      data.env = data.env.map((item) => {
        item.global = item.global.filter((g) => {
          if (!g || typeof g !== "object") {
            isFix = true;
            return false;
          }
          return true;
        });
        return item;
      });
    }
    if (isFix) {
      projectRepository.update(data._id, { env: data.env });
    }
    return data;
  }

  getAuthList(uid) {
    return projectRepository.getAuthList(uid);
  }

  updateMember(data) {
    return projectRepository.updateMember(data);
  }

  save(data) {
    return projectRepository.save(data);
  }

  get(id) {
    return projectRepository.get(id).then(this.handleEnvNullData);
  }

  getByEnv(id) {
    return projectRepository.getByEnv(id).then(this.handleEnvNullData);
  }

  getProjectWithAuth(group_id, uid) {
    return projectRepository.getProjectWithAuth(group_id, uid);
  }

  getBaseInfo(id, select) {
    return projectRepository.getBaseInfo(id, select).then(this.handleEnvNullData);
  }

  getByDomain(domain) {
    return projectRepository.getByDomain(domain).then((row) =>
      row ? this.handleEnvNullData(row) : null
    );
  }

  checkNameRepeat(name, groupid) {
    return projectRepository.checkNameRepeat(name, groupid);
  }

  checkDomainRepeat(domain, basepath) {
    return projectRepository.checkDomainRepeat(domain, basepath);
  }

  list(group_id) {
    return projectRepository.list(group_id);
  }

  getProjectListCount() {
    return projectRepository.getProjectListCount();
  }

  countWithPublic(group_id) {
    return projectRepository.countWithPublic(group_id);
  }

  listWithPaging(group_id, page, limit) {
    return projectRepository.listWithPaging(group_id, page, limit);
  }

  listCount(group_id) {
    return projectRepository.listCount(group_id);
  }

  countByGroupId(group_id) {
    return projectRepository.countByGroupId(group_id);
  }

  del(id) {
    return projectRepository.del(id);
  }

  delByGroupid(groupId) {
    return projectRepository.delByGroupid(groupId);
  }

  up(id, data) {
    return projectRepository.up(id, data);
  }

  addMember(id, data) {
    return projectRepository.addMember(id, data);
  }

  delMember(id, uid) {
    return projectRepository.delMember(id, uid);
  }

  checkMemberRepeat(id, uid) {
    return projectRepository.checkMemberRepeat(id, uid);
  }

  changeMemberRole(id, uid, role) {
    return projectRepository.changeMemberRole(id, uid, role);
  }

  changeMemberEmailNotice(id, uid, notice) {
    return projectRepository.changeMemberEmailNotice(id, uid, notice);
  }

  search(keyword) {
    return projectRepository.search(keyword);
  }
}

export default projectModel;
