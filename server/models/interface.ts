// @ts-nocheck
/**
 * 接口模型：委托关系型 interfaceRepository
 */
import baseModel from "./base.js";
import { interfaceRepository } from "../repositories/interface.repo.js";

class interfaceModel extends baseModel {
  getName() {
    return "interface";
  }

  save(data) {
    return interfaceRepository.save(data);
  }

  get(id) {
    return interfaceRepository.get(id);
  }

  getBaseinfo(id) {
    return interfaceRepository.getBaseinfo(id);
  }

  getVar(project_id, method) {
    return interfaceRepository.getVar(project_id, method);
  }

  getByQueryPath(project_id, path, method) {
    return interfaceRepository.getByQueryPath(project_id, path, method);
  }

  getByPath(project_id, path, method, select) {
    return interfaceRepository.getByPath(project_id, path, method, select);
  }

  checkRepeat(id, path, method) {
    return interfaceRepository.checkRepeat(id, path, method);
  }

  countByProjectId(id) {
    return interfaceRepository.countByProjectId(id);
  }

  list(project_id, select) {
    return interfaceRepository.list(project_id, select);
  }

  listWithPage(project_id, page, limit) {
    return interfaceRepository.listWithPage(project_id, page, limit);
  }

  listByPid(project_id) {
    return interfaceRepository.listByPid(project_id);
  }

  getInterfaceListCount() {
    return interfaceRepository.getInterfaceListCount();
  }

  listByCatid(catid, select) {
    return interfaceRepository.listByCatid(catid, select);
  }

  listByCatidWithPage(catid, page, limit) {
    return interfaceRepository.listByCatidWithPage(catid, page, limit);
  }

  listByOptionWithPage(option, page, limit) {
    return interfaceRepository.listByOptionWithPage(option, page, limit);
  }

  listByInterStatus(catid, status) {
    return interfaceRepository.listByInterStatus(catid, status);
  }

  del(id) {
    return interfaceRepository.del(id);
  }

  delByCatid(id) {
    return interfaceRepository.delByCatid(id);
  }

  delByProjectId(id) {
    return interfaceRepository.delByProjectId(id);
  }

  up(id, data) {
    return interfaceRepository.up(id, data);
  }

  upEditUid(id, uid) {
    return interfaceRepository.upEditUid(id, uid);
  }

  getcustomFieldValue(id, value) {
    return interfaceRepository.getcustomFieldValue(id, value);
  }

  listCount(option) {
    return interfaceRepository.listCount(option);
  }

  upIndex(id, index) {
    return interfaceRepository.upIndex(id, index);
  }

  search(keyword) {
    return interfaceRepository.search(keyword);
  }
}

export default interfaceModel;
