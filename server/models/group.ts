// @ts-nocheck
/**
 * 分组模型：委托 groupRepository
 */
import baseModel from "./base.js";
import { groupRepository } from "../repositories/group.repo.js";

class groupModel extends baseModel {
  getName() {
    return "group";
  }

  save(data) {
    return groupRepository.save(data);
  }

  get(id) {
    return groupRepository.get(id);
  }

  updateMember(data) {
    return groupRepository.updateMember(data);
  }

  getByPrivateUid(uid) {
    return groupRepository.getByPrivateUid(uid);
  }

  getGroupById(id) {
    return groupRepository.getGroupById(id);
  }

  checkRepeat(name) {
    return groupRepository.checkRepeat(name);
  }

  getGroupListCount() {
    return groupRepository.getGroupListCount();
  }

  addMember(id, data) {
    return groupRepository.addMember(id, data);
  }

  delMember(id, uid) {
    return groupRepository.delMember(id, uid);
  }

  changeMemberRole(id, uid, role) {
    return groupRepository.changeMemberRole(id, uid, role);
  }

  checkMemberRepeat(id, uid) {
    return groupRepository.checkMemberRepeat(id, uid);
  }

  list() {
    return groupRepository.list();
  }

  getAuthList(uid) {
    return groupRepository.getAuthList(uid);
  }

  findByGroups(ids = []) {
    return groupRepository.findByGroups(ids);
  }

  del(id) {
    return groupRepository.del(id);
  }

  up(id, data) {
    return groupRepository.up(id, data);
  }

  getcustomFieldName(name) {
    return groupRepository.getcustomFieldName(name);
  }

  search(keyword) {
    return groupRepository.search(keyword);
  }
}

export default groupModel;
